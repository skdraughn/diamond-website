export const formatMLBSeason = (season) => String(Number(season) || season || "");

export function getMLBSeasonRangeLabels(value) {
  if (Array.isArray(value) && value.length >= 2) {
    return { start: String(value[0]), end: String(value[1]) };
  }
  const match = String(value || "").match(/(19|20)\d{2}/g);
  return match?.length >= 2 ? { start: match[0], end: match[match.length - 1] } : null;
}
