import test from "node:test";
import assert from "node:assert/strict";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};
globalThis.window = { dispatchEvent() {} };
globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options?.detail; } };

const { easternDate, emptyState, persistState, readState, recordStats } = await import("./storage.js");

test("Eastern date rollover is independent of the browser timezone", () => {
  assert.equal(easternDate(new Date("2026-08-08T03:59:59Z")), "2026-08-07");
  assert.equal(easternDate(new Date("2026-08-08T04:00:00Z")), "2026-08-08");
});

test("state recovery keeps at most two same-day attempts and resets the next day", () => {
  const state = { ...emptyState("2026-08-07"), attempts: [{ id: 1 }, { id: 2 }, { id: 3 }] };
  assert.equal(persistState(state), true);
  assert.deepEqual(readState("2026-08-07").attempts.map(({ id }) => id), [2, 3]);
  assert.equal(readState("2026-08-08").attempts.length, 0);
});

test("statistics count a 162-win result as perfect", () => {
  const next = recordStats({ played: 1, totalWins: 100, bestWins: 100, perfectSeasons: 0 }, 162);
  assert.deepEqual(next, { played: 2, totalWins: 262, bestWins: 162, perfectSeasons: 1 });
});
