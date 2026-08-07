import { useMemo } from "react";
import { normalizePlayer } from "../utils/normalizePlayers";
/**
 * Hook to quickly search players by name, with:
 *  - UTF-8 “mojibake” decoding (e.g. Don\u00c4\u008d → Donč)
 *  - Diacritic stripping (č → c)
 *  - Case-insensitive matching
 *  - Hyphens and apostrophes treated as word boundaries
 *  - Rough substring search
 */
export default function useFastPlayerSearch(
  triviaPlayers,
  query,
  isTeamGame,
  teams
) {
  // Precompute each player's normalized name once per triviaPlayers change
  const playersWithNormalized = useMemo(() => {
    if (!Array.isArray(triviaPlayers)) return [];
    return triviaPlayers.map((player) => ({
      original: player,
      normalizedName: normalizePlayer(player.name),
    }));
  }, [triviaPlayers]);

  return useMemo(() => {
    const rawQ = query.trim();
    if (rawQ === "") return [];
    if (isTeamGame) {
      const results = [];
      for (const team of teams || []) {
        const name = team?.name;
        if (name?.toLowerCase().includes(rawQ.toLowerCase())) {
          results.push(team);
        }
        if (results.length === 5) break;
      }
      return results;
    }
    const nQ = normalizePlayer(rawQ);
    const results = [];
    for (const { original, normalizedName } of playersWithNormalized) {
      if (normalizedName.includes(nQ)) {
        results.push(original);
        if (results.length === 8) break;
      }
    }
    return results;
  }, [query, playersWithNormalized, isTeamGame, teams]);
}
