import { join } from "node:path";
import type { Event as NostrEvent } from "nostr-tools";
import { cleanupExpiredAuthRows, createChallenge, getSession, normalizePubkey, pubkeyToNpub, verifyLoginEvent } from "./auth.ts";
import { PORT, PUBLIC_ORIGIN } from "./config.ts";
import { db, mapChat, mapMessage, type Message } from "./db.ts";
import { buildPipelineTriggerRequest, startPreparedChatPipeline, type PipelineTriggerRequest } from "./pipeline.ts";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");

setInterval(cleanupExpiredAuthRows, 15 * 60 * 1000);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const text = (data: string, status = 200) =>
  new Response(data, { status, headers: { "content-type": "text/plain; charset=utf-8" } });

async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const value = await req.json();
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

async function serveStatic(pathname: string): Promise<Response> {
  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const file = Bun.file(join(PUBLIC_DIR, relativePath));
  if (await file.exists()) return new Response(file, { headers: { "cache-control": "no-store" } });
  const fallback = Bun.file(join(PUBLIC_DIR, "index.html"));
  if (await fallback.exists()) return new Response(fallback, { headers: { "cache-control": "no-store" } });
  return text("public/index.html missing", 500);
}

function requireSession(req: Request) {
  const session = getSession(req);
  if (!session) return null;
  return session;
}

function getChatForUser(chatId: string, pubkey: string) {
  const row = db.query("SELECT * FROM chats WHERE id = ?1 AND pubkey = ?2").get(chatId, pubkey) as Record<string, unknown> | null;
  return row ? mapChat(row) : null;
}

function listMessages(chatId: string, pubkey: string): Message[] {
  const rows = db.query("SELECT * FROM messages WHERE chat_id = ?1 AND pubkey = ?2 ORDER BY created_at ASC").all(chatId, pubkey) as Record<string, unknown>[];
  return rows.map(mapMessage);
}

function updateChatTitle(chatId: string, title: string) {
  db.query("UPDATE chats SET title = ?1, updated_at = ?2 WHERE id = ?3").run(title.slice(0, 80), Date.now(), chatId);
}

function webhookOrigin(req: Request): string {
  return PUBLIC_ORIGIN || new URL(req.url).origin;
}

