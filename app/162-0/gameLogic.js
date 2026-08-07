export const ONE_SIXTY_TWO_ZERO_POSITIONS = ["P", "IF", "OF", "C", "FLEX"];
export const ONE_SIXTY_TWO_ZERO_ROSTER_CALIBRATION_OFFSET = 0.625;

export const ONE_SIXTY_TWO_ZERO_POSITION_COLORS = Object.freeze({
  FLEX: "#2BB7FF",
  OF: "#2ED39A",
  IF: "#F6A623",
  P: "#A879FF",
  C: "#FF647C",
});

// Calibrated against the current eligible season mass so the first draw lands
// at 1%, 2.5%, 4.5%, 7%, 10%, then 25% for each modern decade.
export const ONE_SIXTY_TWO_ZERO_DECADE_MULTIPLIERS = Object.freeze({
  1950: 0.17125,
  1960: 0.353092783505,
  1970: 0.51375,
  1980: 0.737692307692,
  1990: 1,
  2000: 2.283333333333,
  2010: 2.283333333333,
  2020: 3.805555555556,
});

export const displayOneSixtyTwoZeroRole = (role) =>
  String(role || "").toUpperCase() === "DH" ? "FLEX" : role;

export const getOneSixtyTwoZeroDisplayPositions = (
  entry = {},
  assignedPosition,
) => {
  const naturalPositions = [
    ...new Set(
      normalizeDiamondRoles(entry)
        .map(displayOneSixtyTwoZeroRole)
        .filter(Boolean),
    ),
  ];
  const realPositions = naturalPositions.filter(
    (position) => position !== "FLEX",
  );
  const declaredRole = displayOneSixtyTwoZeroRole(entry?.role);
  const primaryPosition =
    (declaredRole !== "FLEX" && realPositions.includes(declaredRole)
      ? declaredRole
      : realPositions[0]) ||
    declaredRole ||
    displayOneSixtyTwoZeroRole(assignedPosition) ||
    "FLEX";
  const assignedDisplayPosition = displayOneSixtyTwoZeroRole(assignedPosition);
  const positions = [
    primaryPosition,
    assignedDisplayPosition,
    ...naturalPositions,
    ...(eligibleOneSixtyTwoZeroSlots(entry).includes("FLEX") ? ["FLEX"] : []),
  ].filter(
    (position, index, values) =>
      position && values.indexOf(position) === index,
  );

  return positions;
};
export const ONE_SIXTY_TWO_ZERO_SCHEMA_VERSION = 1;
export const ONE_SIXTY_TWO_ZERO_COMPACT_SCHEMA_VERSION = 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const decodeDiamondCatalogEntry = (entry, teamKey) => {
  if (!Array.isArray(entry)) return entry;
  const [
    id,
    name,
    roles,
    role,
    season,
    rating,
    resumeBonus,
    offense,
    defense,
    availability,
    dominance,
    pitching,
    seasonStats,
  ] = entry;
  return {
    id,
    name,
    roles,
    role,
    season,
    teamKey,
    rating,
    resumeBonus,
    offense,
    defense,
    availability,
    dominance,
    pitching,
    seasonStats,
  };
};

export const mergeDiamondPlayerEntries = (entries = []) => {
  const playersByID = new Map();
  for (const entry of entries) {
    const key = String(entry?.id || "");
    if (!key) continue;
    const existing = playersByID.get(key);
    if (!existing) {
      playersByID.set(key, { ...entry, roles: [...(entry.roles || [])] });
      continue;
    }
    const roles = [...new Set([
      ...(existing.roles || []),
      ...(entry.roles || []),
      existing.role,
      entry.role,
    ].filter(Boolean))];
    const best = Number(entry.rating || 0) > Number(existing.rating || 0)
      ? entry
      : existing;
    playersByID.set(key, { ...best, roles });
  }
  return [...playersByID.values()];
};

