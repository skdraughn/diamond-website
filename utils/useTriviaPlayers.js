"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  REMOTE_CONFIG_KEYS,
  sanitizeRemoteConfigFileName,
  useRemoteConfigString,
} from "./remoteConfig";

const BASE_URL =
  "https://diamondtrivia-public-bucket.s3.us-east-1.amazonaws.com/data";

const BASIC_FALLBACK_KEY = "players_basic_1.json";
const PLAYERS_CACHE_KEY = "trivia_players_cache";
const PLAYERS_METADATA_KEY = "trivia_players_metadata";
const PLAYERS_FILE_ENV_OVERRIDE =
  process.env.NEXT_PUBLIC_PLAYERS_FILE_NAME || "";

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
  const [error, setError] = useState(null);

  const [lastFetched, setLastFetched] = useState(null);

  const {
    value: remotePlayersFileName,
    loading: remoteConfigLoading,
    error: remoteConfigError,
    refresh: refreshRemoteConfig,
    enabled: remoteConfigEnabled,
  } = useRemoteConfigString(
    REMOTE_CONFIG_KEYS.playersFileName,
    BASIC_FALLBACK_KEY,
  );

  const selectedFileName = useMemo(
    () =>
      sanitizeRemoteConfigFileName(
        PLAYERS_FILE_ENV_OVERRIDE || remotePlayersFileName,
        BASIC_FALLBACK_KEY,
      ),
    [remotePlayersFileName],
  );

  useEffect(() => {
    console.log("[TriviaPlayers] Player filename inputs:", {
      envOverride: PLAYERS_FILE_ENV_OVERRIDE || null,
      remotePlayersFileName,
      selectedFileName,
      remoteConfigLoading,
      remoteConfigEnabled,
      remoteConfigError: remoteConfigError?.message || null,
    });
  }, [
    remotePlayersFileName,
    selectedFileName,
    remoteConfigLoading,
    remoteConfigEnabled,
    remoteConfigError,
  ]);

  // 2. Fetch from S3
  const fetchJsonFromPublic = useCallback(async (fileName) => {
    if (!fileName) throw new Error("No fileName provided");

    const url = `${BASE_URL}/${fileName}`;
    console.log(`[TriviaPlayers] Fetching ${url}`);

    const controller = new AbortController();
    const timeoutID = window.setTimeout(() => controller.abort(), 20_000);

    let resp;
    try {
      resp = await fetch(url, {
        signal: controller.signal,
      });
    } finally {
      window.clearTimeout(timeoutID);
    }

    console.log(`[TriviaPlayers] Fetch response for ${fileName}: ${resp.status}`);

    if (!resp.ok)
      throw new Error(`Failed to fetch ${fileName}: ${resp.status}`);

    return resp.json();
  }, []);

  // 3. Load from LocalStorage
  const loadFromCache = useCallback((fileName) => {
    if (typeof window === "undefined") return false;

    try {
      const metadataStr = localStorage.getItem(PLAYERS_METADATA_KEY);
      if (!metadataStr) {
        console.log(`[TriviaPlayers] Cache miss for ${fileName}: no metadata.`);
        return false;
      }

      const metadata = JSON.parse(metadataStr);
      // If filename changed, cache is invalid
      if (metadata.fileName !== fileName) {
        console.log("[TriviaPlayers] Cache miss: filename changed.", {
          cachedFileName: metadata.fileName,
          selectedFileName: fileName,
        });
        return false;
      }

      const cachedDataStr = localStorage.getItem(PLAYERS_CACHE_KEY);
      if (!cachedDataStr) {
        console.log(`[TriviaPlayers] Cache miss for ${fileName}: no cached payload.`);
        return false;
      }

      const { data, fetchedAt } = JSON.parse(cachedDataStr);

      setBasicPlayers(data);
      setVerbosePlayers(deriveVerbose(data));
      setHigherLowerPlayers(deriveHigherLower(data));
      setLastFetched(fetchedAt);
      console.log("[TriviaPlayers] Loaded players from cache.", {
        fileName,
        total: Array.isArray(data) ? data.length : 0,
        verbose: deriveVerbose(data).length,
        higherLower: deriveHigherLower(data).length,
        fetchedAt,
      });
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
        const verbose = deriveVerbose(data);
        const higherLower = deriveHigherLower(data);

        // Update State
        setBasicPlayers(data);
        setVerbosePlayers(verbose);
        setHigherLowerPlayers(higherLower);
        setLastFetched(now);
        setError(null);
        console.log("[TriviaPlayers] Loaded players from network.", {
          fileName,
          total: Array.isArray(data) ? data.length : 0,
          verbose: verbose.length,
          higherLower: higherLower.length,
        });

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
        setBasicPlayers([]);
        setVerbosePlayers([]);
        setHigherLowerPlayers([]);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [fetchJsonFromPublic],
  );

  // 5. Main Effect: Triggered when Firebase Remote Config resolves.
  useEffect(() => {
    if (remoteConfigLoading) return;

    const init = async () => {
      console.log(`[TriviaPlayers] Init starting with "${selectedFileName}".`);
      const loadedFromCache = loadFromCache(selectedFileName);

      if (!loadedFromCache) {
        console.log(`[TriviaPlayers] Fetching because cache was not usable for "${selectedFileName}".`);
        await fetchAndCache(selectedFileName);
      } else {
        console.log(`[TriviaPlayers] Cache satisfied init for "${selectedFileName}".`);
        setLoading(false);
      }
    };

    init();
  }, [remoteConfigLoading, selectedFileName, loadFromCache, fetchAndCache]);

  const refresh = useCallback(() => {
    refreshRemoteConfig();
    fetchAndCache(selectedFileName);
  }, [fetchAndCache, refreshRemoteConfig, selectedFileName]);

  return {
    basicPlayers,
    verbosePlayers,
    higherLowerPlayers,
    loading: loading || remoteConfigLoading,
    refresh,
    lastFetched,
    selectedFileName,
    remoteConfigEnabled,
    remoteConfigError,
    error,
  };
}
