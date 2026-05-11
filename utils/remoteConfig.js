"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
} from "firebase/remote-config";
import { getFirebaseApp, hasFirebaseConfig } from "./firebaseClient";

export const REMOTE_CONFIG_KEYS = {
  playersFileName: "playerfilename",
  numStrikes: "numstrikes",
};

export const REMOTE_CONFIG_DEFAULTS = {
  [REMOTE_CONFIG_KEYS.playersFileName]: "players_basic_1.json",
  [REMOTE_CONFIG_KEYS.numStrikes]: "3",
};

const FILE_NAME_PATTERN = /^[A-Za-z0-9._/-]+\.json$/;

export function sanitizeRemoteConfigFileName(value, fallback) {
  return typeof value === "string" && FILE_NAME_PATTERN.test(value)
    ? value
    : fallback;
}

function getMinimumFetchIntervalMillis() {
  return process.env.NODE_ENV === "development" ? 30_000 : 3_600_000;
}

function withTimeout(promise, timeoutMillis, message) {
  let timeoutID;
  const timeout = new Promise((_, reject) => {
    timeoutID = window.setTimeout(() => reject(new Error(message)), timeoutMillis);
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutID);
  });
}

export function getFirebaseRemoteConfig() {
  if (typeof window === "undefined") {
    console.log("[RemoteConfig] Skipping Remote Config on the server.");
    return null;
  }

  if (!hasFirebaseConfig()) {
    console.warn("[RemoteConfig] Firebase config is missing; using defaults.");
    return null;
  }

  const app = getFirebaseApp();
  if (!app) {
    console.warn("[RemoteConfig] Firebase app could not be initialized; using defaults.");
    return null;
  }

  const remoteConfig = getRemoteConfig(app);
  remoteConfig.defaultConfig = REMOTE_CONFIG_DEFAULTS;
  remoteConfig.settings.minimumFetchIntervalMillis =
    getMinimumFetchIntervalMillis();

  return remoteConfig;
}

export function useRemoteConfigString(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [loading, setLoading] = useState(() => hasFirebaseConfig());
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    console.log(`[RemoteConfig] Resolving key "${key}" with fallback "${fallback}".`);
    const remoteConfig = getFirebaseRemoteConfig();
    if (!remoteConfig) {
      console.log(`[RemoteConfig] No Remote Config client for "${key}". Using fallback "${fallback}".`);
      setValue(fallback);
      setLoading(false);
      return fallback;
    }

    setLoading(true);
    try {
      console.log(`[RemoteConfig] Fetching and activating config for "${key}".`);
      await withTimeout(
        fetchAndActivate(remoteConfig),
        8_000,
        `Firebase Remote Config timed out for ${key}`,
      );
      const nextValue = getValue(remoteConfig, key).asString() || fallback;
      console.log(`[RemoteConfig] Key "${key}" resolved to "${nextValue}".`);
      setValue(nextValue);
      setError(null);
      return nextValue;
    } catch (err) {
      console.warn(`Firebase Remote Config failed for ${key}:`, err);
      setValue(fallback);
      setError(err);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, [fallback, key]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    value,
    loading,
    error,
    refresh,
    enabled: hasFirebaseConfig(),
  };
}
