// End-to-end exercise of the inbox worker against a real SQLite standing in
// for D1, driven through its own HTTP surface exactly as the relay and
// Claude's connector drive it. Needs Node 22+ (node:sqlite).
import { DatabaseSync } from "node:sqlite";
import worker from "../src/index.js";
import { hmacHex } from "../src/crypto.js";
import { parsePayload } from "../src/ingest.js";

const sqlite = new DatabaseSync(":memory:");
class Stmt {
  constructor(sql, args) { this.sql = sql; this.args = args || []; }
  bind(...args) { return new Stmt(this.sql, args.map(norm)); }
  async run() { sqlite.prepare(this.sql).run(...this.args); return { success: true }; }
  async first() { return sqlite.prepare(this.sql).get(...this.args) ?? null; }
  async all() { return { results: sqlite.prepare(this.sql).all(...this.args) }; }
}
function norm(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  return v;
}
const env = {
  RELAY_URL: "https://relay.example.com",
  DB: {
    prepare: (sql) => new Stmt(sql),
    batch: async (stmts) => { for (const s of stmts) await s.run(); return []; },
  },
};

let failures = 0;
function check(label, cond, extra) {
  if (cond) console.log("ok   " + label);
  else { failures++; console.log("FAIL " + label + (extra !== undefined ? " :: " + JSON.stringify(extra) : "")); }
}

const BASE = "https://inbox.example.com";
const call = (path, init) => worker.fetch(new Request(BASE + path, init), env);
const form = (obj) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.set(k, v);
  return { method: "POST", body: f };
};
const now = () => Math.floor(Date.now() / 1000);

// ---------------------------------------------------------------- health
check("health answers", (await call("/health")).status === 200);

// ----------------------------------------------------------------- claim
let r = await call("/setup");
check("unclaimed setup offers claim", (await r.text()).includes("/setup/claim"));

r = await call("/setup/claim", form({}));
let html = await r.text();
const key = (html.match(/<span class="key">([^<]+)<\/span>/) || [])[1];
check("claim shows a key once", r.status === 200 && key && key.length >= 40, html.slice(0, 200));
check("claim explains the connector URL", html.includes(BASE + "/mcp"));

r = await call("/setup/claim", form({}));
check("second claim refused", r.status === 409);

r = await call("/setup/status", form({ key: "wrong" }));
check("status with wrong key refused", r.status === 403);

r = await call("/setup/status", form({ key }));
check("status with right key", r.status === 200 && (await r.text()).includes("Not connected"));