export const decodeDiamondCombination = (combination) => ({
  ...combination,
  players: mergeDiamondPlayerEntries(
    (combination.players || []).map((entry) =>
      ({
        ...decodeDiamondCatalogEntry(entry, combination.teamKey),
        teamKey: combination.teamKey,
        teamName: combination.teamName,
        logoKey: combination.logoKey || combination.teamKey,
      }),
    ),
  ),
});

export const normalizeDiamondRoles = (entry = {}) => {
  const source = Array.isArray(entry.roles)
    ? entry.roles
    : String(entry.position || entry.role || "").toUpperCase().split(/[-/,]/);
  const roles = new Set();
  for (const raw of source) {
    const role = raw.trim();
    if (["P", "SP", "RP"].includes(role)) roles.add("P");
    if (["IF", "1B", "2B", "3B", "SS"].includes(role)) roles.add("IF");
    if (["OF", "LF", "CF", "RF"].includes(role)) roles.add("OF");
    if (role === "C") roles.add("C");
    if (role === "DH") roles.add("DH");
  }
  return [...roles];
};

export const eligibleOneSixtyTwoZeroSlots = (entry = {}) => {
  const roles = normalizeDiamondRoles(entry);
  const slots = new Set();
  if (roles.includes("P")) slots.add("P");
  if (roles.includes("IF")) slots.add("IF");
  if (roles.includes("OF")) slots.add("OF");
  if (roles.includes("C")) slots.add("C");
  if (roles.some((role) => ["IF", "OF", "C", "DH"].includes(role))) slots.add("FLEX");
  return [...slots];
};

export const deriveHitterRating = ({
  offense = 0,
  defense = 0,
  availability = 0,
  dominance = 0,
  resumeBonus = 0,
  isDH = false,
} = {}) =>
  clamp(
    Math.round(
      (isDH
        ? offense * 0.7 + availability * 0.15 + dominance * 0.15
        : offense * 0.45 + defense * 0.35 + availability * 0.1 + dominance * 0.1) +
        clamp(resumeBonus, 0, 8),
    ),
    0,
    100,
  );

export const derivePitcherRating = ({
  pitching = 0,
  availability = 0,
  dominance = 0,
  resumeBonus = 0,
} = {}) =>
  clamp(
    Math.round(
      pitching * 0.75 + availability * 0.1 + dominance * 0.15 + clamp(resumeBonus, 0, 8),
    ),
    0,
    100,
  );

export const assignDiamondLineup = (
  entries,
  positions = ONE_SIXTY_TWO_ZERO_POSITIONS,
  forced = {},
) => {
  const ordered = [...entries]
    .map((entry) => ({
      entry,
      slots: eligibleOneSixtyTwoZeroSlots(entry).filter(
        (slot) => positions.includes(slot) && (!forced[entry.id] || forced[entry.id] === slot),
      ),
    }))
    .sort((left, right) => left.slots.length - right.slots.length);
  const assignment = {};
  const visit = (index, used) => {
    if (index === ordered.length) return true;
    for (const slot of ordered[index].slots) {
      if (used.has(slot)) continue;
      used.add(slot);
      assignment[ordered[index].entry.id] = slot;
      if (visit(index + 1, used)) return true;
      used.delete(slot);
      delete assignment[ordered[index].entry.id];
    }
    return false;
  };
  return visit(0, new Set()) ? assignment : null;
};

export const hasDiamondLineupCoverage = (entries = []) => {
  const candidatesBySlot = Object.fromEntries(
    ONE_SIXTY_TWO_ZERO_POSITIONS.map((slot) => [
      slot,
      entries.filter((entry) => eligibleOneSixtyTwoZeroSlots(entry).includes(slot)),
    ]),
  );
  const orderedSlots = [...ONE_SIXTY_TWO_ZERO_POSITIONS].sort(
    (left, right) => candidatesBySlot[left].length - candidatesBySlot[right].length,
  );
  const visit = (index, usedIDs) => {
    if (index === orderedSlots.length) return true;
    return candidatesBySlot[orderedSlots[index]].some((entry) => {
      if (usedIDs.has(entry.id)) return false;
      usedIDs.add(entry.id);
      const valid = visit(index + 1, usedIDs);
      usedIDs.delete(entry.id);
      return valid;
    });
  };
  return visit(0, new Set());
};

