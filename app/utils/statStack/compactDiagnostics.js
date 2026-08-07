const sha256 = async (value) => { const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); };

const expandDeltas = (values = [], maximum = Infinity) => {
  let current = 0;
  return values.map((delta, index) => {
    if (!Number.isInteger(delta) || delta < 0 || (index > 0 && delta === 0)) {
      throw new Error("Stat Stack compact diagnostics contain invalid deltas.");
    }
    current = index === 0 ? delta : current + delta;
    if (current >= maximum) {
      throw new Error("Stat Stack compact diagnostics reference an invalid player index.");
    }
    return current;
  });
};

const predicateCache = new WeakMap();
const statValueCache = new WeakMap();

const decodedPredicate = (diagnostic, dataset) => {
  if (predicateCache.has(diagnostic)) return predicateCache.get(diagnostic);
  const [scope, mode, data] = diagnostic;
  if (!["P", "Y"].includes(scope) || !["I", "E"].includes(mode) || !Array.isArray(data)) {
    throw new Error("Stat Stack compact diagnostics are malformed.");
  }
  let decoded;
  if (scope === "P") {
    decoded = {
      scope,
      mode,
      players: new Set(expandDeltas(data, Number(dataset.playerCount))),
    };
  } else {
    const indexes = expandDeltas(
      data.map((entry) => entry?.[0]),
      Number(dataset.playerCount)
    );
    const seasonsByPlayer = new Map();
    indexes.forEach((playerIndex, index) => {
      if (!Array.isArray(data[index]) || !Array.isArray(data[index][1])) {
        throw new Error("Stat Stack compact diagnostics are malformed.");
      }
      seasonsByPlayer.set(
        playerIndex,
        new Set(
          expandDeltas(data[index][1]).map(
            (offset) => Number(dataset.seasonBase) + offset
          )
        )
      );
    });
    decoded = { scope, mode, seasonsByPlayer };
  }
  predicateCache.set(diagnostic, decoded);
  return decoded;
};

export const orderedPlayerIDChecksum = async (players = []) =>
  sha256(players.map((player) => String(player?.id || player?.playerID || "")).join("\n"));

export const verifyCompactPlayerDataset = async (payload, players = []) => {
  const dataset = payload?.playerDataset || {};
  if (Number(dataset.playerCount) !== players.length) {
    throw new Error("Stat Stack compact payload uses a different player index.");
  }
  const checksum = await orderedPlayerIDChecksum(players);
  if (checksum.toLowerCase() !== String(dataset.indexIDChecksum || "").toLowerCase()) {
    throw new Error("Stat Stack compact payload player index checksum failed.");
  }
};

export const compactEligibilityMatches = (
  diagnostic,
  playerIndex,
  season,
  dataset
) => {
  if (!diagnostic) return true;
  if (
    !Number.isInteger(playerIndex)
    || playerIndex < 0
    || playerIndex >= Number(dataset?.playerCount)
  ) {
    throw new Error("Stat Stack compact diagnostics reference an invalid player index.");
  }
  const decoded = decodedPredicate(diagnostic, dataset);
  const included = decoded.scope === "P"
    ? decoded.players.has(playerIndex)
    : decoded.seasonsByPlayer.get(playerIndex)?.has(Number(season)) || false;
  return decoded.mode === "I" ? included : !included;
};

export const getCompactIneligibleStatValue = (
  row,
  playerIndex,
  season,
  dataset
) => {
  if (statValueCache.has(row)) {
    return statValueCache.get(row).get(`${playerIndex}:${Number(season)}`) ?? null;
  }
  const values = row?.compactIneligibleStatValues || [];
  const indexes = expandDeltas(
    values.map((entry) => entry?.[0]),
    Number(dataset.playerCount)
  );
  const decoded = new Map();
  indexes.forEach((index, valueIndex) => {
    const seasonValues = values[valueIndex]?.[1];
    if (!Array.isArray(seasonValues)) {
      throw new Error("Stat Stack compact stat diagnostics are malformed.");
    }
    const offsets = expandDeltas(seasonValues.map((entry) => entry?.[0]));
    offsets.forEach((offset, seasonIndex) => {
      const value = Number(seasonValues[seasonIndex]?.[1]);
      if (!Number.isFinite(value)) {
        throw new Error("Stat Stack compact stat diagnostics are malformed.");
      }
      decoded.set(`${index}:${Number(dataset.seasonBase) + offset}`, value);
    });
  });
  statValueCache.set(row, decoded);
  return decoded.get(`${playerIndex}:${Number(season)}`) ?? null;
};
