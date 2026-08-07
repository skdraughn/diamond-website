const sha256 = async (value) => { const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); };
const STAT_STACK_ROW_COUNT = 5;
import {
  hasStatStackLogo,
  isStatStackLogoValidForSeason,
} from "../statStackLogos.js";
import {
  compactEligibilityMatches,
  getCompactIneligibleStatValue,
  verifyCompactPlayerDataset,
} from "./compactDiagnostics.js";

export const STAT_STACK_PAYLOAD_SCHEMA_VERSION = 5;
export const STAT_STACK_SUPPORTED_PAYLOAD_VERSIONS = new Set([1, 5]);

const requiredString = (value, label) => {
  if (!String(value || "").trim()) throw new Error(`Missing ${label}.`);
};

const normalizeSharedPlayer = (player, statStackIndex) => ({
  playerID: String(player?.id || player?.playerID || ""),
  playerName: String(player?.n || player?.name || player?.playerName || ""),
  position: String(player?.p || player?.pos || player?.position || ""),
  start: Number(player?.s ?? player?.start),
  end: Number(player?.e ?? player?.end),
  statStackIndex,
});

const eligibilityMatches = (eligibility, playerID, season) => {
  if (!eligibility) return true;
  const [scope, data] = eligibility;
  if (scope === "P") return data.includes(String(playerID));
  const match = data.find(([id]) => String(id) === String(playerID));
  return Boolean(match?.[1]?.includes(Number(season)));
};

