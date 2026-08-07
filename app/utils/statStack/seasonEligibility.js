import {
  compactEligibilityMatches,
  getCompactIneligibleStatValue,
} from "./compactDiagnostics.js";

export const STAT_STACK_MINIMUM_SEASON = 1980;

export const getStatStackSeasonChoices = (
  player,
  answers = [],
  maximumSeason = Infinity,
  minimumSeason = STAT_STACK_MINIMUM_SEASON,
) => {
  const bestBySeason = new Map();

  answers.forEach((answer) => {
    const season = Number(answer.season);
    const current = bestBySeason.get(season);
    if (
      !current
      || Number(answer.percentileTenths || 0) > Number(current.percentileTenths || 0)
      || (
        Number(answer.percentileTenths || 0) === Number(current.percentileTenths || 0)
        && Number(answer.statValue || 0) > Number(current.statValue || 0)
      )
    ) {
      bestBySeason.set(season, answer);
    }
  });

  const start = Math.max(Number(minimumSeason), Number(player?.start));
  if (!Number.isFinite(start)) return [];
  const resolvedMaximumSeason = Number(maximumSeason);
  if (Number.isFinite(resolvedMaximumSeason) && start > resolvedMaximumSeason) return [];
  const playerEnd = Number(player?.end);
  if (!Number.isFinite(playerEnd) || playerEnd < start) return [];
  const end = Math.min(playerEnd, resolvedMaximumSeason);
  return Array.from({ length: end - start + 1 }, (_, index) => {
    const season = start + index;
    return { season, answer: bestBySeason.get(season) || null };
  });
};

const formatAccoladeFailure = (constraint, season) => {
  const value = String(constraint?.value || "the required award");
  const excluded = Boolean(constraint?.exclude) || value.startsWith("Never ");
  const accolade = value.replace(/^Never\s+/i, "");
  const career = constraint?.scope === "CAREER";

  if (accolade === "All-Star") {
    if (excluded) {
      return career
        ? "He was an All-Star during his career."
        : `He was an All-Star in ${season}.`;
    }
    return career
      ? "He was never an All-Star during his career."
      : `He was not an All-Star in ${season}.`;
  }

  if (accolade === "MVP") {
    if (excluded) {
      return career
        ? "He was an MVP during his career."
        : `He was an MVP in ${season}.`;
    }
    return career
      ? "He was never an MVP during his career."
      : `He was not an MVP in ${season}.`;
  }

  if (excluded) {
    return career
      ? `He made a ${accolade} during his career.`
      : `He made a ${accolade} in ${season}.`;
  }
  return career
    ? `He never made a ${accolade} during his career.`
    : `He did not make a ${accolade} in ${season}.`;
};

