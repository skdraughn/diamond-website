import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("./normalizePlayers.js", import.meta.url), "utf8");
const { decodeMojibake, normalizePlayer } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
test("preserves correctly encoded names instead of treating Unicode as bytes", () => {
  for (const name of ["Nikola Jokić", "Luka Dončić", "José Ramírez", "Dennis Schröder", "Bobby Witt Jr."]) {
    assert.equal(decodeMojibake(name), name);
    assert.equal(/[\u0000-\u001f]/.test(decodeMojibake(name)), false);
  }
});
test("repairs UTF-8 mojibake and keeps accent-insensitive search", () => {
  assert.equal(decodeMojibake("Nikola Joki\u00c4\u0087"), "Nikola Jokić");
  assert.equal(decodeMojibake(String.raw`Nikola Joki\u0107`), "Nikola Jokić");
  assert.equal(normalizePlayer("Nikola Jokić"), "nikola jokic");
});
test("repairs the known MLB source typo without fuzzy name replacement", () => {
  assert.equal(decodeMojibake("Adgar RenterAa"), "Edgar Rentería");
  assert.equal(decodeMojibake("Rich Renteria"), "Rich Renteria");
});