const buildPercentileLookup = (values) => {
  const numericValues = values.map(Number).filter(Number.isFinite);
  const counts = new Map();
  numericValues.forEach((value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  const orderedValues = [...counts.keys()].sort((left, right) => left - right);
  const maximum = orderedValues[orderedValues.length - 1];
  const lookup = new Map();
  let below = 0;
  orderedValues.forEach((value) => {
    const tied = counts.get(value);
    lookup.set(
      value,
      value === maximum
        ? 1000
        : Math.max(
          0,
          Math.min(
            999,
            Math.round(((below + tied * 0.5) / numericValues.length) * 1000)
          )
        )
    );
    below += tied;
  });
  return lookup;
};

export const canAssignDistinctStatStackPlayers = (playersByRow = []) => {
  const orderedRows = [...playersByRow].sort((left, right) =>
    left.size - right.size
  );
  const assignedPlayers = new Set();

  const assignRow = (rowIndex) => {
    if (rowIndex >= orderedRows.length) return true;
    for (const playerID of orderedRows[rowIndex]) {
      if (assignedPlayers.has(playerID)) continue;
      assignedPlayers.add(playerID);
      if (assignRow(rowIndex + 1)) return true;
      assignedPlayers.delete(playerID);
    }
    return false;
  };

  return assignRow(0);
};

export const getStatStackSearchPlayers = (payload, sharedPlayers = []) => {
  return (Array.isArray(sharedPlayers) ? sharedPlayers : [])
    .map(normalizeSharedPlayer)
    .filter((player) => (
      player.playerID
      && player.playerName
    ));
};

export const enrichStatStackAnswer = (payload, answer, playersByID) => {
  const player = playersByID.get(String(answer?.playerID)) || {};
  return {
    ...answer,
    playerName: answer?.playerName || player.playerName || "Unknown Player",
    teamName: answer?.teamName || payload?.teams?.[answer?.logoKey] || null,
  };
};

export const validateStatStackPayload = (payload, game, sharedPlayers = []) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Stat Stack payload is not an object.");
  }
  const schemaVersion = Number(payload.schemaVersion);
  if (!STAT_STACK_SUPPORTED_PAYLOAD_VERSIONS.has(schemaVersion)) {
    throw new Error("Unsupported Stat Stack payload version.");
  }
  if (game?.id && String(payload.gameID) !== String(game.id)) {
    throw new Error("Stat Stack payload does not match this game.");
  }
  if (!Array.isArray(payload.rows) || payload.rows.length !== STAT_STACK_ROW_COUNT) {
    throw new Error("Stat Stack payload must contain exactly five rows.");
  }
  requiredString(payload?.playerDataset?.basicFileName, "player dataset file");

  const searchPlayers = getStatStackSearchPlayers(payload, sharedPlayers);
  if (!searchPlayers.length) {
    throw new Error("Stat Stack requires a searchable player index.");
  }
  const indexedPlayerIDs = new Set();
  searchPlayers.forEach((player, index) => {
    requiredString(player?.playerID, `player index ${index + 1} playerID`);
    requiredString(player?.playerName, `player index ${index + 1} playerName`);
    const playerID = String(player.playerID);
    if (indexedPlayerIDs.has(playerID)) {
      throw new Error("Stat Stack player index IDs must be unique.");
    }
    indexedPlayerIDs.add(playerID);
  });

  const rowIDs = new Set();
  const playersByRow = [];
  payload.rows.forEach((row, rowIndex) => {
    requiredString(row?.id, `row ${rowIndex + 1} id`);
    if (rowIDs.has(String(row.id))) throw new Error("Stat Stack row IDs must be unique.");
    rowIDs.add(String(row.id));
    if (!Array.isArray(row.answers) || row.answers.length < 20) {
      throw new Error(`Stat Stack row ${row.id} must contain at least 20 answers.`);
    }
    if (Number(row.validAnswerCount) !== row.answers.length) {
      throw new Error(`Stat Stack row ${row.id} answer count does not match its metadata.`);
    }
    if (schemaVersion === 1) {
      if (!Array.isArray(row.eligibility) || row.eligibility.length !== row.constraints?.length) {
        throw new Error(`Stat Stack row ${row.id} has invalid eligibility diagnostics.`);
      }
      row.eligibility.forEach((eligibility, constraintIndex) => {
        const constraint = row.constraints[constraintIndex];
        if (eligibility === null) {
          if (!["position", "season"].includes(constraint?.key)) {
            throw new Error(`Stat Stack row ${row.id} has invalid eligibility diagnostics.`);
          }
          return;
        }
        if (!Array.isArray(eligibility) || eligibility.length !== 2) {
          throw new Error(`Stat Stack row ${row.id} has invalid eligibility diagnostics.`);
        }
        const [scope, data] = eligibility;
        if (!["P", "Y"].includes(scope) || !Array.isArray(data)) {
          throw new Error(`Stat Stack row ${row.id} has invalid eligibility diagnostics.`);
        }
        const seen = new Set();
        data.forEach((item) => {
          const playerID = scope === "P" ? item : item?.[0];
          const years = scope === "Y" ? item?.[1] : null;
          if (
            !String(playerID || "")
            || seen.has(String(playerID))
            || (scope === "Y" && (
              !Array.isArray(item)
              || item.length !== 2
              || !Array.isArray(years)
              || years.some((year) => !Number.isInteger(Number(year)))
            ))
          ) {
            throw new Error(`Stat Stack row ${row.id} has invalid eligibility diagnostics.`);
          }
          seen.add(String(playerID));
        });
      });
      if (
        row.ineligibleStatValues !== undefined
        && !Array.isArray(row.ineligibleStatValues)
      ) {
        throw new Error(`Stat Stack row ${row.id} has invalid stat diagnostics.`);
      }
      const diagnosticPlayers = new Set();
      (row.ineligibleStatValues || []).forEach((item) => {
        const [playerID, seasonValues] = Array.isArray(item) ? item : [];
        const normalizedPlayerID = String(playerID || "");
        if (
          !normalizedPlayerID
          || diagnosticPlayers.has(normalizedPlayerID)
          || !Array.isArray(seasonValues)
        ) {
          throw new Error(`Stat Stack row ${row.id} has invalid stat diagnostics.`);
        }
        diagnosticPlayers.add(normalizedPlayerID);
        const seasons = new Set();
        seasonValues.forEach((seasonValue) => {
          const [season, value] = Array.isArray(seasonValue) ? seasonValue : [];
          if (
            !Number.isInteger(Number(season))
            || !Number.isFinite(Number(value))
            || seasons.has(Number(season))
          ) {
            throw new Error(`Stat Stack row ${row.id} has invalid stat diagnostics.`);
          }
          seasons.add(Number(season));
        });
      });
    } else {
      if (
        !Array.isArray(row.compactEligibility)
        || row.compactEligibility.length !== row.constraints?.length
        || !Array.isArray(row.compactIneligibleStatValues)
      ) {
        throw new Error(`Stat Stack row ${row.id} has invalid compact diagnostics.`);
      }
      row.compactEligibility.forEach((diagnostic) => {
        if (diagnostic) {
          compactEligibilityMatches(
            diagnostic,
            0,
            Number(payload.playerDataset.seasonBase),
            payload.playerDataset
          );
        }
      });
      getCompactIneligibleStatValue(
        row,
        0,
        Number(payload.playerDataset.seasonBase),
        payload.playerDataset
      );
    }
    const answerKeys = new Set();
    const statValues = row.answers.map((answer) => Number(answer?.statValue));
    const expectedPercentiles = buildPercentileLookup(statValues);
    const rowPlayers = new Set();
    let searchableAnswerCount = 0;
    row.answers.forEach((answer) => {
      requiredString(answer?.playerID, `row ${row.id} playerID`);
      if (!indexedPlayerIDs.has(String(answer.playerID))) {
        throw new Error(`Stat Stack row ${row.id} references a player outside the index.`);
      }
      if (!Number.isInteger(Number(answer?.season))) {
        throw new Error(`Stat Stack row ${row.id} has an invalid season.`);
      }
      if (!Number.isFinite(Number(answer?.statValue))) {
        throw new Error(`Stat Stack row ${row.id} has an invalid stat value.`);
      }
      const percentile = Number(answer?.percentileTenths);
      if (!Number.isInteger(percentile) || percentile < 0 || percentile > 1000) {
        throw new Error(`Stat Stack row ${row.id} has an invalid percentile.`);
      }
      const expectedPercentile = expectedPercentiles.get(Number(answer.statValue));
      if (percentile !== expectedPercentile) {
        throw new Error(`Stat Stack row ${row.id} has a nondeterministic percentile.`);
      }
      if (answer.logoKey && !hasStatStackLogo(answer.logoKey)) {
        throw new Error(`Stat Stack row ${row.id} has unknown logo key ${answer.logoKey}.`);
      }
      if (answer.logoKey && !isStatStackLogoValidForSeason(answer.logoKey, answer.season)) {
        throw new Error(`Stat Stack row ${row.id} has a logo outside its identity years.`);
      }
      const answerKey = `${answer.playerID}:${answer.season}:${answer.teamKey || "FULL"}`;
      if (answerKeys.has(answerKey)) {
        throw new Error(`Stat Stack row ${row.id} contains a duplicate answer.`);
      }
      answerKeys.add(answerKey);
      if (indexedPlayerIDs.has(String(answer.playerID))) {
        searchableAnswerCount += 1;
        const playerIndex = searchPlayers.find(
          (player) => player.playerID === String(answer.playerID)
        )?.statStackIndex;
        const inconsistent = schemaVersion === 5
          ? row.compactEligibility.some((eligibility) => (
            !compactEligibilityMatches(
              eligibility,
              playerIndex,
              answer.season,
              payload.playerDataset
            )
          ))
          : row.eligibility.some((eligibility) => (
            !eligibilityMatches(eligibility, answer.playerID, answer.season)
          ));
        if (inconsistent) {
          throw new Error(`Stat Stack row ${row.id} has inconsistent eligibility diagnostics.`);
        }
        rowPlayers.add(String(answer.playerID));
      }
    });
    if (searchableAnswerCount < 20) {
      throw new Error(`Stat Stack row ${row.id} has too few searchable answers.`);
    }
    playersByRow.push(rowPlayers);
  });

  const canFillRows = canAssignDistinctStatStackPlayers(playersByRow);
  if (!canFillRows) throw new Error("Stat Stack payload cannot be filled with five distinct players.");

  if (Array.isArray(game?.rows)) {
    const metadataIDs = new Set(game.rows.map((row) => String(row.id)));
    if (metadataIDs.size !== rowIDs.size || [...rowIDs].some((id) => !metadataIDs.has(id))) {
      throw new Error("Stat Stack payload rows do not match game metadata.");
    }
  }
  return payload;
};

