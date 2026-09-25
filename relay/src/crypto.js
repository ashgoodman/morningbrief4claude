// Small Web Crypto helpers. The inbox carries its own copy: each Worker has
// to stand alone in its folder for the Deploy to Cloudflare button.

const enc = new TextEncoder();

export function randomKey(bytes = 32) {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  return b64url(b);
}

export function b64url(bytes) {
  let s = "";
  for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function hex(bytes) {
  return Array.from(bytes, (x) => x.toString(16).padStart(2, "0")).join("");
}

function unhex(s) {
  if (typeof s !== "string" || s.length % 2 || /[^0-9a-f]/i.test(s)) return null;
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export async function sha256hex(text) {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(text))));
}

async function hmacKey(secret, usage) {
  return crypto.subtle.importKey("raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

export async function hmacHex(secret, message) {
  const key = await hmacKey(secret, "sign");
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(message))));
}

// crypto.subtle.verify compares in constant time, which a string === on two
// hex digests does not.
export async function hmacVerify(secret, message, sigHex) {
  const sig = unhex(sigHex);
  if (!sig || sig.length !== 32) return false;
  const key = await hmacKey(secret, "verify");
  return crypto.subtle.verify("HMAC", key, sig, enc.encode(message));
}

// Compares two secrets without leaking, through timing, how much of a guess
// was right. Hashing first makes the lengths equal.
export async function secretEquals(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || !a || !b) return false;
  const [x, y] = await Promise.all([sha256hex(a), sha256hex(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}
