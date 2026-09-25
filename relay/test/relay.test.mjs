// End to end: the relay and a real inbox worker, each on its own SQLite
// standing in for D1, with Meta's Graph API stubbed at fetch(). Drives the
// whole path: claim the inbox, connect WhatsApp, receive Meta's signed
// webhook, and read the message back through the inbox's MCP tools.
// Needs Node 22+ (node:sqlite).
import { DatabaseSync } from "node:sqlite";
import relay, { cleanInboxUrl } from "../src/index.js";
import inbox from "../../inbox/src/index.js";
import { hmacHex } from "../src/crypto.js";

function fakeD1() {
  const db = new DatabaseSync(":memory:");
  const norm = (v) => (v === undefined || v === null ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
  class Stmt {
    constructor(sql, args) { this.sql = sql; this.args = args || []; }
    bind(...a) { return new Stmt(this.sql, a.map(norm)); }
    async run() { db.prepare(this.sql).run(...this.args); return { success: true }; }
    async first() { return db.prepare(this.sql).get(...this.args) ?? null; }
    async all() { return { results: db.prepare(this.sql).all(...this.args) }; }
  }
  return {
    raw: db,
    prepare: (sql) => new Stmt(sql),
    batch: async (s) => { for (const x of s) await x.run(); return []; },
  };
}

let failures = 0;
function check(label, cond, extra) {
  if (cond) console.log("ok   " + label);
  else { failures++; console.log("FAIL " + label + (extra !== undefined ? " :: " + JSON.stringify(extra) : "")); }
}

const APP_SECRET = "app-secret-for-tests";
const RELAY = "https://relay.example.com";
const INBOX = "https://inbox.example.com";
const relayEnv = {
  DB: fakeD1(), META_APP_ID: "111", META_APP_SECRET: APP_SECRET, META_CONFIG_ID: "222",
  META_VERIFY_TOKEN: "verify-me", GRAPH_VERSION: "v21.0",
};
const inboxEnv = { DB: fakeD1(), RELAY_URL: RELAY };

// ------------------------------------------------------------ fetch stub
const graphCalls = [];
let inboxDown = false;
let historySyncFails = false;
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const req = new Request(input, init);
  const url = new URL(req.url);
  if (url.origin === INBOX) {
    if (inboxDown) return new Response("down", { status: 503 });
    return inbox.fetch(req, inboxEnv);
  }
  if (url.hostname === "graph.facebook.com") {
    const body = req.method === "POST" ? await req.text() : null;
    graphCalls.push({ method: req.method, path: url.pathname, query: url.search, auth: req.headers.get("authorization"), body });
    const ok = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json" } });
    if (url.pathname === "/v21.0/oauth/access_token") {
      return url.searchParams.get("code") === "good-code" && url.searchParams.get("client_secret") === APP_SECRET
        ? ok({ access_token: "biz-token" })
        : new Response(JSON.stringify({ error: { message: "Invalid code" } }), { status: 400 });
    }
    if (url.pathname === "/v21.0/9001/phone_numbers") return ok({ data: [{ id: "8001", display_phone_number: "+1 555-078-3881" }] });
    if (url.pathname === "/v21.0/9001/subscribed_apps") return ok({ success: true });
    if (url.pathname === "/v21.0/8001/smb_app_data") {
      if (historySyncFails && body.includes('"history"')) {
        return new Response(JSON.stringify({ error: { message: "sync window closed" } }), { status: 400 });
      }
      return ok({ request_id: "r1" });
    }
    return new Response("{}", { status: 404 });
  }
  return realFetch(input, init);
};

const callRelay = (path, init) => relay.fetch(new Request(RELAY + path, init), relayEnv);
const callInbox = (path, init) => inbox.fetch(new Request(INBOX + path, init), inboxEnv);
const form = (o) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return { method: "POST", body: f }; };

// ------------------------------------------------------- url validation
check("accepts https origin", cleanInboxUrl("https://mb4c-inbox.alice.workers.dev") === "https://mb4c-inbox.alice.workers.dev");
check("rejects http", cleanInboxUrl("http://x.example.com") === null);
check("rejects ip address", cleanInboxUrl("https://10.0.0.1") === null);
check("rejects localhost", cleanInboxUrl("https://localhost") === null);
check("rejects path", cleanInboxUrl("https://x.example.com/evil") === null);
check("rejects port", cleanInboxUrl("https://x.example.com:8443") === null);
check("rejects credentials", cleanInboxUrl("https://a:b@x.example.com") === null);

// ------------------------------------------------ subscription handshake
let r = await callRelay("/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345");
check("verify handshake echoes challenge", r.status === 200 && (await r.text()) === "12345");
r = await callRelay("/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345");
check("wrong verify token refused", r.status === 403);

// --------------------------------------------------------------- connect
r = await callInbox("/setup/claim", form({}));
const key = ((await r.text()).match(/<span class="key">([^<]+)<\/span>/) || [])[1];
check("inbox claimed", !!key);

r = await callInbox("/setup/connect", form({ key }));
const connectUrl = new URL(r.headers.get("location"));
check("inbox sends user to relay", connectUrl.origin === RELAY && connectUrl.pathname === "/connect");
const nonce = connectUrl.searchParams.get("nonce");

