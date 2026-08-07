import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  ONE_SIXTY_TWO_ZERO_POSITIONS,
  createOneSixtyTwoZeroSpins,
  decodeDiamondCombination,
  deriveOneSixtyTwoZeroRosterRating,
  deriveProjectedBaseballWins,
  findBestOneSixtyTwoZeroLineup,
  placeDiamondEntry,
  placePlayer,
  rerollOneSixtyTwoZeroSpin,
  validateOneSixtyTwoZeroCatalog,
} from "./gameLogic.js";

const catalog = JSON.parse(await readFile(
  new URL("../../public/data/one-sixty-two-zero.local.json", import.meta.url),
  "utf8",
));

test("the bundled catalog validates and every draft has five distinct draws", () => {
  const validated = validateOneSixtyTwoZeroCatalog(catalog);
  const spins = createOneSixtyTwoZeroSpins(validated.combinations, () => 0.5);
  assert.equal(spins.length, 5);
  assert.equal(new Set(spins.map(({ id }) => id)).size, 5);
});

test("decoded players inherit the team logo identity", () => {
  const whiteSox = catalog.combinations.find(({ id }) => id === "chicago-white-sox-2010");
  const decoded = decodeDiamondCombination(whiteSox);
  const joseAbreu = decoded.players.find(({ name }) => name === "Jose Abreu");
  assert.equal(joseAbreu.teamKey, "chicago-white-sox");
  assert.equal(joseAbreu.logoKey, "chicago-white-sox");
});

test("placing a new pick preserves each earlier pick's original team logo", () => {
  const spins = [
    { teamKey: "chicago-white-sox", teamName: "Chicago White Sox", logoKey: "chicago-white-sox" },
    { teamKey: "kansas-city-royals", teamName: "Kansas City Royals", logoKey: "kansas-city-royals" },
  ];
  const abreu = {
    id: "abreu", playerID: "abreu", name: "Jose Abreu", playerName: "Jose Abreu",
    roles: ["IF"], role: "IF", positions: ["IF", "FLEX"], rating: 90,
    ratingTenths: 900, round: 0, assignedPosition: "IF",
    logoKey: "kansas-city-royals", teamKey: "kansas-city-royals",
  };
  const royalsPlayer = {
    id: "royal", playerID: "royal", name: "Royal", playerName: "Royal",
    roles: ["OF"], role: "OF", positions: ["OF", "FLEX"], rating: 88,
    ratingTenths: 880,
  };
  const picks = placePlayer([abreu], royalsPlayer, "OF", spins[1], 1, spins);
  assert.equal(picks.find(({ playerID }) => playerID === "abreu").logoKey, "chicago-white-sox");
  assert.equal(picks.find(({ playerID }) => playerID === "royal").logoKey, "kansas-city-royals");
});

test("team and era rerolls preserve the requested half of the draw", () => {
  const spins = createOneSixtyTwoZeroSpins(catalog.combinations, () => 0.42);
  const current = spins[0];
  const team = rerollOneSixtyTwoZeroSpin({
    combinations: catalog.combinations, currentSpin: current, spins, type: "team", random: () => 0,
  });
  if (team) {
    assert.equal(team.decade, current.decade);
    assert.notEqual(team.franchiseKey || team.teamKey, current.franchiseKey || current.teamKey);
  }
  const era = rerollOneSixtyTwoZeroSpin({
    combinations: catalog.combinations, currentSpin: current, spins, type: "era", random: () => 0,
  });
  if (era) {
    assert.equal(era.franchiseKey || era.teamKey, current.franchiseKey || current.teamKey);
    assert.notEqual(era.decade, current.decade);
  }
});

test("lineup placement rearranges legal multi-position players", () => {
  const first = { id: "a", name: "A", roles: ["IF", "OF"], role: "IF", rating: 90 };
  const second = { id: "b", name: "B", roles: ["OF"], role: "OF", rating: 88 };
  let lineup = placeDiamondEntry({}, first, "OF");
  lineup = placeDiamondEntry(lineup, second, "OF");
  assert.equal(lineup.OF.id, "b");
  assert.equal(lineup.IF.id, "a");
});

test("native scoring reserves 162 wins for a 99-plus roster", () => {
  const lineup = Object.fromEntries(ONE_SIXTY_TWO_ZERO_POSITIONS.map((slot) => [slot, {
    id: slot, name: slot, role: slot === "FLEX" ? "DH" : slot, roles: [slot], rating: 100,
  }]));
  assert.equal(deriveOneSixtyTwoZeroRosterRating(lineup), 99.375);
  assert.equal(deriveProjectedBaseballWins(lineup), 162);
  lineup.IF.rating = 80;
  assert.ok(deriveProjectedBaseballWins(lineup) < 162);
});

test("optimal solution returns a complete legal lineup for a real draw", () => {
  const spins = createOneSixtyTwoZeroSpins(catalog.combinations, () => 0.37);
  const solution = findBestOneSixtyTwoZeroLineup(spins);
  assert.deepEqual(Object.keys(solution).sort(), [...ONE_SIXTY_TWO_ZERO_POSITIONS].sort());
  assert.equal(new Set(Object.values(solution).map(({ id }) => id)).size, 5);
});
