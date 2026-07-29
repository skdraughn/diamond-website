"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useTriviaPlayers from "@/utils/useTriviaPlayers";
import { higherLowerGameModes } from "../utils/higherLowerGameModes";

function pickIndexWithRecencyBias(arr, indices, score) {
  if (score >= 50) return indices[Math.floor(Math.random() * indices.length)];

  let highProb;
  let lowCutoff;
  if (score < 10) {
    highProb = 1;
    lowCutoff = 2005;
  } else if (score < 20) {
    highProb = 0.85;
    lowCutoff = 2000;
  } else if (score < 30) {
    highProb = 0.75;
    lowCutoff = 1995;
  } else if (score < 40) {
    highProb = 0.65;
    lowCutoff = 1990;
  } else {
    highProb = 0.6;
    lowCutoff = 1985;
  }

  const high = [];
  const mid = [];
  for (const i of indices) {
    const start = arr[i].s || 0;
    if (start > 2005) high.push(i);
    else if (start >= lowCutoff) mid.push(i);
  }

  if (high.length === 0 && mid.length === 0) {
    return indices[Math.floor(Math.random() * indices.length)];
  }
  if (high.length === 0) return mid[Math.floor(Math.random() * mid.length)];
  if (mid.length === 0) return high[Math.floor(Math.random() * high.length)];

  return Math.random() < highProb
    ? high[Math.floor(Math.random() * high.length)]
    : mid[Math.floor(Math.random() * mid.length)];
}

function getPlayerKey(player) {
  return player?.id || player?.playerID || player?.name || player?.n || null;
}

