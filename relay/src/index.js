// MB4C relay, on Cloudflare Workers + D1. One instance, run by the MB4C
// operator, who is the Meta Tech Provider.
//
// It does two jobs and stores as little as it can:
//
//   1. "Connect WhatsApp". A business's own inbox sends them here with a
//      one-time pairing nonce. They go through Meta's Embedded Signup (the
//      WhatsApp Business app / coexistence flow), and the relay exchanges the
//      returned code for a business token, hands the inbox a fresh forwarding
//      key, subscribes to the business's webhooks and starts the contacts and
//      history sync. The business token is used during that request and then
//      dropped; it is never stored.
//
//   2. Webhooks. Meta signs every delivery with the app secret. The relay
//      checks that signature (nobody else can: the secret is the relay's),
//      looks up which inbox owns the WhatsApp Business Account, and forwards
//      the payload there, signed with that inbox's forwarding key. Nothing
//      in the payload is written down. If a forward fails the relay answers
//      Meta with an error, so Meta retries (for up to 7 days).
//
// Stored per business: WABA id, phone number id, display number, inbox URL,
// forwarding key, and timestamps. That's all.
//
// Routes:
//   GET  /health
//   GET  /webhook              Meta's subscription verification
//   POST /webhook              Meta's signed deliveries
//   GET  /connect              the Embedded Signup page
//   POST /connect/complete     the page's result: code + WABA id

import { randomKey, hmacHex, hmacVerify, secretEquals } from "./crypto.js";

const FORWARD_TIMEOUT_MS = 10000;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS routes (
     waba_id TEXT PRIMARY KEY,
     phone_number_id TEXT,
     display_phone_number TEXT,
     inbox_url TEXT NOT NULL,
     forward_secret TEXT NOT NULL,
     created INTEGER NOT NULL,
     last_forward_at INTEGER,
     last_error TEXT
   )`,
];

const now = () => Math.floor(Date.now() / 1000);

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "content-type": "application/json" },
  });
}

let schemaReady = null;
function ensureSchema(env) {
  if (!schemaReady) {
    schemaReady = (async () => {
      for (const sql of SCHEMA) await env.DB.prepare(sql).run();
    })().catch((e) => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

function graph(env, path) {
  return `https://graph.facebook.com/${env.GRAPH_VERSION}/${path}`;
}

// The inbox URL arrives from a browser, so it's checked before the relay
// ever sends anything to it: https, a hostname rather than an address, no
// path, credentials or port.
export function cleanInboxUrl(s) {
  let u;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
  if (u.pathname !== "/" || u.search || u.hash) return null;
  const h = u.hostname;
  if (!h.includes(".") || /^[\d.]+$/.test(h) || h.includes(":") || h === "localhost" || h.endsWith(".localhost")) return null;
  return u.origin;
}

// ------------------------------------------------------------- webhooks

async function verifySubscription(url, env) {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge") || "";
  if (mode === "subscribe" && await secretEquals(token, env.META_VERIFY_TOKEN)) {
    return new Response(challenge, { status: 200, headers: { "content-type": "text/plain" } });
  }
  return json({ error: "forbidden" }, 403);
}

async function forward(route, body) {
  const ts = now();
  const sig = await hmacHex(route.forward_secret, `${ts}.${body}`);
  const res = await fetch(route.inbox_url + "/hook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-mb4c-timestamp": String(ts),
      "x-mb4c-signature": "sha256=" + sig,
    },
    body,
    signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`inbox answered ${res.status}`);
}

async function receive(request, env) {
  const raw = await request.text();
  const sig = (request.headers.get("x-hub-signature-256") || "").replace(/^sha256=/, "");
  if (!(await hmacVerify(env.META_APP_SECRET, raw, sig))) return json({ error: "bad signature" }, 401);

  let payload;
  try { payload = JSON.parse(raw); } catch { return json({ error: "bad json" }, 400); }
  if (!payload || payload.object !== "whatsapp_business_account" || !Array.isArray(payload.entry)) {
    return json({ ok: true, ignored: true });
  }

  // Entries are keyed by WABA id. Group them so each inbox gets one request.
  const byWaba = new Map();
  for (const e of payload.entry) {
    if (!e || !e.id) continue;
    const id = String(e.id);
    if (!byWaba.has(id)) byWaba.set(id, []);
    byWaba.get(id).push(e);
  }

  let failed = 0;
  for (const [wabaId, entries] of byWaba) {
    const route = await env.DB.prepare("SELECT * FROM routes WHERE waba_id = ?").bind(wabaId).first();
    if (!route) continue;   // not ours (or disconnected): nothing to deliver
    const body = JSON.stringify({ object: payload.object, entry: entries });
    try {
      await forward(route, body);
      await env.DB.prepare("UPDATE routes SET last_forward_at = ?, last_error = NULL WHERE waba_id = ?")
        .bind(now(), wabaId).run();
    } catch (e) {
      failed++;
      await env.DB.prepare("UPDATE routes SET last_error = ? WHERE waba_id = ?")
        .bind(`${new Date().toISOString()} ${String(e && e.message || e).slice(0, 200)}`, wabaId).run();
    }
  }
  // A failure makes Meta retry the whole delivery; inboxes ignore repeats.
  return failed ? json({ error: "forward failed" }, 502) : json({ ok: true });
}