export const placeDiamondEntry = (lineup, entry, targetSlot) => {
  if (!eligibleOneSixtyTwoZeroSlots(entry).includes(targetSlot)) return null;
  const currentPosition = Object.entries(lineup || {}).find(
    ([, value]) => value?.id === entry.id,
  )?.[0];
  const remainingSlots = ONE_SIXTY_TWO_ZERO_POSITIONS.filter(
    (slot) => slot !== targetSlot,
  );
  const existing = Object.entries(lineup || {})
    .filter(([, value]) => value?.id !== entry.id)
    .map(([assignedPosition, value]) => ({
      entry: value,
      assignedPosition,
      options: eligibleOneSixtyTwoZeroSlots(value).filter((slot) =>
        remainingSlots.includes(slot),
      ),
    }))
    .sort((left, right) => left.options.length - right.options.length);
  const assignments = {};
  const assignExisting = (index, usedSlots) => {
    if (index >= existing.length) return true;
    const candidate = existing[index];
    const options = [...candidate.options].sort((left, right) => {
      const occupiesTarget = candidate.assignedPosition === targetSlot;
      if (
        occupiesTarget &&
        left === currentPosition &&
        right !== currentPosition
      ) return -1;
      if (
        occupiesTarget &&
        right === currentPosition &&
        left !== currentPosition
      ) return 1;
      if (left === candidate.assignedPosition) return -1;
      if (right === candidate.assignedPosition) return 1;
      return (
        ONE_SIXTY_TWO_ZERO_POSITIONS.indexOf(left) -
        ONE_SIXTY_TWO_ZERO_POSITIONS.indexOf(right)
      );
    });
    for (const slot of options) {
      if (usedSlots.has(slot)) continue;
      assignments[candidate.entry.id] = slot;
      usedSlots.add(slot);
      if (assignExisting(index + 1, usedSlots)) return true;
      usedSlots.delete(slot);
      delete assignments[candidate.entry.id];
    }
    return false;
  };
  if (!assignExisting(0, new Set([targetSlot]))) return null;
  return Object.fromEntries([
    [targetSlot, { ...entry, assignedPosition: targetSlot }],
    ...existing.map(({ entry: existingEntry }) => {
      const assignedPosition = assignments[existingEntry.id];
      return [
        assignedPosition,
        { ...existingEntry, assignedPosition },
      ];
    }),
  ]);
};

export const deriveOneSixtyTwoZeroRosterRating = (lineup = {}) => {
  const hitters = ["IF", "OF", "C", "FLEX"].map((slot) => Number(lineup[slot]?.rating) || 0);
  const hitterRating = hitters.reduce((sum, value) => sum + value, 0) / hitters.length;
  const rawRating = hitterRating * 0.75 + Number(lineup.P?.rating || 0) * 0.25;
  return Math.max(0, rawRating - ONE_SIXTY_TWO_ZERO_ROSTER_CALIBRATION_OFFSET);
};

export const deriveProjectedBaseballWins = (lineup = {}) => {
  const total = deriveOneSixtyTwoZeroRosterRating(lineup);
  if (total <= 0) return 0;
  if (total >= 99) return 162;
  return clamp(Math.round(162 * Math.pow(total / 100, 2.35)), 0, 161);
};

const oneSixtyTwoZeroSelectionWeight = (item) =>
  Math.max(1, item.seasonCount || 1) *
  (ONE_SIXTY_TWO_ZERO_DECADE_MULTIPLIERS[item.decade] || 1);