export default function useHigherLowerGame(markComplete, onBeforeModeChange) {
  const {
    higherLowerPlayers,
    loading: playersLoading,
    error: playersError,
    selectedFileName,
    refresh: refreshPlayers,
  } = useTriviaPlayers();

  const interval = 5;
  const [mode, setMode] = useState(null);
  const [firstIdx, setFirstIdx] = useState(null);
  const [secondIdx, setSecondIdx] = useState(null);
  const [firstTs, setFirstTs] = useState(Date.now());
  const [secondTs, setSecondTs] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [modeTransitioning, setModeTransitioning] = useState(false);
  const [gameError, setGameError] = useState(null);

  const modeQueue = useRef([]);
  const lastModeChangeScore = useRef(null);
  const modeChangeTimeout = useRef(null);
  const eligibleByMode = useRef({});

  const getVal = useCallback((player, currentMode) => {
    if (!player || !Array.isArray(player.st)) return 0;
    if (currentMode?.combineIndices) {
      return currentMode.combineIndices.reduce(
        (sum, index) => sum + (Number(player.st[index]) || 0),
        0
      );
    }
    return Number(player.st[currentMode?.statIndex]) || 0;
  }, []);

  const resetModeQueue = useCallback(() => {
    const titles = higherLowerGameModes.map((m) => m.title);
    for (let i = titles.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [titles[i], titles[j]] = [titles[j], titles[i]];
    }
    modeQueue.current = titles;
  }, []);

  const pickInitialPair = useCallback(
    (nextMode, excludedPlayers = []) => {
      const arr = eligibleByMode.current[nextMode?.title] || [];
      if (arr.length < 2) {
        setFirstIdx(null);
        setSecondIdx(null);
        setGameError("No Higher Lower modes have enough eligible players.");
        return;
      }

      const excludedKeys = new Set(
        excludedPlayers.map(getPlayerKey).filter(Boolean)
      );
      const freshIdx = Array.from(arr.keys()).filter(
        (index) => !excludedKeys.has(getPlayerKey(arr[index]))
      );
      const allIdx = freshIdx.length >= 2 ? freshIdx : Array.from(arr.keys());
      let i;
      let j;
      let v1;
      let v2;
      let attempts = 0;

      do {
        i = pickIndexWithRecencyBias(arr, allIdx, score);
        const rem = allIdx.filter((idx) => idx !== i);
        j = pickIndexWithRecencyBias(arr, rem, score);

        v1 = getVal(arr[i], nextMode);
        v2 = getVal(arr[j], nextMode);
        attempts += 1;
      } while (v1 === v2 && attempts < 50);

      setGameError(null);
      setFirstIdx(i);
      setSecondIdx(j);
      setFirstTs(Date.now());
      setSecondTs(Date.now());
    },
    [getVal, score]
  );

  const pickNextMode = useCallback(() => {
    if (modeQueue.current.length === 0) resetModeQueue();

    let nextMode = null;
    let attempts = 0;
    while (!nextMode && attempts < higherLowerGameModes.length) {
      const nextTitle = modeQueue.current.shift();
      const candidate = higherLowerGameModes.find((m) => m.title === nextTitle);
      if ((eligibleByMode.current[candidate?.title] || []).length >= 2) {
        nextMode = candidate;
      }
      attempts += 1;
    }

    if (!nextMode) {
      setGameError("No Higher Lower modes have enough eligible players.");
      return;
    }

    setMode(nextMode);
    pickInitialPair(nextMode);
  }, [pickInitialPair, resetModeQueue]);

  useEffect(() => {
    if (playersLoading || higherLowerPlayers?.length < 2 || mode) return;

    higherLowerGameModes.forEach((m) => {
      const eligible = higherLowerPlayers
        .filter((player) => {
          const val = getVal(player, m);
          if (m.isInverse && m.statIndex === 0 && val === 0) return false;
          return m.isInverse ? val <= m.threshold : val >= m.threshold;
        })
        .sort((a, b) => getVal(b, m) - getVal(a, m));

      eligibleByMode.current[m.title] = eligible;
    });

    const hasPlayableMode = Object.values(eligibleByMode.current).some(
      (players) => players.length >= 2
    );
    if (!hasPlayableMode) {
      setGameError("No Higher Lower modes have enough eligible players.");
      return;
    }

    setGameError(null);
    resetModeQueue();
    pickNextMode();
  }, [
    getVal,
    higherLowerPlayers,
    mode,
    pickNextMode,
    playersLoading,
    resetModeQueue,
  ]);

  useEffect(() => {
    if (
      score > 0 &&
      score % interval === 0 &&
      lastModeChangeScore.current !== score
    ) {
      lastModeChangeScore.current = score;
      modeChangeTimeout.current = window.setTimeout(() => {
        onBeforeModeChange?.();
        pickNextMode();
        setModeTransitioning(false);
      }, 1400);
    }

    return () => window.clearTimeout(modeChangeTimeout.current);
  }, [onBeforeModeChange, pickNextMode, score]);

  const changePlayer = useCallback(() => {
    if (!mode || firstIdx == null || secondIdx == null) return;

    const arr = eligibleByMode.current[mode.title] || [];
    if (arr.length < 2) return;

    const dropFirst = firstTs < secondTs;
    const keepIdx = dropFirst ? secondIdx : firstIdx;
    const dropIdx = dropFirst ? firstIdx : secondIdx;
    const keepVal = getVal(arr[keepIdx], mode);

    const windowSize = mode.windowSize ?? 1000;
    const low = Math.max(0, keepIdx - windowSize);
    const high = Math.min(arr.length - 1, keepIdx + windowSize);

    const candidates = [];
    for (let k = low; k <= high; k += 1) {
      if (k !== keepIdx && k !== dropIdx && getVal(arr[k], mode) !== keepVal) {
        candidates.push(k);
      }
    }

    const pool = candidates.length
      ? candidates
      : arr
          .map((_, i) => i)
          .filter(
            (i) =>
              i !== keepIdx && i !== dropIdx && getVal(arr[i], mode) !== keepVal
          );

    if (pool.length === 0) return;
    const newIdx = pickIndexWithRecencyBias(arr, pool, score);

    if (dropFirst) {
      setFirstIdx(newIdx);
      setFirstTs(Date.now());
    } else {
      setSecondIdx(newIdx);
      setSecondTs(Date.now());
    }
  }, [firstIdx, firstTs, getVal, mode, score, secondIdx, secondTs]);

  const handleGuess = useCallback(
    (isFirstHigher) => {
      if (!mode || firstIdx == null || secondIdx == null) return;

      const arr = eligibleByMode.current[mode.title] || [];
      const firstVal = getVal(arr[firstIdx], mode);
      const secondVal = getVal(arr[secondIdx], mode);
      const correct = mode.isInverse
        ? isFirstHigher
          ? firstVal <= secondVal
          : secondVal <= firstVal
        : isFirstHigher
          ? firstVal >= secondVal
          : secondVal >= firstVal;

      if (!correct) {
        setCorrectIndex(isFirstHigher ? 3 : 2);
        markComplete();
        return;
      }

      const nextScore = score + 1;
      setCorrectIndex(isFirstHigher ? 0 : 1);
      setScore(nextScore);
      if (nextScore % interval === 0) {
        setModeTransitioning(true);
      } else {
        changePlayer();
      }
    },
    [changePlayer, firstIdx, getVal, markComplete, mode, score, secondIdx]
  );

  const resetGame = useCallback(() => {
    const currentPlayers =
      mode && eligibleByMode.current[mode.title]
        ? [
            eligibleByMode.current[mode.title][firstIdx],
            eligibleByMode.current[mode.title][secondIdx],
          ]
        : [];

    setScore(0);
    window.clearTimeout(modeChangeTimeout.current);
    setModeTransitioning(false);
    lastModeChangeScore.current = null;
    setCorrectIndex(-1);
    setFirstIdx(null);
    setSecondIdx(null);
    setFirstTs(Date.now());
    setSecondTs(Date.now());
    setGameError(null);
    resetModeQueue();
    const nextTitle =
      modeQueue.current.find((title) => title !== mode?.title) ||
      modeQueue.current[0];
    modeQueue.current = modeQueue.current.filter((title) => title !== nextTitle);
    const nextMode = higherLowerGameModes.find((item) => item.title === nextTitle);
    setMode(nextMode);
    pickInitialPair(nextMode, currentPlayers);
  }, [firstIdx, mode, pickInitialPair, resetModeQueue, secondIdx]);

  return {
    loading: playersLoading,
    error:
      playersError ||
      gameError ||
      (!playersLoading && higherLowerPlayers?.length < 2
        ? new Error(`No Higher Lower players loaded from ${selectedFileName}.`)
        : null),
    selectedFileName,
    refreshPlayers,
    score,
    modeTransitioning,
    currentMode: mode,
    firstPlayer:
      (mode && eligibleByMode.current[mode.title]?.[firstIdx]) || null,
    secondPlayer:
      (mode && eligibleByMode.current[mode.title]?.[secondIdx]) || null,
    handleGuess,
    correctIndex,
    setCorrectIndex,
    changePlayer,
    resetGame,
  };
}
