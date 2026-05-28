import { nip19, verifyEvent, type Event } from "nostr-tools";
import { CHALLENGE_TTL_MS, SESSION_TTL_MS } from "./config.ts";
import { db, type Session } from "./db.ts";

const HEX_PUBKEY = /^[0-9a-f]{64}$/;

export function normalizePubkey(value: string): string | null {
  const trimmed = value.trim();
  if (HEX_PUBKEY.test(trimmed)) return trimmed;
  if (trimmed.startsWith("npub1")) {
    try {
      const decoded = nip19.decode(trimmed);
      return decoded.type === "npub" && typeof decoded.data === "string" ? decoded.data : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function pubkeyToNpub(pubkey: string): string {
  return nip19.npubEncode(pubkey);
}

export function createChallenge(pubkey: string) {
  const now = Date.now();
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const expiresAt = now + CHALLENGE_TTL_MS;
  db.query(`
    INSERT INTO login_challenges(pubkey, nonce, expires_at, created_at)
    VALUES (?1, ?2, ?3, ?4)
    ON CONFLICT(pubkey) DO UPDATE SET nonce = excluded.nonce, expires_at = excluded.expires_at, created_at = excluded.created_at
  `).run(pubkey, nonce, expiresAt, now);
  return { nonce, expiresAt, content: `chat-wapp-login:${nonce}` };
}

export function verifyLoginEvent(event: Event) {
  if (!normalizePubkey(event.pubkey)) return { ok: false as const, error: "Invalid pubkey" };
  if (!verifyEvent(event)) return { ok: false as const, error: "Invalid signature" };
  const row = db.query("SELECT nonce, expires_at FROM login_challenges WHERE pubkey = ?1").get(event.pubkey) as
    | { nonce: string; expires_at: number }
    | null;
  if (!row) return { ok: false as const, error: "Challenge not found" };
  if (row.expires_at < Date.now()) return { ok: false as const, error: "Challenge expired" };
  if (event.content !== `chat-wapp-login:${row.nonce}`) return { ok: false as const, error: "Challenge mismatch" };
  if (Math.abs(event.created_at * 1000 - Date.now()) > CHALLENGE_TTL_MS) {
    return { ok: false as const, error: "Event timestamp out of range" };
  }

  const now = Date.now();
  const npub = pubkeyToNpub(event.pubkey);
  db.query(`
    INSERT INTO users(pubkey, npub, created_at, last_seen_at)
    VALUES (?1, ?2, ?3, ?3)
    ON CONFLICT(pubkey) DO UPDATE SET last_seen_at = excluded.last_seen_at
  `).run(event.pubkey, npub, now);
  db.query("DELETE FROM login_challenges WHERE pubkey = ?1").run(event.pubkey);

  const token = `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
  const expiresAt = now + SESSION_TTL_MS;
  db.query("INSERT INTO sessions(token, pubkey, expires_at, created_at) VALUES (?1, ?2, ?3, ?4)")
    .run(token, event.pubkey, expiresAt, now);

  return { ok: true as const, token, pubkey: event.pubkey, npub, expiresAt };
}

export function getBearerToken(req: Request): string | null {
  const raw = req.headers.get("authorization");
  if (!raw) return null;
  const [scheme, token] = raw.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token.trim() : null;
}

export function getSession(req: Request): Session | null {
  const token = getBearerToken(req);
  if (!token) return null;
  const row = db.query("SELECT token, pubkey, expires_at FROM sessions WHERE token = ?1").get(token) as
    | { token: string; pubkey: string; expires_at: number }
    | null;
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    db.query("DELETE FROM sessions WHERE token = ?1").run(token);
    return null;
  }
  return { token: row.token, pubkey: row.pubkey, expiresAt: row.expires_at };
}

export function cleanupExpiredAuthRows() {
  const now = Date.now();
  db.query("DELETE FROM sessions WHERE expires_at < ?1").run(now);
  db.query("DELETE FROM login_challenges WHERE expires_at < ?1").run(now);
}