export const createOneSixtyTwoZeroSpins = (combinations, random = Math.random) => {
  const pool = [...combinations];
  const spins = [];
  while (spins.length < 5 && pool.length) {
    const total = pool.reduce(
      (sum, item) => sum + oneSixtyTwoZeroSelectionWeight(item),
      0,
    );
    let target = random() * total;
    let index = 0;
    for (; index < pool.length; index += 1) {
      target -= oneSixtyTwoZeroSelectionWeight(pool[index]);
      if (target < 0) break;
    }
    const [item] = pool.splice(Math.min(index, pool.length - 1), 1);
    spins.push({ ...decodeDiamondCombination(item), round: spins.length });
  }
  if (spins.length !== 5) throw new Error("162-0 requires five unique team eras.");
  return spins;
};

export const rerollOneSixtyTwoZeroSpin = ({
  combinations,
  currentSpin,
  spins,
  type,
  random = Math.random,
}) => {
  const used = new Set(spins.map((spin) => spin.id));
  const currentFranchise = currentSpin.franchiseKey || currentSpin.teamKey;
  const candidates = combinations.filter((candidate) => {
    if (used.has(candidate.id)) return false;
    const candidateFranchise = candidate.franchiseKey || candidate.teamKey;
    if (type === "team")
      return candidate.decade === currentSpin.decade && candidateFranchise !== currentFranchise;
    if (type === "era")
      return candidateFranchise === currentFranchise && candidate.decade !== currentSpin.decade;
    return false;
  });
  if (!candidates.length) return null;
  const total = candidates.reduce(
    (sum, item) => sum + oneSixtyTwoZeroSelectionWeight(item),
    0,
  );
  let target = random() * total;
  return {
    ...decodeDiamondCombination(candidates.find((candidate) => {
      target -= oneSixtyTwoZeroSelectionWeight(candidate);
      return target < 0;
    }) || candidates[candidates.length - 1]),
    round: currentSpin.round,
  };
};

export const validateOneSixtyTwoZeroCatalog = (catalog) => {
  if (
    ![
      ONE_SIXTY_TWO_ZERO_SCHEMA_VERSION,
      ONE_SIXTY_TWO_ZERO_COMPACT_SCHEMA_VERSION,
    ].includes(catalog?.schemaVersion)
  )
    throw new Error("Unsupported 162-0 catalog.");
  if (!Array.isArray(catalog.combinations) || catalog.combinations.length < 5)
    throw new Error("162-0 catalog needs at least five team eras.");
  for (const combination of catalog.combinations) {
    const decoded = decodeDiamondCombination(combination);
    if (combination.seasonCount < 4 || !hasDiamondLineupCoverage(decoded.players || []))
      throw new Error(`Invalid 162-0 combination ${combination.id || "unknown"}.`);
  }
  return catalog;
};

export const rewardForBaseballWins = (wins) =>
  wins >= 162 ? 100 : wins >= 158 ? 40 : wins >= 138 ? 30 : wins >= 109 ? 20 : wins >= 83 ? 10 : 0;

export const dailyBestBaseballRewardDelta = ({ wins, attempts = [], attemptID }) => {
  const previousBestReward = Math.max(
    0,
    ...attempts
      .filter((attempt) => attempt.completed && attempt.id !== attemptID)
      .map((attempt) => rewardForBaseballWins(Number(attempt.projectedWins || 0))),
  );
  return Math.max(0, rewardForBaseballWins(wins) - previousBestReward);
};

const permutations = (values) => {
  if (values.length <= 1) return [values];
  return values.flatMap((value, index) =>
    permutations([...values.slice(0, index), ...values.slice(index + 1)])
      .map((rest) => [value, ...rest]),
  );
};

