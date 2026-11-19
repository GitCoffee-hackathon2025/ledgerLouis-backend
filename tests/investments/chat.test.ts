import { test } from "node:test";
import assert from "node:assert/strict";

import { buildCommand, createChatService } from "../../src/modules/investments/services/chat.service.js";
import type { ULID } from "../../src/domain/shared/id.js";

const alice = "01M7TNKNR59M4YFW6GXKGYJ41B" as ULID;
const bob = "01M7TNKNR59M4YFW6GXKGYJ41C" as ULID;

test("chat: a mensagem nunca vira argumento do CLI", () => {
  const args = buildCommand({ claudeBin: "claude" }, alice, "00000000-0000-4000-8000-000000000000", false);
  assert.equal(args.includes("--dangerously-skip-permissions"), false);
  assert.equal(args[1], "-p");
  assert.notEqual(args[2], undefined);
  assert.ok(args[2]!.startsWith("--")); // logo depois de -p vem uma opção nossa, não texto do usuário
});

test("chat: só o dono retoma a conversa", () => {
  const chat = createChatService({});
  const mine = chat.session(alice, null);
  assert.equal(mine.resume, false);

  assert.deepEqual(chat.session(alice, mine.sessionId), { sessionId: mine.sessionId, resume: true });

  const stolen = chat.session(bob, mine.sessionId);
  assert.equal(stolen.resume, false);
  assert.notEqual(stolen.sessionId, mine.sessionId);

  assert.equal(chat.session(alice, "00000000-0000-4000-8000-000000000000").resume, false); // id inventado
});
