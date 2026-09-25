// Turns a WhatsApp Cloud API webhook payload, as the relay forwards it, into
// rows. Three fields carry messages:
//
//   messages            a customer wrote to the business (value.messages)
//   smb_message_echoes  the business replied from the WhatsApp Business app
//   history             the one-off sync of up to 180 days of past chats
//
// Payload shapes follow Meta's webhook reference pages for each field.
// Status updates (value.statuses) are about the business's own outgoing
// messages being delivered or read, not about the business reading anything,
// so they're ignored.

const MAX_BODY = 4000;

export function extractBody(m) {
  if (!m || typeof m !== "object") return null;
  const t = m.type;
  const part = m[t];
  let s = null;
  if (t === "text") s = part && part.body;
  else if (["image", "video", "document", "audio", "sticker"].includes(t)) {
    const bits = [];
    if (part && part.filename) bits.push(part.filename);
    if (part && part.caption) bits.push(part.caption);
    s = `[${t}]` + (bits.length ? " " + bits.join(": ") : "");
  } else if (t === "location") {
    s = "[location] " + [part && part.name, part && part.address].filter(Boolean).join(", ");
  } else if (t === "contacts") {
    const names = (m.contacts || []).map((c) => c && c.name && c.name.formatted_name).filter(Boolean);
    s = "[contact card] " + names.join(", ");
  } else if (t === "reaction") {
    s = "[reaction] " + ((part && part.emoji) || "removed");
  } else if (t === "button") {
    s = "[button] " + ((part && part.text) || "");
  } else if (t === "interactive") {
    const r = part && (part.button_reply || part.list_reply);
    s = "[choice] " + ((r && r.title) || "");
  } else if (t === "media_placeholder") {
    s = "[media]";
  } else {
    s = `[${t || "unknown"}]`;
  }
  if (typeof s !== "string") return null;
  return s.length > MAX_BODY ? s.slice(0, MAX_BODY) + "…" : s;
}

function tsOf(m) {
  const n = parseInt(m && m.timestamp, 10);
  return Number.isFinite(n) ? n : null;
}

// Returns { messages, contacts, updates, revokes, state, unparsed }. Nothing
// here touches storage, so the parsing can be tested on its own.
export function parsePayload(payload) {
  const out = { messages: [], contacts: [], updates: [], revokes: [], state: {}, unparsed: [] };
  const entries = (payload && Array.isArray(payload.entry)) ? payload.entry : [];
  for (const entry of entries) {
    for (const change of (entry && entry.changes) || []) {
      const field = change && change.field;
      const value = (change && change.value) || {};
      if (field === "messages") parseMessages(value, out);
      else if (field === "smb_message_echoes") parseEchoes(value, out);
      else if (field === "history") parseHistory(value, out);
      else out.unparsed.push({ field: String(field || "unknown"), raw: change });
    }
  }
  return out;
}

function parseMessages(value, out) {
  for (const c of value.contacts || []) {
    const name = c && c.profile && c.profile.name;
    if (c && c.wa_id && name) out.contacts.push({ wa_id: String(c.wa_id), name: String(name) });
  }
  for (const m of value.messages || []) {
    const ts = tsOf(m);
    if (!m || !m.id || !m.from || ts === null) continue;
    out.messages.push({
      id: String(m.id), chat: String(m.from), direction: "in", ts,
      type: String(m.type || "unknown"), body: extractBody(m), status: null, source: "live",
    });
  }
}

function parseEchoes(value, out) {
  for (const m of value.message_echoes || []) {
    const ts = tsOf(m);
    if (!m || !m.id || !m.to || ts === null) continue;
    if (m.type === "revoke") {
      const orig = m.revoke && m.revoke.original_message_id;
      if (orig) out.revokes.push(String(orig));
      continue;
    }
    if (m.type === "edit") {
      const e = m.edit || {};
      if (e.original_message_id) {
        out.updates.push({ id: String(e.original_message_id), body: extractBody(e.message) });
      }
      continue;
    }
    out.messages.push({
      id: String(m.id), chat: String(m.to), direction: "out", ts,
      type: String(m.type || "unknown"), body: extractBody(m), status: null, source: "echo",
    });
  }
}

function parseHistory(value, out) {
  const business = value.metadata && value.metadata.display_phone_number;
  for (const h of value.history || []) {
    if (h && Array.isArray(h.errors) && h.errors.length) {
      const e = h.errors[0] || {};
      out.state.history_status = "declined";
      out.state.history_error = `${e.code || ""} ${e.title || e.message || ""}`.trim();
      continue;
    }
    const meta = (h && h.metadata) || {};
    if (meta.progress !== undefined) {
      out.state.history_status = Number(meta.progress) >= 100 ? "complete" : "syncing";
      out.state.history_progress = String(meta.progress);
    }
    for (const thread of (h && h.threads) || []) {
      const chat = thread && thread.id;
      if (!chat) continue;
      for (const m of thread.messages || []) {
        const ts = tsOf(m);
        if (!m || !m.id || ts === null) continue;
        const outgoing = business ? String(m.from) === String(business) : String(m.from) !== String(chat);
        out.messages.push({
          id: String(m.id), chat: String(chat), direction: outgoing ? "out" : "in", ts,
          type: String(m.type || "unknown"), body: extractBody(m),
          status: (m.history_context && m.history_context.status) || null, source: "history",
        });
      }
    }
  }
}