async function handleApi(req: Request, url: URL): Promise<Response | null> {
  const { pathname } = url;

  if (pathname === "/api/health" && req.method === "GET") {
    return json({ ok: true, now: new Date().toISOString() });
  }

  if (pathname === "/api/auth/challenge" && req.method === "POST") {
    const body = await readJson(req);
    const pubkey = normalizePubkey(String(body.pubkey ?? ""));
    if (!pubkey) return json({ error: "pubkey must be a 64-char hex key or npub" }, 400);
    return json({ pubkey, npub: pubkeyToNpub(pubkey), ...createChallenge(pubkey) });
  }

  if (pathname === "/api/auth/verify" && req.method === "POST") {
    const body = await readJson(req);
    const event = body.event;
    if (!event || typeof event !== "object" || Array.isArray(event)) return json({ error: "event is required" }, 400);
    const result = verifyLoginEvent(event as NostrEvent);
    return result.ok ? json(result) : json({ error: result.error }, 401);
  }

  if (pathname === "/api/me" && req.method === "GET") {
    const session = requireSession(req);
    if (!session) return json({ error: "unauthorized" }, 401);
    return json({ pubkey: session.pubkey, npub: pubkeyToNpub(session.pubkey), expiresAt: session.expiresAt });
  }

  if (pathname === "/api/chats" && req.method === "GET") {
    const session = requireSession(req);
    if (!session) return json({ error: "unauthorized" }, 401);
    const rows = db.query(`
      SELECT c.*, (
        SELECT content FROM messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1
      ) AS preview
      FROM chats c
      WHERE c.pubkey = ?1
      ORDER BY c.updated_at DESC
    `).all(session.pubkey) as Record<string, unknown>[];
    return json({ chats: rows.map((row) => ({ ...mapChat(row), preview: String(row.preview ?? "") })) });
  }

  if (pathname === "/api/chats" && req.method === "POST") {
    const session = requireSession(req);
    if (!session) return json({ error: "unauthorized" }, 401);
    const now = Date.now();
    const id = crypto.randomUUID();
    db.query("INSERT INTO chats(id, pubkey, title, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)")
      .run(id, session.pubkey, "New chat", now);
    return json({ chat: getChatForUser(id, session.pubkey) }, 201);
  }

  const chatMessagesMatch = pathname.match(/^\/api\/chats\/([^/]+)\/messages$/);
  if (chatMessagesMatch && req.method === "GET") {
    const session = requireSession(req);
    if (!session) return json({ error: "unauthorized" }, 401);
    const chatId = decodeURIComponent(chatMessagesMatch[1]!);
    const chat = getChatForUser(chatId, session.pubkey);
    if (!chat) return json({ error: "chat not found" }, 404);
    return json({ chat, messages: listMessages(chatId, session.pubkey) });
  }

  if (chatMessagesMatch && req.method === "POST") {
    const session = requireSession(req);
    if (!session) return json({ error: "unauthorized" }, 401);
    const chatId = decodeURIComponent(chatMessagesMatch[1]!);
    const chat = getChatForUser(chatId, session.pubkey);
    if (!chat) return json({ error: "chat not found" }, 404);
    const body = await readJson(req);
    const content = String(body.content ?? "").trim();
    if (!content) return json({ error: "content is required" }, 400);
    if (content.length > 12000) return json({ error: "content is too long" }, 400);

    const now = Date.now();
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    const localRunId = crypto.randomUUID();
    const webhookToken = crypto.randomUUID().replaceAll("-", "");
    db.query("INSERT INTO messages(id, chat_id, pubkey, role, content, status, run_id, created_at) VALUES (?1, ?2, ?3, 'user', ?4, 'complete', ?5, ?6)")
      .run(userMessageId, chatId, session.pubkey, content, localRunId, now);
    db.query("INSERT INTO messages(id, chat_id, pubkey, role, content, status, run_id, created_at) VALUES (?1, ?2, ?3, 'assistant', '', 'pending', ?4, ?5)")
      .run(assistantMessageId, chatId, session.pubkey, localRunId, now + 1);
    if (chat.title === "New chat") updateChatTitle(chatId, content.replace(/\s+/g, " ").slice(0, 64));
    db.query("UPDATE chats SET updated_at = ?1 WHERE id = ?2").run(now, chatId);

    const history = listMessages(chatId, session.pubkey)
      .filter((msg) => msg.status === "complete" && (msg.role === "user" || msg.role === "assistant"))
      .slice(-30)
      .map((msg) => ({ role: msg.role, content: msg.content, createdAt: msg.createdAt }));

    const webhookUrl = `${webhookOrigin(req)}/api/pipeline-webhook`;
    const triggerRequest = buildPipelineTriggerRequest({
      chatId,
      userPubkey: session.pubkey,
      userNpub: pubkeyToNpub(session.pubkey),
      message: content,
      history,
      webhookUrl,
      webhookToken,
    });
    db.query(`
      INSERT INTO pipeline_runs(
        id, chat_id, user_message_id, assistant_message_id, trigger_status, webhook_token, trigger_payload_json, created_at, updated_at
      )
      VALUES (?1, ?2, ?3, ?4, 'awaiting-user-nip98', ?5, ?6, ?7, ?7)
    `).run(localRunId, chatId, userMessageId, assistantMessageId, webhookToken, JSON.stringify(triggerRequest), now);

    const autopilotAuthorization = typeof body.autopilotAuthorization === "string" ? body.autopilotAuthorization.trim() : "";
    if (!autopilotAuthorization) {
      return json({
        requiresAutopilotAuth: true,
        triggerRequest,
        messages: listMessages(chatId, session.pubkey),
        runId: localRunId,
      }, 202);
    }

    try {
      const result = await startPreparedChatPipeline(triggerRequest, autopilotAuthorization);
      db.query("UPDATE pipeline_runs SET trigger_status = ?1, autopilot_run_id = ?2, updated_at = ?3 WHERE id = ?4")
        .run(result.mode, result.runId, Date.now(), localRunId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      db.query("UPDATE messages SET status = 'error', content = ?1 WHERE id = ?2").run(message, assistantMessageId);
      db.query("UPDATE pipeline_runs SET trigger_status = 'error', error = ?1, updated_at = ?2 WHERE id = ?3")
        .run(message, Date.now(), localRunId);
    }

    return json({ messages: listMessages(chatId, session.pubkey), runId: localRunId }, 202);
  }

  const pipelineStartMatch = pathname.match(/^\/api\/pipeline-runs\/([^/]+)\/start$/);
  if (pipelineStartMatch && req.method === "POST") {
    const session = requireSession(req);
    if (!session) return json({ error: "unauthorized" }, 401);
    const runId = decodeURIComponent(pipelineStartMatch[1]!);
    const body = await readJson(req);
    const autopilotAuthorization = String(body.autopilotAuthorization ?? "").trim();
    if (!autopilotAuthorization) return json({ error: "autopilotAuthorization is required" }, 400);
    const run = db.query(`
      SELECT pr.*, c.pubkey
      FROM pipeline_runs pr
      JOIN chats c ON c.id = pr.chat_id
      WHERE pr.id = ?1 AND c.pubkey = ?2
    `).get(runId, session.pubkey) as Record<string, unknown> | null;
    if (!run) return json({ error: "pipeline run not found" }, 404);
    if (String(run.trigger_status) === "complete") {
      return json({ messages: listMessages(String(run.chat_id), session.pubkey), runId });
    }
    const rawTrigger = String(run.trigger_payload_json ?? "");
    if (!rawTrigger) return json({ error: "pipeline trigger payload missing" }, 409);
    let triggerRequest: PipelineTriggerRequest;
    try {
      triggerRequest = JSON.parse(rawTrigger) as PipelineTriggerRequest;
    } catch {
      return json({ error: "pipeline trigger payload is invalid" }, 409);
    }
    try {
      const result = await startPreparedChatPipeline(triggerRequest, autopilotAuthorization);
      db.query("UPDATE pipeline_runs SET trigger_status = ?1, autopilot_run_id = ?2, updated_at = ?3 WHERE id = ?4")
        .run(result.mode, result.runId, Date.now(), runId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      db.query("UPDATE messages SET status = 'error', content = ?1 WHERE id = ?2").run(message, String(run.assistant_message_id));
      db.query("UPDATE pipeline_runs SET trigger_status = 'error', error = ?1, updated_at = ?2 WHERE id = ?3")
        .run(message, Date.now(), runId);
    }
    return json({ messages: listMessages(String(run.chat_id), session.pubkey), runId });
  }

  if (pathname === "/api/pipeline-webhook" && req.method === "POST") {
    const body = await readJson(req);
    const token = req.headers.get("x-chat-wapp-token") || String(body.token ?? "");
    const chatId = String(body.chatId ?? "");
    const response = String(body.response ?? body.message ?? "").trim();
    const runId = String(body.runId ?? "");
    if (!chatId || !token || !response) return json({ error: "chatId, token, and response are required" }, 400);
    const run = db.query("SELECT * FROM pipeline_runs WHERE chat_id = ?1 AND webhook_token = ?2 ORDER BY created_at DESC LIMIT 1")
      .get(chatId, token) as Record<string, unknown> | null;
    if (!run) return json({ error: "webhook target not found" }, 404);
    const now = Date.now();
    db.query("UPDATE messages SET content = ?1, status = 'complete', run_id = ?2 WHERE id = ?3")
      .run(response, runId || String(run.id), String(run.assistant_message_id));
    db.query("UPDATE pipeline_runs SET trigger_status = 'complete', autopilot_run_id = COALESCE(?1, autopilot_run_id), updated_at = ?2 WHERE id = ?3")
      .run(runId || null, now, String(run.id));
    db.query("UPDATE chats SET updated_at = ?1 WHERE id = ?2").run(now, chatId);
    return json({ ok: true });
  }

  return null;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      const response = await handleApi(req, url);
      if (response) return response;
      return json({ error: "not found" }, 404);
    }
    return serveStatic(url.pathname);
  },
});

console.log(`chat-wapp listening on ${server.url}`);