export const findBestOneSixtyTwoZeroLineup = (spins = []) => {
  if (spins.length !== ONE_SIXTY_TWO_ZERO_POSITIONS.length) return null;
  let best = null;
  let bestScore = -1;
  for (const slotsByRound of permutations(ONE_SIXTY_TWO_ZERO_POSITIONS)) {
    const optionsByRound = spins.map((spin, round) =>
      (spin.players || [])
        .filter((entry) => eligibleOneSixtyTwoZeroSlots(entry).includes(slotsByRound[round]))
        .map((entry) => {
          const assignedPosition = slotsByRound[round];
          return {
            ...entry,
            round,
            teamName: spin.teamName,
            teamKey: spin.teamKey,
            logoKey: spin.logoKey,
            assignedPosition,
            solutionContribution:
              Number(entry.rating || 0) * (assignedPosition === "P" ? 0.25 : 0.1875),
          };
        })
        .sort((left, right) => Number(right.rating || 0) - Number(left.rating || 0)),
    );
    if (optionsByRound.some((options) => !options.length)) continue;
    const suffixMaximum = new Array(optionsByRound.length + 1).fill(0);
    for (let index = optionsByRound.length - 1; index >= 0; index -= 1) {
      suffixMaximum[index] =
        suffixMaximum[index + 1] +
        Math.max(...optionsByRound[index].map((entry) => entry.solutionContribution));
    }
    const chosen = [];
    const visit = (round, score, usedIDs) => {
      if (score + suffixMaximum[round] <= bestScore) return;
      if (round === optionsByRound.length) {
        bestScore = score;
        best = Object.fromEntries(chosen.map((entry) => [entry.assignedPosition, entry]));
        return;
      }
      for (const entry of optionsByRound[round]) {
        if (usedIDs.has(entry.id)) continue;
        chosen.push(entry);
        usedIDs.add(entry.id);
        visit(round + 1, score + entry.solutionContribution, usedIDs);
        usedIDs.delete(entry.id);
        chosen.pop();
      }
    };
    visit(0, 0, new Set());
  }
  return best;
};

// Web adapter. The shared Blacktop interface expects flat picks; the native
// Diamond scorer uses a position-keyed lineup. Keeping the adapter here makes
// the browser game consume the exact native catalog and scoring rules.
export const POSITIONS = ONE_SIXTY_TWO_ZERO_POSITIONS;
export const POSITION_COLORS = ONE_SIXTY_TWO_ZERO_POSITION_COLORS;
export const formatSeason = (season) => String(Number(season) || season || "");

const webPlayer = (entry, combination, round = null) => ({
  ...entry,
  playerID: String(entry.id),
  playerName: entry.name,
  positions: eligibleOneSixtyTwoZeroSlots(entry),
  bestSeason: Number(entry.season),
  season: Number(entry.season),
  ratingTenths: Number(entry.rating || 0) * 10,
  offenseTenths: Number(entry.offense || 0) * 10,
  defenseTenths: Number(entry.defense || 0) * 10,
  reliabilityTenths: Number(entry.availability || 0) * 10,
  dominanceTenths: Number(entry.dominance || 0) * 10,
  pitchingTenths: Number(entry.pitching || 0) * 10,
  resumeBonusTenths: Number(entry.resumeBonus || 0) * 10,
  teamKey: combination?.teamKey,
  teamName: combination?.teamName,
  logoKey: combination?.logoKey,
  ...(round === null ? {} : { round }),
});

const webCombination = (combination) => ({
  ...combination,
  decadeEnd: combination.decade,
  players: (combination.players || []).map((entry) => webPlayer(entry, combination)),
});

export const createSpins = (combinations, count = 5, random = Math.random) =>
  createOneSixtyTwoZeroSpins(combinations, random).slice(0, count).map((spin) => ({
    ...spin,
    combinationID: spin.id,
    decadeEnd: spin.decade,
  }));

export const rerollSpin = ({ spin, combinations, spins, kind, random = Math.random }) => {
  const next = rerollOneSixtyTwoZeroSpin({
    currentSpin: spin, combinations, spins, type: kind, random,
  });
  return next ? { ...next, combinationID: next.id, decadeEnd: next.decade } : null;
};

const toNativeLineup = (picks = []) => Object.fromEntries(
  picks.map((pick) => [pick.assignedPosition, {
    ...pick,
    id: pick.id || pick.playerID,
    name: pick.name || pick.playerName,
    rating: Number(pick.rating ?? Number(pick.ratingTenths || 0) / 10),
  }]),
);

