"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { generateClient } from "aws-amplify/api";

// GraphQL Query
const GET_AD_CONFIG = /* GraphQL */ `
  query GetAdConfig($id: ID!) {
    getAdConfig(id: $id) {
      id
      basicPlayersFileName
    }
  }
`;

const BASE_URL =
  "https://diamondtrivia-public-bucket.s3.us-east-1.amazonaws.com/data";

const BASIC_FALLBACK_KEY = "players_basic_1.json";
const PLAYERS_CACHE_KEY = "trivia_players_cache";
const PLAYERS_METADATA_KEY = "trivia_players_metadata";

// Helper to filter players
const deriveVerbose = (players) =>
  Array.isArray(players) ? players.filter(({ h }) => h) : [];

const deriveHigherLower = (players) =>
  Array.isArray(players) ? players.filter(({ st }) => st) : [];

export default function useTriviaPlayers() {
  const [basicPlayers, setBasicPlayers] = useState([]);
  const [verbosePlayers, setVerbosePlayers] = useState([]);
  const [higherLowerPlayers, setHigherLowerPlayers] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);

  const [lastFetched, setLastFetched] = useState(null);
  const [config, setConfig] = useState(null);

  // Initialize client once
  const client = useMemo(() => generateClient(), []);

  // 1. Fetch Ad Config (Replaces useAdConfig)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await client.graphql({
          query: GET_AD_CONFIG,
          variables: { id: "ed5c931b-5ecb-4149-8066-c4f9faccf487" },
        });

        const fetchedConfig = response?.data?.getAdConfig;
        setConfig(fetchedConfig);
      } catch (err) {
        console.error("Failed to fetch AdConfig:", err);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, [client]);

  // 2. Fetch from S3
  const fetchJsonFromPublic = useCallback(async (fileName) => {
    if (!fileName) throw new Error("No fileName provided");

    console.log(`${BASE_URL}/${fileName}`)

    const resp = await fetch(`${BASE_URL}/${fileName}`);
    if (!resp.ok)
      throw new Error(`Failed to fetch ${fileName}: ${resp.status}`);

    return resp.json();
  }, []);

  // 3. Load from LocalStorage
  const loadFromCache = useCallback((fileName) => {
    if (typeof window === "undefined") return false;

    try {
      const metadataStr = localStorage.getItem(PLAYERS_METADATA_KEY);
      if (!metadataStr) return false;

      const metadata = JSON.parse(metadataStr);
      // If filename changed, cache is invalid
      if (metadata.fileName !== fileName) return false;

      const cachedDataStr = localStorage.getItem(PLAYERS_CACHE_KEY);
      if (!cachedDataStr) return false;

      const { data, fetchedAt } = JSON.parse(cachedDataStr);

      setBasicPlayers(data);
      setVerbosePlayers(deriveVerbose(data));
      setHigherLowerPlayers(deriveHigherLower(data));
      setLastFetched(fetchedAt);
      return true;
    } catch (err) {
      console.warn(
        "Failed to load trivia player cache from localStorage:",
        err,
      );
      // If cache is corrupted, clear it
      localStorage.removeItem(PLAYERS_CACHE_KEY);
      localStorage.removeItem(PLAYERS_METADATA_KEY);
      return false;
    }
  }, []);

  // 4. Fetch, Set State, and Cache
  const fetchAndCache = useCallback(
    async (fileName) => {
      setLoading(true);
      try {
        const data = await fetchJsonFromPublic(fileName);
        const now = Date.now();

        // Update State
        setBasicPlayers(data);
        setVerbosePlayers(deriveVerbose(data));
        setHigherLowerPlayers(deriveHigherLower(data));
        setLastFetched(now);

        // Attempt Cache
        if (typeof window !== "undefined") {
          try {
            const cachePayload = JSON.stringify({ data, fetchedAt: now });
            const metaPayload = JSON.stringify({ fileName, fetchedAt: now });

            localStorage.setItem(PLAYERS_CACHE_KEY, cachePayload);
            localStorage.setItem(PLAYERS_METADATA_KEY, metaPayload);
          } catch (e) {
            console.warn(
              "Quota exceeded: Could not cache players in localStorage.",
              e,
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch trivia players:", err);
      } finally {
        setLoading(false);
      }
    },
    [fetchJsonFromPublic],
  );

  // 5. Main Effect: Triggered when Config is ready
  useEffect(() => {
    // Wait for config to finish loading (even if it failed and is null)
    if (configLoading) return;

    const fileName = config?.basicPlayersFileName || BASIC_FALLBACK_KEY;

    const init = async () => {
      const loadedFromCache = loadFromCache(fileName);

      if (!loadedFromCache) {
        await fetchAndCache(fileName);
      } else {
        setLoading(false);
      }
    };

    init();
  }, [configLoading, config, loadFromCache, fetchAndCache]);

  const refresh = useCallback(() => {
    if (configLoading) return;
    const fileName = config?.basicPlayersFileName || BASIC_FALLBACK_KEY;
    fetchAndCache(fileName);
  }, [configLoading, config, fetchAndCache]);

  return {
    basicPlayers,
    verbosePlayers,
    higherLowerPlayers,
    loading: loading || configLoading, // Combine loading states
    refresh,
    lastFetched,
  };
}
