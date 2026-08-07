const STATE_KEY = "diamond_162_0_state_v1";
const STATS_KEY = "diamond_162_0_stats";
export const STATE_VERSION = 1;

export const easternDate = (date = new Date()) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const emptyStats = () => ({
  played: 0, totalWins: 0, bestWins: 0, perfectSeasons: 0,
});
export const emptyState = (date = easternDate()) => ({
  version: STATE_VERSION, date, attempts: [], active: null, resetNotice: null,
});

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export function readState(date = easternDate()) {
  if (typeof window === "undefined") return emptyState(date);
  try {
    const parsed = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
    if (!parsed || parsed.version !== STATE_VERSION) {
      return { ...emptyState(date), resetNotice: parsed ? "A previous 162-0 draft used an incompatible format and was reset." : null };
    }
    if (parsed.date !== date) return emptyState(date);
    return {
      ...emptyState(date),
      ...parsed,
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts.slice(-2) : [],
    };
  } catch {
    return { ...emptyState(date), resetNotice: "Stored 162-0 data could not be read and was reset." };
  }
}

export function persistState(state) {
  if (typeof window === "undefined") return false;
  if (safeSet(STATE_KEY, state)) return true;
  const compact = {
    ...state,
    attempts: (state.attempts || []).map((attempt) => ({
      attemptNumber: attempt.attemptNumber,
      catalogVersion: attempt.catalogVersion,
      catalogChecksum: attempt.catalogChecksum,
      completed: attempt.completed,
      completedAt: attempt.completedAt,
      projectedWins: attempt.projectedWins,
      rosterRatingTenths: attempt.rosterRatingTenths,
      picks: attempt.picks,
      spins: attempt.completed ? [] : attempt.spins,
    })),
  };
  return safeSet(STATE_KEY, compact);
}

export function readStats() {
  if (typeof window === "undefined") return emptyStats();
  try {
    return { ...emptyStats(), ...JSON.parse(localStorage.getItem(STATS_KEY) || "{}") };
  } catch {
    return emptyStats();
  }
}

export function recordStats(stats, wins) {
  const next = {
    played: Number(stats.played) + 1,
    totalWins: Number(stats.totalWins) + Number(wins),
    bestWins: Math.max(Number(stats.bestWins), Number(wins)),
    perfectSeasons: Number(stats.perfectSeasons) + (Number(wins) === 162 ? 1 : 0),
  };
  safeSet(STATS_KEY, next);
  window.dispatchEvent(new CustomEvent("diamond-stats-updated", { detail: { key: STATS_KEY } }));
  return next;
}