export const compatiblePositions = (player, picks = []) => POSITIONS.filter((slot) =>
  Boolean(placeDiamondEntry(toNativeLineup(picks), {
    ...player, id: player.id || player.playerID, name: player.name || player.playerName,
  }, slot)),
);

export function placePlayer(picks, player, target, combination, round, spins = []) {
  const nativePlayer = {
    ...player,
    id: player.id || player.playerID,
    name: player.name || player.playerName,
  };
  const next = placeDiamondEntry(toNativeLineup(picks), nativePlayer, target);
  if (!next) return null;
  return Object.entries(next).map(([assignedPosition, entry]) => {
    const prior = picks.find((pick) => String(pick.playerID) === String(entry.id));
    const entryRound = prior?.round ?? round;
    const sourceCombination = spins[Number(entryRound)] || combination;
    const normalized = webPlayer(entry, sourceCombination, entryRound);
    return { ...entry, ...normalized, assignedPosition };
  }).sort((left, right) => left.round - right.round);
}

export const searchPlayers = (players, query, picks = []) => {
  const normalized = String(query || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (normalized.replace(/\s/g, "").length < 3) return { status: "too_short", players: [] };
  const used = new Set(picks.map((pick) => String(pick.playerID)));
  const results = players.filter((player) => {
    const name = String(player.playerName || player.name || "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return name.startsWith(normalized) || name.split(" ").some((part) => part.startsWith(normalized));
  }).map((player) => {
    const normalizedPlayer = player.playerID ? player : webPlayer(player);
    const compatible = used.has(String(normalizedPlayer.playerID)) ? [] : compatiblePositions(normalizedPlayer, picks);
    return {
      ...normalizedPlayer,
      compatiblePositions: compatible,
      disabledReason: used.has(String(normalizedPlayer.playerID))
        ? "Already drafted in this lineup."
        : compatible.length ? null : "No roster position can be opened for this player.",
    };
  }).sort((left, right) => left.playerName.localeCompare(right.playerName));
  if (results.length > 8) return { status: "too_broad", players: [] };
  return { status: results.length ? "ready" : "empty", players: results };
};

function scoutingReport(lineup) {
  const picks = Object.values(lineup).filter(Boolean);
  if (!picks.length) return [{ tone: "weakness", text: "All five roster positions are empty." }];
  const best = [...picks].sort((a, b) => Number(b.rating) - Number(a.rating))[0];
  const weakest = [...picks].sort((a, b) => Number(a.rating) - Number(b.rating))[0];
  const pitcher = lineup.P;
  return [
    { tone: Number(best.rating) >= 90 ? "strength" : "neutral", text: `${best.name || best.playerName} is the roster's strongest season.` },
    { tone: Number(weakest.rating) < 75 ? "weakness" : "neutral", text: `${weakest.name || weakest.playerName} is the roster's lowest-rated season.` },
    pitcher
      ? { tone: Number(pitcher.rating) >= 90 ? "strength" : "neutral", text: `${pitcher.name || pitcher.playerName} anchors the pitching staff.` }
      : { tone: "weakness", text: "The roster is missing a pitcher." },
  ];
}

export function calculateResult(picks = []) {
  const lineup = toNativeLineup(picks);
  return {
    projectedWins: deriveProjectedBaseballWins(lineup),
    rosterRatingTenths: Math.round(deriveOneSixtyTwoZeroRosterRating(lineup) * 10),
    scoutingReport: scoutingReport(lineup),
  };
}

export function optimalSolution({ spins }) {
  const decodedSpins = spins.map((spin) => webCombination(spin));
  const lineup = findBestOneSixtyTwoZeroLineup(decodedSpins);
  if (!lineup) return null;
  const picks = Object.entries(lineup).map(([assignedPosition, entry]) => ({
    ...webPlayer(entry, entry, entry.round),
    ...entry,
    assignedPosition,
  })).sort((left, right) => left.round - right.round);
  return { picks, ...calculateResult(picks) };
}