export const verifyStatStackPayloadChecksum = async (raw, expectedChecksum) => {
  if (!expectedChecksum) return true;
  const actual = await sha256(raw);
  if (actual.toLowerCase() !== String(expectedChecksum).toLowerCase()) {
    throw new Error("Stat Stack payload failed its checksum validation.");
  }
  return true;
};

export const parseStatStackPayload = async (raw, game, sharedPlayers = []) => {
  await verifyStatStackPayloadChecksum(raw, game?.payloadChecksum);
  const payload = JSON.parse(raw);
  if (
    game?.payloadSchemaVersion
    && Number(game.payloadSchemaVersion) !== Number(payload.schemaVersion)
  ) {
    throw new Error("Stat Stack payload schema metadata does not match.");
  }
  if (Number(payload.schemaVersion) === 5) {
    await verifyCompactPlayerDataset(payload, sharedPlayers);
  }
  return validateStatStackPayload(payload, game, sharedPlayers);
};

const loadPayloadURL = async (url, game, sharedPlayers) => {
  if (!url) throw new Error("Stat Stack payload URL is missing.");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Stat Stack payload request failed (${response.status}).`);
  return parseStatStackPayload(await response.text(), game, sharedPlayers);
};

export const fetchStatStackPayload = async (game, sharedPlayers = [], report = () => {}) => {
  let compactError = null;
  if (game?.compactPayloadURL) {
    try {
      const payload = await loadPayloadURL(game.compactPayloadURL, {
        ...game,
        payloadChecksum: game.compactPayloadChecksum,
        payloadSchemaVersion: game.compactPayloadSchemaVersion,
      }, sharedPlayers);
      report("payload_loaded", { format: "compact", schema_version: Number(payload.schemaVersion) });
      return payload;
    } catch (error) {
      compactError = error;
      report("compact_fallback", { reason: error?.message || "validation" });
    }
  }
  if (game?.payloadURL) {
    const payload = await loadPayloadURL(game.payloadURL, game, sharedPlayers);
    report("payload_loaded", { format: "legacy", schema_version: Number(payload.schemaVersion) });
    return payload;
  }
  throw compactError || new Error("The Stat Stack board could not be loaded.");
};
