import test from "node:test";
import assert from "node:assert/strict";
import {
  canAssignDistinctStatStackPlayers,
  getStatStackSearchPlayers,
  verifyStatStackPayloadChecksum,
} from "./payload.js";
import { getStatStackSeasonChoices } from "./seasonEligibility.js";

test("compact player normalization supports Diamond's short keys", () => {
  assert.deepEqual(getStatStackSearchPlayers({}, [
    { id: "1", n: "Mike Trout", p: "RF", s: 2011, e: 2026 },
  ])[0], {
    playerID: "1", playerName: "Mike Trout", position: "RF", start: 2011, end: 2026, statStackIndex: 0,
  });
});

test("checksum verification accepts exact content and rejects tampering", async () => {
  const checksum = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
  assert.equal(await verifyStatStackPayloadChecksum("abc", checksum), true);
  await assert.rejects(() => verifyStatStackPayloadChecksum("abd", checksum), /checksum/i);
});

test("distinct-player validation detects collisions", () => {
  assert.equal(canAssignDistinctStatStackPlayers([new Set(["1"]), new Set(["2"])]), true);
  assert.equal(canAssignDistinctStatStackPlayers([new Set(["1"]), new Set(["1"])]), false);
});

test("season choices honor MLB's 1980 floor and payload maximum", () => {
  const choices = getStatStackSeasonChoices({ start: 1975, end: 1985 }, [], 1983);
  assert.deepEqual(choices.map(({ season }) => season), [1980, 1981, 1982, 1983]);
});
