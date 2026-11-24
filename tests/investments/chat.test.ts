import { test } from "node:test";
import assert from "node:assert/strict";

import { createChatService } from "../../src/modules/investments/services/chat.service.js";
import type { ULID } from "../../src/domain/shared/id.js";

const alice = "01M7TNKNR59M4YFW6GXKGYJ41B" as ULID;
const bob = "01M7TNKNR59M4YFW6GXKGYJ41C" as ULID;

test("chat: sem GEMINI_API_KEY o chat avisa que está desligado", async () => {
  const events: string[] = [];
  for await (const e of createChatService({}).run(alice, "oi", "00000000-0000-4000-8000-000000000000", false)) events.push(e);
  const last = JSON.parse(events.at(-1)!.replace(/^data: /, ""));
  assert.equal(last.is_error, true);
  assert.match(last.error, /GEMINI_API_KEY/);
});

test("chat: só o dono retoma a conversa", async () => {
  const redis = new Map<string, string>(); // faz o papel do Redis
  const chat = createChatService({
    sessions: { get: async (k) => redis.get(k) ?? null, set: async (k, v) => redis.set(k, v) },
  });
  const mine = await chat.session(alice, null);
  assert.equal(mine.resume, false);

  assert.deepEqual(await chat.session(alice, mine.sessionId), { sessionId: mine.sessionId, resume: true });

  const stolen = await chat.session(bob, mine.sessionId);
  assert.equal(stolen.resume, false);
  assert.notEqual(stolen.sessionId, mine.sessionId);

  assert.equal((await chat.session(alice, "00000000-0000-4000-8000-000000000000")).resume, false); // id inventado
});

test("chat: sem onde guardar o dono, nunca retoma", async () => {
  const chat = createChatService({});
  const first = await chat.session(alice, null);
  assert.equal((await chat.session(alice, first.sessionId)).resume, false);
});
