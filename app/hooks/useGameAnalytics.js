"use client";
import { useMemo } from "react";
import { logFirebaseEvent } from "@/utils/firebaseAnalytics";
import { createGameEventTracker } from "@/utils/gameEventTracker.mjs";

export default function useGameAnalytics(game, gameId, playMode = "daily", retry = false) {
  return useMemo(() => createGameEventTracker({
    send: logFirebaseEvent, app: "diamond", game, gameId, playMode, retry,
    storage: {
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
    },
  }), [game, gameId, playMode, retry]);
}