// -------------------------------------------------------------- connect

const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function page(title, bodyHtml, status = 200, extraHead = "") {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{--bg:#fbfaf7;--fg:#1d1d1b;--muted:#6b6a65;--card:#fff;--line:#e4e1d8;--accent:#1f6f4a;--bad:#a4352b}
@media (prefers-color-scheme:dark){:root{--bg:#171715;--fg:#ecebe6;--muted:#a3a19a;--card:#21211e;--line:#34332f;--accent:#5cc28f;--bad:#ef8a7f}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}
main{max-width:640px;margin:0 auto;padding:32px 16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:20px;margin:16px 0}
button{background:#1877f2;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:16px;font-weight:600;cursor:pointer}
button[disabled]{opacity:.5;cursor:default}
.muted{color:var(--muted)} .bad{color:var(--bad)} .good{color:var(--accent)}
</style>${extraHead}</head><body><main><h1>${esc(title)}</h1>${bodyHtml}</main></body></html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer" },
  });
}

function connectPage(env, inbox, nonce) {
  const cfg = JSON.stringify({
    appId: env.META_APP_ID, configId: env.META_CONFIG_ID, version: env.GRAPH_VERSION, inbox, nonce,
  }).replace(/</g, "\\u003c");
  const script = `<script>
const CFG = ${cfg};
let code = null, session = null, sent = false;
const out = (html) => { document.getElementById("result").innerHTML = html; };
window.fbAsyncInit = function () {
  FB.init({ appId: CFG.appId, autoLogAppEvents: true, xfbml: true, version: CFG.version });
  document.getElementById("go").disabled = false;
};
window.addEventListener("message", (event) => {
  if (!event.origin.endsWith("facebook.com")) return;
  let data; try { data = JSON.parse(event.data); } catch { return; }
  if (!data || data.type !== "WA_EMBEDDED_SIGNUP") return;
  if (String(data.event || "").startsWith("FINISH")) { session = data.data || {}; finish(); }
  else if (data.event === "CANCEL") out('<p class="bad">Setup was cancelled before it finished. You can try again.</p>');
});
function finish() {
  if (sent || !code || !session || !session.waba_id) return;
  sent = true;
  out('<p>Connecting your number…</p>');
  fetch("/connect/complete", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, waba_id: session.waba_id, phone_number_id: session.phone_number_id || null, inbox: CFG.inbox, nonce: CFG.nonce }),
  }).then((r) => r.json()).then((j) => {
    if (j.ok) {
      out('<p class="good"><b>Connected.</b> New WhatsApp messages will now reach your inbox.' +
        (j.warnings && j.warnings.length ? '</p><p class="bad">' + j.warnings.map((w) => w.replace(/[<>&]/g, "")).join("<br>") : '') +
        '</p><p><a href="' + CFG.inbox + '/setup">Back to your inbox</a></p>');
    } else {
      out('<p class="bad">That didn\\'t work: ' + String(j.error || "unknown error").replace(/[<>&]/g, "") + '</p>');
      sent = false;
    }
  }).catch(() => { out('<p class="bad">Couldn\\'t reach the relay. Try again.</p>'); sent = false; });
}
function launch() {
  FB.login((response) => {
    if (response.authResponse && response.authResponse.code) { code = response.authResponse.code; finish(); }
    else out('<p class="bad">Facebook sign-in didn\\'t complete. You can try again.</p>');
  }, {
    config_id: CFG.configId,
    response_type: "code",
    override_default_response_type: true,
    extras: { setup: {}, featureType: "whatsapp_business_app_onboarding", sessionInfoVersion: "3" },
  });
}
</script>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>`;
  return page("Connect WhatsApp", `
<div class="card">
<p>You'll sign in with Facebook, then choose <b>connect your existing WhatsApp Business app</b> and follow the steps on your phone.</p>
<ul>
<li>You keep using the WhatsApp Business app exactly as before.</li>
<li>When the app asks whether to share your chat history, say yes if you want the last 180 days included.</li>
<li>Group chats are not included; Meta doesn't provide them.</li>
<li>Your messages go to your own inbox at <b>${esc(new URL(inbox).hostname)}</b>. This relay passes them on and keeps no copy.</li>
</ul>
<p><button id="go" onclick="launch()" disabled>Continue with Facebook</button></p>
<div id="result" aria-live="polite"></div>
</div>
<p class="muted">You need WhatsApp Business app version 2.24.17 or newer.</p>`, 200, script);
}

async function graphJson(res) {
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.error) {
    const m = (j.error && (j.error.error_user_msg || j.error.message)) || `HTTP ${res.status}`;
    throw new Error(m);
  }
  return j;
}

async function complete(request, env) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "bad request" }, 400); }
  const inbox = cleanInboxUrl(b && b.inbox);
  const wabaId = b && /^\d{1,25}$/.test(String(b.waba_id)) ? String(b.waba_id) : null;
  const code = b && typeof b.code === "string" && b.code.length < 2000 ? b.code : null;
  const nonce = b && typeof b.nonce === "string" && /^[\w-]{16,64}$/.test(b.nonce) ? b.nonce : null;
  if (!inbox || !wabaId || !code || !nonce) return json({ ok: false, error: "missing or invalid details" }, 400);

  // The code lives for 30 seconds: exchange it first.
  let token;
  try {
    const q = new URLSearchParams({ client_id: env.META_APP_ID, client_secret: env.META_APP_SECRET, code });
    const j = await graphJson(await fetch(graph(env, "oauth/access_token?" + q)));
    token = j.access_token;
    if (!token) throw new Error("no token returned");
  } catch (e) {
    return json({ ok: false, error: "Meta didn't accept the sign-in: " + e.message }, 502);
  }
  const auth = { authorization: "Bearer " + token };

  // The coexistence flow reports the WABA; find its phone number.
  let phone;
  try {
    const j = await graphJson(await fetch(graph(env, `${wabaId}/phone_numbers?fields=id,display_phone_number`), { headers: auth }));
    const list = Array.isArray(j.data) ? j.data : [];
    phone = list.find((p) => String(p.id) === String(b.phone_number_id)) || list[0];
    if (!phone) throw new Error("no phone number on this account");
  } catch (e) {
    return json({ ok: false, error: "Couldn't read the WhatsApp number: " + e.message }, 502);
  }

  // Hand the inbox its forwarding key. The nonce proves the inbox asked.
  const forwardSecret = randomKey(32);
  try {
    const res = await fetch(inbox + "/pair", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nonce, forward_secret: forwardSecret, waba_id: wabaId,
        phone_number_id: String(phone.id), display_phone_number: phone.display_phone_number || null,
      }),
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(res.status === 403 ? "the pairing link expired; start again from your inbox" : `inbox answered ${res.status}`);
  } catch (e) {
    return json({ ok: false, error: "Couldn't reach your inbox: " + e.message }, 502);
  }

  // Route before subscribing, so the history sync that follows has somewhere to go.
  await env.DB.prepare(
    "INSERT INTO routes (waba_id, phone_number_id, display_phone_number, inbox_url, forward_secret, created) " +
    "VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(waba_id) DO UPDATE SET phone_number_id = excluded.phone_number_id, " +
    "display_phone_number = excluded.display_phone_number, inbox_url = excluded.inbox_url, " +
    "forward_secret = excluded.forward_secret, last_error = NULL",
  ).bind(wabaId, String(phone.id), phone.display_phone_number || null, inbox, forwardSecret, now()).run();

  const warnings = [];
  try {
    await graphJson(await fetch(graph(env, `${wabaId}/subscribed_apps`), { method: "POST", headers: auth }));
  } catch (e) {
    await env.DB.prepare("DELETE FROM routes WHERE waba_id = ?").bind(wabaId).run();
    return json({ ok: false, error: "Couldn't subscribe to your messages: " + e.message }, 502);
  }
  // Contacts, then history. Meta requires both within 24 hours of onboarding;
  // the number is already registered, so registration is skipped.
  for (const [syncType, label] of [["smb_app_state_sync", "contacts"], ["history", "chat history"]]) {
    try {
      await graphJson(await fetch(graph(env, `${phone.id}/smb_app_data`), {
        method: "POST",
        headers: { ...auth, "content-type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", sync_type: syncType }),
      }));
    } catch (e) {
      warnings.push(`The ${label} sync didn't start (${e.message}). New messages still arrive; to retry, connect again from your inbox within 24 hours.`);
    }
  }
  return json({ ok: true, display_phone_number: phone.display_phone_number || null, warnings });
}