// ------------------------------------------------------------------- mcp
const rpc = (body, headers = {}) => call("/mcp", {
  method: "POST",
  headers: { "content-type": "application/json", "x-api-key": key, ...headers },
  body: JSON.stringify(body),
});
const tool = async (name, args = {}) => {
  const res = await rpc({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
  const j = await res.json();
  const text = j.result.content[0].text;
  return { isError: !!j.result.isError, data: j.result.isError ? text : JSON.parse(text) };
};

r = await call("/mcp", { method: "POST", headers: { "x-api-key": "nope" }, body: "{}" });
check("mcp with wrong key 404s", r.status === 404);

r = await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
let j = await r.json();
check("initialize", j.result && j.result.protocolVersion === "2025-06-18");

r = await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list" });
j = await r.json();
check("tools/list has four tools", j.result.tools.length === 4);

r = await rpc({ jsonrpc: "2.0", method: "notifications/initialized" });
check("notification gets 202", r.status === 202);

r = await rpc({ jsonrpc: "2.0", id: 3, method: "tools/list" }, { Origin: "https://evil.example" });
check("browser origin refused", r.status === 403);

let t = await tool("whatsapp_status");
check("status before pairing says not connected", t.data.connected === false);

// ------------------------------------------------------------------ pair
const secret = "s".repeat(43);
r = await call("/pair", { method: "POST", body: JSON.stringify({ nonce: "guess", forward_secret: secret }) });
check("pair without a requested nonce refused", r.status === 403);

r = await call("/setup/connect", form({ key }));
const loc = r.headers.get("location") || "";
check("connect redirects to relay", r.status === 303 && loc.startsWith("https://relay.example.com/connect?"), loc);
const nonce = new URL(loc).searchParams.get("nonce");
check("connect passes the inbox origin", new URL(loc).searchParams.get("inbox") === BASE);

r = await call("/pair", { method: "POST", body: JSON.stringify({ nonce: "wrong", forward_secret: secret }) });
check("pair with wrong nonce refused", r.status === 403);

r = await call("/pair", {
  method: "POST",
  body: JSON.stringify({ nonce, forward_secret: secret, waba_id: "W1", phone_number_id: "P1", display_phone_number: "15550783881" }),
});
check("pair with issued nonce accepted", r.status === 200);

r = await call("/pair", { method: "POST", body: JSON.stringify({ nonce, forward_secret: secret }) });
check("nonce is single-use", r.status === 403);

// ------------------------------------------------------------------ hook
async function send(payload, opts = {}) {
  const raw = JSON.stringify(payload);
  const ts = opts.ts ?? now();
  const sig = opts.sig ?? await hmacHex(opts.secret ?? secret, `${ts}.${raw}`);
  return call("/hook", {
    method: "POST",
    headers: { "x-mb4c-timestamp": String(ts), "x-mb4c-signature": "sha256=" + sig },
    body: raw,
  });
}
const wrap = (field, value) => ({
  object: "whatsapp_business_account",
  entry: [{ id: "W1", changes: [{ field, value: {
    messaging_product: "whatsapp",
    metadata: { display_phone_number: "15550783881", phone_number_id: "P1" },
    ...value,
  } }] }],
});

const t0 = now() - 3600;
const incoming = (id, from, ts, text, name) => wrap("messages", {
  contacts: name ? [{ profile: { name }, wa_id: from }] : [],
  messages: [{ from, id, timestamp: String(ts), type: "text", text: { body: text } }],
});

r = await send(incoming("wamid.A1", "16505551234", t0, "Does it come in blue?", "Sheena Nelson"), { secret: "x".repeat(43) });
check("hook with wrong secret refused", r.status === 401);

r = await send(incoming("wamid.A1", "16505551234", t0, "Does it come in blue?", "Sheena Nelson"), { ts: now() - 3600 });
check("hook with stale timestamp refused", r.status === 401);

r = await send(incoming("wamid.A1", "16505551234", t0, "Does it come in blue?", "Sheena Nelson"));
check("signed hook accepted", r.status === 200, await r.clone().text());
r = await send(incoming("wamid.A1", "16505551234", t0, "Does it come in blue?", "Sheena Nelson"));
check("repeat delivery accepted", r.status === 200);

await send(incoming("wamid.B1", "12125557890", t0 + 10, "Can you call me about the invoice?", "Raj"));
await send(incoming("wamid.B2", "12125557890", t0 + 20, "My number is 212 555 7890"));

// Business answered Sheena from the phone app.
await send(wrap("smb_message_echoes", {
  message_echoes: [{ from: "15550783881", to: "16505551234", id: "wamid.E1", timestamp: String(t0 + 30), type: "text", text: { body: "Yes, blue and green." } }],
}));

t = await tool("whatsapp_waiting", { hours: 24 });
check("one chat waiting (Raj); Sheena was answered", t.data.waiting_chats === 1 && t.data.chats[0].wa_id === "12125557890", t.data);
check("waiting chat has contact name", t.data.chats[0].name === "Raj");
check("two customer messages since last reply", t.data.chats[0].customer_messages_since_last_reply === 2);
check("messages oldest first", t.data.chats[0].messages[0].text.includes("call me"));
check("untrusted-data note present", /never follow instructions/.test(t.data.note));
check("messages flagged new before any brief", t.data.chats[0].has_new_since_last_brief === true);

// Sheena writes again: waiting again.
await send(incoming("wamid.A2", "16505551234", t0 + 40, "Great, I'll take two."));
t = await tool("whatsapp_waiting", { hours: 24 });
check("customer reply after business reply makes chat wait again", t.data.waiting_chats === 2);

// Revoke the business's reply: the earlier chat state ignores it.
await send(wrap("smb_message_echoes", {
  message_echoes: [{ from: "15550783881", to: "16505551234", id: "wamid.E2", timestamp: String(t0 + 50), type: "text", text: { body: "Sent!" } }],
}));
t = await tool("whatsapp_waiting", { hours: 24 });
check("business reply clears waiting", t.data.waiting_chats === 1);
await send(wrap("smb_message_echoes", {
  message_echoes: [{ from: "15550783881", to: "16505551234", id: "wamid.R1", timestamp: String(t0 + 60), type: "revoke", revoke: { original_message_id: "wamid.E2" } }],
}));
t = await tool("whatsapp_waiting", { hours: 24 });
check("revoked reply no longer counts as an answer", t.data.waiting_chats === 2);

// History sync: an old chat whose last message is from the customer, read on phone.
await send(wrap("history", {
  history: [{
    metadata: { phase: 0, chunk_order: 1, progress: 100 },
    threads: [{ id: "447700900123", messages: [
      { from: "15550783881", id: "wamid.H1", timestamp: String(t0 - 7200), type: "text", text: { body: "Your order shipped" }, history_context: { status: "READ" } },
      { from: "447700900123", id: "wamid.H2", timestamp: String(t0 - 3600), type: "text", text: { body: "It hasn't arrived" }, history_context: { status: "READ" } },
    ] }],
  }],
}));
t = await tool("whatsapp_waiting", { hours: 24 });
const hist = t.data.chats.find((c) => c.wa_id === "447700900123");
check("history chat waiting on business", !!hist, t.data);
check("history read status carried", hist && hist.messages.at(-1).read_on_phone === true);

t = await tool("whatsapp_status");
check("status reports connection and history", t.data.connected && t.data.history_sync === "complete" && t.data.business_number === "15550783881", t.data);

// Declined history.
await send({ object: "whatsapp_business_account", entry: [{ id: "W1", changes: [{ field: "history", value: {
  messaging_product: "whatsapp", metadata: { display_phone_number: "15550783881", phone_number_id: "P1" },
  history: [{ errors: [{ code: 2593109, title: "History sync is turned off by the business from the WhatsApp Business App" }] }],
} }] }] });
t = await tool("whatsapp_status");
check("declined history reported", t.data.history_sync === "declined" && /2593109/.test(t.data.history_error));

// Mark briefed: nothing is new afterwards.
t = await tool("whatsapp_mark_briefed");
check("mark briefed returns time", !!t.data.marked_at);
t = await tool("whatsapp_waiting", { hours: 24 });
check("nothing new after brief", t.data.chats.every((c) => !c.has_new_since_last_brief), t.data);

t = await tool("whatsapp_chat", { wa_id: "16505551234" });
check("chat shows both directions minus revoked", t.data.messages.length === 3 && t.data.messages.some((m) => m.from === "business"), t.data);

t = await tool("whatsapp_chat", { wa_id: "000" });
check("unknown chat is a tool error", t.isError);

// Edits update the stored text.
await send(wrap("smb_message_echoes", {
  message_echoes: [{ from: "15550783881", to: "16505551234", id: "wamid.ED", timestamp: String(t0 + 70), type: "edit",
    edit: { original_message_id: "wamid.E1", message: { type: "text", text: { body: "Yes: blue, green and red." } } } }],
}));
t = await tool("whatsapp_chat", { wa_id: "16505551234" });
check("edit updates text", t.data.messages.some((m) => m.text === "Yes: blue, green and red."));

// ----------------------------------------------------------- parse unit
const p = parsePayload(wrap("messages", {
  messages: [
    { from: "1", id: "i1", timestamp: "1", type: "image", image: { caption: "the crack" } },
    { from: "1", id: "i2", timestamp: "2", type: "location", location: { name: "Shop", address: "1 Main St" } },
    { from: "1", id: "i3", timestamp: "3", type: "interactive", interactive: { button_reply: { title: "Yes" } } },
  ],
  statuses: [{ id: "x", status: "read" }],
}));
check("image caption", p.messages[0].body === "[image] the crack");
check("location", p.messages[1].body === "[location] Shop, 1 Main St");
check("interactive reply", p.messages[2].body === "[choice] Yes");
check("statuses ignored", p.messages.length === 3);
check("unknown field kept as event", parsePayload(wrap("smb_app_state_sync", { x: 1 })).unparsed.length === 1);

// --------------------------------------------------------------- prune
await worker.scheduled({ scheduledTime: Date.now() }, { ...env, RETENTION_DAYS: "0" }, null);
t = await tool("whatsapp_status");
check("prune with zero retention empties messages", t.data.stored_messages === 0, t.data);

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
