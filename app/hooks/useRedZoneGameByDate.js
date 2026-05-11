"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";

const client = generateClient();

export const customRedZoneGamesByDate = /* GraphQL */ `
  query RedZoneGamesByDate(
    $date: AWSDate!
    $sortDirection: ModelSortDirection
    $filter: ModelRedZoneGameFilterInput
    $limit: Int
    $nextToken: String
  ) {
    redZoneGamesByDate(
      date: $date
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        date
        title
        teamsHidden
        subtitle
        numStrikes
        cells {
          hint
          team
          teamID
          index
          answerPlayerID
          answerPlayerName
        }
        prompt
        adLocked
      }
      nextToken
    }
  }
`;

export default function useRedZoneGameByDate(date) {
  const [game, setGame] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date) return;

    let cancelled = false;
    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      try {
        let nextToken = null;
        let unlocked = null;
        do {
          const res = await client.graphql({
            query: customRedZoneGamesByDate,
            variables: { date, nextToken },
            authMode: "apiKey",
          });
          const payload = res?.data?.redZoneGamesByDate;
          const items = payload?.items || [];
          nextToken = payload?.nextToken;
          unlocked = items.find((item) => !item?.adLocked);
        } while (nextToken && !unlocked);

        if (unlocked?.cells) {
          unlocked.cells.sort((a, b) => a.index - b.index);
        }
        if (!cancelled) setGame(unlocked || null);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setGame(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGame();
    return () => {
      cancelled = true;
    };
  }, [date]);

  return { game, loading, error };
}
