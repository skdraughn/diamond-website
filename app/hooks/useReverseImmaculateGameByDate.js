"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";

const client = generateClient();

export const customReverseImmaculateGamesByDate = /* GraphQL */ `
  query ReverseImmaculateGamesByDate(
    $date: AWSDate!
    $sortDirection: ModelSortDirection
    $filter: ModelReverseImmaculateGameFilterInput
    $limit: Int
    $nextToken: String
  ) {
    reverseImmaculateGamesByDate(
      date: $date
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        date
        prompt
        rowTeams
        colTeams
        numStrikes
        cells {
          index
          playerName
          rowIndex
          colIndex
        }
        adLocked
      }
      nextToken
    }
  }
`;

export default function useReverseImmaculateGameByDate(date) {
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
            query: customReverseImmaculateGamesByDate,
            variables: { date, nextToken },
            authMode: "apiKey",
          });
          const payload = res?.data?.reverseImmaculateGamesByDate;
          const items = payload?.items || [];
          nextToken = payload?.nextToken;
          unlocked = items.find((item) => !item?.adLocked);
        } while (nextToken && !unlocked);

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