const formatConstraintValue = (constraint) => {
  if (constraint?.key !== "team") return String(constraint?.value || "");
  return String(constraint?.value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatConstraintFailure = (constraint, season) => {
  const displayValue = formatConstraintValue(constraint);
  const postseasonTeam = ["made playoffs", "postseason", "playoffs"].includes(
    String(constraint?.value || "").trim().toLowerCase()
  )
    ? ""
    : constraint?.value;
  switch (constraint?.key) {
    case "season":
      return `${season} is outside the required ${constraint.value} range.`;
    case "position":
      return `His position does not match ${constraint.value}.`;
    case "team":
      return `He did not play for the ${displayValue} in ${season}.`;
    case "division":
      return `He did not play in ${constraint.value} in ${season}.`;
    case "conference":
    case "league":
      return `He did not play in ${constraint.value} in ${season}.`;
    case "postseason":
      return `He did not appear in a postseason game in ${season}${postseasonTeam ? ` for ${postseasonTeam}` : ""}.`;
    case "college":
      return `He did not attend ${constraint.value}.`;
    case "draft": {
      const value = String(constraint.value || "the required draft range");
      if (value === "Undrafted") return "He was drafted.";
      if (value === "Drafted") return "He was not drafted.";
      return `He was not drafted in ${value}.`;
    }
    case "accolade":
      return formatAccoladeFailure(constraint, season);
    default:
      return `He did not satisfy the ${constraint?.label || "row"} requirement.`;
  }
};

const getIneligibleStatValue = (row, playerID, season) => {
  const playerEntry = (row?.ineligibleStatValues || []).find(
    ([id]) => String(id) === String(playerID)
  );
  const seasonEntry = playerEntry?.[1]?.find(
    ([entrySeason]) => Number(entrySeason) === Number(season)
  );
  return seasonEntry ? Number(seasonEntry[1]) : null;
};

const formatStatValue = (value) => (
  Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
);

const positionMatches = (actual, constraintValue) => {
  const allowed = new Set(
    String(constraintValue || "")
      .split("/")
      .map((value) => value.trim())
      .filter(Boolean)
  );
  const position = String(actual || "");
  if (allowed.has(position)) return true;
  if (allowed.has("OF") && ["LF", "CF", "RF"].includes(position)) return true;
  if (allowed.has("P") && ["SP", "RP"].includes(position)) return true;
  return false;
};

export const getStatStackFailureReasons = ({
  row,
  player,
  season,
  statLabel,
  playerDataset,
}) => {
  const constraints = row?.constraints || [];
  const inferred = [];
  constraints.forEach((constraint) => {
    if (constraint.key === "season") {
      const [minimum, maximum] = String(constraint.value || "").match(/\d{4}/g) || [];
      if (
        minimum
        && maximum
        && (Number(season) < Number(minimum) || Number(season) > Number(maximum))
      ) {
        inferred.push(formatConstraintFailure(constraint, season));
      }
    }
    if (constraint.key === "position") {
      if (!positionMatches(player?.position, constraint.value)) {
        inferred.push(formatConstraintFailure(constraint, season));
      }
    }
  });
  if (Array.isArray(row?.eligibility)) {
    if (inferred.length) return inferred;
    for (let index = 0; index < constraints.length; index += 1) {
      const eligibility = row.eligibility[index];
      if (!eligibility) continue;
      const [scope, data] = eligibility;
      const playerID = String(player?.playerID || "");
      const matches = scope === "P"
        ? data.includes(playerID)
        : Boolean(data.find(([id, years]) => (
          String(id) === playerID && years.includes(Number(season))
        )));
      if (!matches) return [formatConstraintFailure(constraints[index], season)];
    }
    const ineligibleValue = getIneligibleStatValue(
      row,
      player?.playerID,
      season
    );
    if (ineligibleValue !== null) {
      return [
        `He recorded ${formatStatValue(ineligibleValue)} ${statLabel} in ${season}.`,
      ];
    }
    return [`His ${season} ${statLabel} total was not eligible for this row.`];
  }
  if (Array.isArray(row?.compactEligibility)) {
    if (inferred.length) return inferred;
    for (let index = 0; index < constraints.length; index += 1) {
      const eligibility = row.compactEligibility[index];
      if (!eligibility) continue;
      if (!compactEligibilityMatches(
        eligibility,
        Number(player?.statStackIndex),
        season,
        playerDataset
      )) {
        return [formatConstraintFailure(constraints[index], season)];
      }
    }
    const ineligibleValue = getCompactIneligibleStatValue(
      row,
      Number(player?.statStackIndex),
      season,
      playerDataset
    );
    if (ineligibleValue !== null) {
      return [
        `He recorded ${formatStatValue(ineligibleValue)} ${statLabel} in ${season}.`,
      ];
    }
    return [`His ${season} ${statLabel} total was not eligible for this row.`];
  }

  const diagnostics = row?.rejections?.[String(player?.playerID)] || [];
  const rejection = diagnostics.find((item) => Number(item?.[0]) === Number(season));
  if (rejection) {
    const mask = Number(rejection[1]);
    const reasons = constraints
      .filter((_, index) => mask & (1 << index))
      .map((constraint) => formatConstraintFailure(constraint, season));
    if (mask & (1 << constraints.length)) {
      reasons.push(`His ${season} ${statLabel} total was not eligible for this row.`);
    }
    if (reasons.length) return reasons;
  }

  // Versions 1 and 2 predate rejection diagnostics. Preserve useful reasons
  // that can be derived safely from their display constraints.
  return inferred.length
    ? inferred
    : [
      `His ${season} season failed at least one of these requirements: ${constraints
        .map((constraint) => constraint.value)
        .filter(Boolean)
        .join(", ")}.`,
    ];
};