r = await callRelay(connectUrl.pathname + connectUrl.search);
let html = await r.text();
check("connect page served", r.status === 200 && html.includes("whatsapp_business_app_onboarding") && html.includes('"configId":"222"'));
check("connect page names the inbox", html.includes("inbox.example.com"));

r = await callRelay("/connect?inbox=http://evil&nonce=x");
check("connect page refuses a bad link", r.status === 400);

const complete = (body) => callRelay("/connect/complete", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
});

r = await complete({ code: "bad-code", waba_id: "9001", inbox: INBOX, nonce });
let j = await r.json();
check("bad code reported", !j.ok && /didn't accept/.test(j.error), j);

r = await complete({ code: "good-code", waba_id: "9001", inbox: INBOX, nonce: "not-the-issued-nonce-x" });
j = await r.json();
check("wrong nonce refused by inbox", !j.ok && /expired/.test(j.error), j);
check("no route stored after failed pairing", !(await relayEnv.DB.prepare("SELECT 1 FROM routes").first()));

graphCalls.length = 0;
r = await complete({ code: "good-code", waba_id: "9001", inbox: INBOX, nonce });
j = await r.json();
check("connect completes", j.ok && j.display_phone_number === "+1 555-078-3881" && j.warnings.length === 0, j);
check("subscribed to WABA with business token",
  graphCalls.some((c) => c.method === "POST" && c.path === "/v21.0/9001/subscribed_apps" && c.auth === "Bearer biz-token"));
check("contacts and history sync started",
  graphCalls.filter((c) => c.path === "/v21.0/8001/smb_app_data").map((c) => JSON.parse(c.body).sync_type).join() === "smb_app_state_sync,history");
check("phone registration skipped", !graphCalls.some((c) => c.path.endsWith("/register")));

const row = await relayEnv.DB.prepare("SELECT * FROM routes WHERE waba_id = '9001'").first();
check("route stored", row && row.inbox_url === INBOX && row.phone_number_id === "8001");
check("business token not stored", !JSON.stringify(row).includes("biz-token"));

// ------------------------------------------------------------- webhooks
async function metaSends(payload, secret = APP_SECRET) {
  const raw = JSON.stringify(payload);
  return callRelay("/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "x-hub-signature-256": "sha256=" + await hmacHex(secret, raw) },
    body: raw,
  });
}
const ts = String(Math.floor(Date.now() / 1000) - 60);
const msg = (waba, id, text) => ({
  object: "whatsapp_business_account",
  entry: [{ id: waba, changes: [{ field: "messages", value: {
    messaging_product: "whatsapp",
    metadata: { display_phone_number: "15550783881", phone_number_id: "8001" },
    contacts: [{ profile: { name: "Sheena Nelson" }, wa_id: "16505551234" }],
    messages: [{ from: "16505551234", id, timestamp: ts, type: "text", text: { body: text } }],
  } }] }],
});

r = await metaSends(msg("9001", "wamid.X1", "Hi"), "forged-secret");
check("forged Meta signature refused", r.status === 401);

r = await metaSends(msg("9001", "wamid.X1", "Is the shop open Sunday?"));
check("signed webhook forwarded", r.status === 200, await r.clone().text());

r = await metaSends(msg("5555", "wamid.X2", "someone else's"));
check("unknown WABA acknowledged, not forwarded", r.status === 200);

inboxDown = true;
r = await metaSends(msg("9001", "wamid.X3", "Hello?"));
check("inbox down makes Meta retry", r.status === 502);
const errRow = await relayEnv.DB.prepare("SELECT last_error FROM routes WHERE waba_id = '9001'").first();
check("forward failure recorded", /503/.test(errRow.last_error), errRow);
inboxDown = false;
r = await metaSends(msg("9001", "wamid.X3", "Hello?"));
check("retry succeeds", r.status === 200);

// Read it back as Claude would.
const res = await callInbox("/mcp", {
  method: "POST",
  headers: { "content-type": "application/json", "x-api-key": key },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "whatsapp_waiting", arguments: { hours: 1 } } }),
});
const data = JSON.parse((await res.json()).result.content[0].text);
check("message reached the inbox through the relay",
  data.waiting_chats === 1 && data.chats[0].name === "Sheena Nelson" &&
  data.chats[0].messages.map((m) => m.text).join("|") === "Is the shop open Sunday?|Hello?", data);
check("relay kept no message content",
  !JSON.stringify(relayEnv.DB.raw.prepare("SELECT * FROM routes").all()).includes("Sunday"));

// --------------------------------------------- partial sync failure
r = await callInbox("/setup/connect", form({ key }));
const nonce2 = new URL(r.headers.get("location")).searchParams.get("nonce");
historySyncFails = true;
r = await complete({ code: "good-code", waba_id: "9001", inbox: INBOX, nonce: nonce2 });
j = await r.json();
check("history sync failure is a warning, not a failure", j.ok && j.warnings.length === 1 && /chat history/.test(j.warnings[0]), j);

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
