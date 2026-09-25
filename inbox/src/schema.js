// The inbox creates its own tables on first use. A Deploy to Cloudflare
// button provisions the D1 database but runs no SQL, so a schema that waits
// for someone to apply it by hand would leave a fresh inbox broken.

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS state (
     k TEXT PRIMARY KEY,
     v TEXT
   )`,
  // One row per WhatsApp message, whichever way it went. chat is the
  // customer's WhatsApp number; direction is 'in' (from the customer) or
  // 'out' (from the business, sent from the app or via the API).
  `CREATE TABLE IF NOT EXISTS messages (
     id TEXT PRIMARY KEY,
     chat TEXT NOT NULL,
     direction TEXT NOT NULL,
     ts INTEGER NOT NULL,
     type TEXT NOT NULL,
     body TEXT,
     status TEXT,
     source TEXT NOT NULL,
     revoked INTEGER NOT NULL DEFAULT 0,
     received INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS messages_chat_ts ON messages (chat, ts)`,
  `CREATE INDEX IF NOT EXISTS messages_ts ON messages (ts)`,
  `CREATE TABLE IF NOT EXISTS contacts (
     wa_id TEXT PRIMARY KEY,
     name TEXT,
     updated INTEGER NOT NULL
   )`,
  // Webhook changes the inbox doesn't parse into messages (contact sync,
  // anything Meta adds later), kept briefly so they can be inspected.
  `CREATE TABLE IF NOT EXISTS events (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     received INTEGER NOT NULL,
     field TEXT NOT NULL,
     raw TEXT NOT NULL
   )`,
];