// ----------------------------------------------------------------- entry

function configured(env) {
  return env.DB && env.META_APP_ID && env.META_APP_SECRET && env.META_CONFIG_ID &&
    env.META_VERIFY_TOKEN && env.GRAPH_VERSION;
}

async function route(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === "/health") return json({ ok: true });
  if (!configured(env)) return json({ error: "relay not configured" }, 500);
  await ensureSchema(env);

  if (path === "/webhook" && request.method === "GET") return verifySubscription(url, env);
  if (path === "/webhook" && request.method === "POST") return receive(request, env);

  if (path === "/connect" && request.method === "GET") {
    const inbox = cleanInboxUrl(url.searchParams.get("inbox"));
    const nonce = url.searchParams.get("nonce") || "";
    if (!inbox || !/^[\w-]{16,64}$/.test(nonce)) {
      return page("Start from your inbox", `<p class="bad">This link is incomplete. Open your own inbox's <code>/setup</code> page and click <b>Connect WhatsApp</b> there.</p>`, 400);
    }
    return connectPage(env, inbox, nonce);
  }
  if (path === "/connect/complete" && request.method === "POST") return complete(request, env);
  return json({ error: "not found" }, 404);
}

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (e) {
      return json({ error: "server error" }, 500);
    }
  },
};
