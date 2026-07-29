"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HigherLowerGameOverModal from "../components/HigherLowerGameOverModal";
import HigherLowerPlayerCard from "../components/HigherLowerPlayerCard";
import useHigherLowerGame from "../hooks/useHigherLowerGame";
import useTeams from "../hooks/useTeams";
import { colors } from "../theme/colors";
import { teamLogoMap } from "@/utils/teamLogoMap";

const DEFAULT_TIME = 10;
const MIN_TIME = 4;
const interval = 5;
const maxScoreKey = "diamond_hl_max_score";

function normalizeTeamKey(value) {
  return String(value || "").trim().toUpperCase();
}

function buildTeamLookup(teams) {
  const map = {};
  teams.forEach((team) => {
    (team.abbrs || []).forEach((abbr) => {
      map[normalizeTeamKey(abbr)] = team;
    });
    if (team.abbreviation) map[normalizeTeamKey(team.abbreviation)] = team;
  });
  return map;
}

function resolveTeam(player, teamLookup) {
  const candidates = [player?.tID, player?.ltID, player?.t, player?.t2];
  for (const candidate of candidates) {
    const key = normalizeTeamKey(candidate);
    if (teamLookup[key]) return teamLookup[key];
  }
  return null;
}

function usePageVisibility(onVisible) {
  useEffect(() => {
    const handler = () => document.visibilityState === "visible" && onVisible();
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [onVisible]);
}

export default function PlayHigherLower() {
  const { teams, loading: teamsLoading } = useTeams();
  const [firstPlayerStatRevealed, setFirstPlayerStatRevealed] = useState(false);
  const [secondPlayerStatRevealed, setSecondPlayerStatRevealed] = useState(false);
  const [gameOverModalVisible, setGameOverModalVisible] = useState(false);
  const [gameSession, setGameSession] = useState(0);
  const [logosReady, setLogosReady] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIME);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const deadlineRef = useRef(Date.now());
  const countdownActive = useRef(false);
  const hasPressed = useRef(false);
  const latestScoreRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const logoSources = Object.values(teamLogoMap)
      .map((logo) => logo?.default || logo)
      .map((logo) => logo?.src || logo)
      .filter(Boolean);

    Promise.all(
      logoSources.map(
        (src) =>
          new Promise((resolve) => {
            const image = new window.Image();
            image.onload = resolve;
            image.onerror = resolve;
            image.src = src;
            if (image.complete) resolve();
          })
      )
    ).then(() => {
      if (!cancelled) setLogosReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const markComplete = useCallback(() => {
    if (typeof window === "undefined") return;

    const finalScore = latestScoreRef.current;
    const oldMax = Number(localStorage.getItem(maxScoreKey) || 0);
    if (oldMax < finalScore) {
      localStorage.setItem(maxScoreKey, finalScore.toString());
    }
    window.dispatchEvent(new Event("diamond-stats-updated"));
    setGameOverModalVisible(true);
  }, []);

  const prepareModeChange = useCallback(() => {
    setFirstPlayerStatRevealed(false);
    setSecondPlayerStatRevealed(false);
  }, []);

  const {
    loading,
    currentMode,
    firstPlayer,
    secondPlayer,
    score,
    modeTransitioning,
    handleGuess,
    correctIndex,
    setCorrectIndex,
    resetGame,
    error,
    selectedFileName,
    refreshPlayers,
  } = useHigherLowerGame(() => markComplete(), prepareModeChange);

  const handleRestart = useCallback(() => {
    window.clearInterval(timerRef.current);
    countdownActive.current = false;
    resetGame();
    setGameSession((session) => session + 1);
    setFirstPlayerStatRevealed(false);
    setSecondPlayerStatRevealed(false);
    setGameOverModalVisible(false);
  }, [resetGame]);

  useEffect(() => {
    latestScoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (!gameOverModalVisible) {
      setFirstPlayerStatRevealed(false);
      setSecondPlayerStatRevealed(false);
    }
  }, [gameOverModalVisible]);

  const currentTimeAvailable = Math.max(
    DEFAULT_TIME - Math.floor(score / interval),
    MIN_TIME
  );

  const maxScore = useMemo(() => {
    if (typeof window === "undefined") return score;
    return Math.max(score, Number(localStorage.getItem(maxScoreKey) || 0));
  }, [score]);

  const startCountdown = useCallback(
    (remainingMs = currentTimeAvailable * 1000) => {
      window.clearInterval(timerRef.current);
      countdownActive.current = true;
      deadlineRef.current = Date.now() + remainingMs;
      hasPressed.current = false;

      setSecondsLeft(Math.ceil(remainingMs / 1000));
      setProgress(100);

      timerRef.current = window.setInterval(() => {
        const msLeft = deadlineRef.current - Date.now();
        const pct = (msLeft / (currentTimeAvailable * 1000)) * 100;
        setProgress(Math.max(pct, 0));
        setSecondsLeft(Math.max(0, Math.ceil(msLeft / 1000)));

        if (msLeft <= 0) {
          window.clearInterval(timerRef.current);
          countdownActive.current = false;
          markComplete();
        }
      }, 100);
    },
    [currentTimeAvailable, markComplete]
  );

  const handleVisibility = useCallback(() => {
    if (!countdownActive.current) return;
    const msLeft = deadlineRef.current - Date.now();
    if (msLeft <= 0) markComplete();
    else startCountdown(msLeft);
  }, [markComplete, startCountdown]);

  usePageVisibility(handleVisibility);

  const onGuess = useCallback(
    (isFirstHigher) => {
      if (hasPressed.current) return;
      hasPressed.current = true;
      navigator?.vibrate?.(50);
      window.clearInterval(timerRef.current);
      setProgress(100);
      setFirstPlayerStatRevealed(true);
      setSecondPlayerStatRevealed(true);
      handleGuess(isFirstHigher);
    },
    [handleGuess]
  );

  useEffect(() => {
    if (
      !firstPlayer ||
      !secondPlayer ||
      gameOverModalVisible ||
      modeTransitioning
    ) {
      return undefined;
    }

    const delay = score % interval === 0 && score !== 0 ? 0 : 1400;
    const id = window.setTimeout(() => startCountdown(), delay);
    return () => {
      window.clearTimeout(id);
      window.clearInterval(timerRef.current);
    };
  }, [
    firstPlayer,
    secondPlayer,
    gameOverModalVisible,
    modeTransitioning,
    score,
    startCountdown,
  ]);

  const computeStat = useCallback(
    (player) => {
      if (!player || !currentMode) return "";
      const { statIndex, combineIndices } = currentMode;

      if (Array.isArray(combineIndices)) {
        const total = combineIndices.reduce(
          (sum, idx) => sum + (Number(player.st?.[idx]) || 0),
          0
        );
        return total.toLocaleString();
      }

      const raw = Number(player.st?.[statIndex]) || 0;
      return statIndex === 0 || statIndex === 2
        ? raw.toFixed(3).replace(/^0/, "")
        : raw.toLocaleString();
    },
    [currentMode]
  );

  const teamLookup = useMemo(() => buildTeamLookup(teams), [teams]);
  const passedFirstPlayer = useMemo(() => {
    if (!firstPlayer) return null;
    return {
      name: firstPlayer.n || firstPlayer.name,
      startYear: firstPlayer.s,
      endYear: firstPlayer.e,
      stat: computeStat(firstPlayer),
      position: firstPlayer.p,
      team: resolveTeam(firstPlayer, teamLookup),
    };
  }, [computeStat, firstPlayer, teamLookup]);

  const passedSecondPlayer = useMemo(() => {
    if (!secondPlayer) return null;
    return {
      name: secondPlayer.n || secondPlayer.name,
      startYear: secondPlayer.s,
      endYear: secondPlayer.e,
      stat: computeStat(secondPlayer),
      position: secondPlayer.p,
      team: resolveTeam(secondPlayer, teamLookup),
    };
  }, [computeStat, secondPlayer, teamLookup]);

  useEffect(() => {
    console.log("[HigherLowerUI] Render gate:", {
      loading,
      teamsLoading,
      hasFirstPlayer: Boolean(firstPlayer),
      hasSecondPlayer: Boolean(secondPlayer),
      currentMode: currentMode?.title || null,
      score,
      error: error?.message || null,
      selectedFileName,
    });
  }, [
    loading,
    teamsLoading,
    firstPlayer,
    secondPlayer,
    currentMode,
    score,
    error,
    selectedFileName,
  ]);

  if (!loading && error) {
    return (
      <Box
        sx={{
          borderRadius: 2,
          border: `1px solid ${colors.border}`,
          bgcolor: "rgba(7,9,8,0.84)",
          p: { xs: 2, md: 3 },
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Higher Lower could not load players
        </Typography>
        <Typography sx={{ color: colors.secondaryText }}>
          {error.message || "The player data file did not return playable Higher Lower data."}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.tertiaryText }}>
          Player file: {selectedFileName || "unknown"}
        </Typography>
        <Box>
          <Button variant="contained" onClick={refreshPlayers}>
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }

  if (
    loading ||
    teamsLoading ||
    !logosReady ||
    !firstPlayer ||
    !secondPlayer ||
    !passedFirstPlayer ||
    !passedSecondPlayer
  ) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <Skeleton
          sx={{
            flex: 1,
            backgroundColor: colors.backgroundHighlight,
            width: "100%",
            height: "50vh",
            borderRadius: 2,
          }}
        />
      </Box>
    );
  }

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, md: 3 },
          px: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <HigherLowerGameOverModal
          visible={gameOverModalVisible}
          onClose={handleRestart}
          score={score}
          handlePlayAgain={handleRestart}
          interval={interval}
          maxScore={maxScore}
        />

        <Paper
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 3 },
            bgcolor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 2,
            boxShadow: "none",
            backgroundImage: "none",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: colors.gold,
              textAlign: "center",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {currentMode?.isInverse ? "Who Had Less" : "Who Had More"}
          </Typography>
          <Typography variant="h4" align="center" sx={{ mt: 0.25, mb: 2.5, fontWeight: 900 }}>
            {currentMode?.title?.split(" in")[0]}
          </Typography>

          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 2 }}>
            <Typography
              sx={{
                minWidth: 30,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.text,
                fontSize: "1rem",
                fontWeight: 900,
                lineHeight: 1,
                textAlign: "center",
              }}
            >
              {secondsLeft}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                flex: 1,
                height: 10,
                borderRadius: 999,
                bgcolor: colors.background,
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  bgcolor: colors.strikeout,
                },
              }}
            />
          </Stack>

          <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
            <Box
              sx={{
                flex: 1,
                px: 1.5,
                py: 1,
                bgcolor: colors.backgroundHighlight,
                borderRadius: 1.5,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Typography sx={{ color: colors.primary, fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.08em" }}>
                SCORE
              </Typography>
              <Typography sx={{ fontSize: "1.3rem", fontWeight: 900 }}>{score}</Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                px: 1.5,
                py: 1,
                bgcolor: colors.backgroundHighlight,
                borderRadius: 1.5,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Typography sx={{ color: colors.gold, fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.08em" }}>
                BEST
              </Typography>
              <Typography sx={{ fontSize: "1.3rem", fontWeight: 900 }}>{maxScore}</Typography>
            </Box>
          </Stack>

          <Stack spacing={2} sx={{ flexGrow: 1, mt: 2 }}>
            <Button
              disableRipple
              sx={{
                p: 0,
                flex: 1,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: colors.background,
                "&:hover": { bgcolor: colors.background },
                "&.Mui-disabled": { opacity: 1, bgcolor: colors.background },
              }}
              onClick={() => onGuess(true)}
              disabled={hasPressed.current}
            >
              <HigherLowerPlayerCard
                key={`first-${gameSession}-${currentMode?.title}`}
                player={passedFirstPlayer}
                correct={correctIndex === 0 || correctIndex === 2}
                incorrect={correctIndex === 3}
                frozen={gameOverModalVisible}
                statRevealed={firstPlayerStatRevealed}
                setStatRevealed={setFirstPlayerStatRevealed}
                setCorrectIndex={setCorrectIndex}
              />
            </Button>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Divider sx={{ flex: 1, bgcolor: "grey.400" }} />
              {correctIndex > -1 ? (
                correctIndex > 1 ? (
                  <Box sx={{ backgroundColor: colors.text, borderRadius: 100, width: 45, height: 45 }}>
                    <CancelIcon sx={{ fontSize: 45, color: colors.primary }} />
                  </Box>
                ) : (
                  <Box sx={{ backgroundColor: colors.text, borderRadius: 100, width: 45, height: 45 }}>
                    <CheckCircleIcon sx={{ fontSize: 45, color: colors.grass }} />
                  </Box>
                )
              ) : (
                <Typography variant="button" sx={{ fontSize: 30, lineHeight: "45px" }}>
                  OR
                </Typography>
              )}
              <Divider sx={{ flex: 1, bgcolor: "grey.400" }} />
            </Stack>

            <Button
              disableRipple
              sx={{
                p: 0,
                flex: 1,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: colors.background,
                "&:hover": { bgcolor: colors.background },
                "&.Mui-disabled": { opacity: 1, bgcolor: colors.background },
              }}
              onClick={() => onGuess(false)}
              disabled={hasPressed.current}
            >
              <HigherLowerPlayerCard
                key={`second-${gameSession}-${currentMode?.title}`}
                player={passedSecondPlayer}
                correct={correctIndex === 1 || correctIndex === 3}
                incorrect={correctIndex === 2}
                frozen={gameOverModalVisible}
                statRevealed={secondPlayerStatRevealed}
                setStatRevealed={setSecondPlayerStatRevealed}
                setCorrectIndex={setCorrectIndex}
              />
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
