"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  Container,
  Divider,
  LinearProgress,
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

function getLogoSource(logo) {
  return logo?.default || logo || null;
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
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIME);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const deadlineRef = useRef(Date.now());
  const countdownActive = useRef(false);
  const hasPressed = useRef(false);
  const latestScoreRef = useRef(0);

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

  const {
    loading,
    currentMode,
    firstPlayer,
    secondPlayer,
    score,
    handleGuess,
    correctIndex,
    setCorrectIndex,
    resetGame,
    error,
    selectedFileName,
    refreshPlayers,
  } = useHigherLowerGame(() => markComplete());

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
    if (!firstPlayer || !secondPlayer || gameOverModalVisible) return undefined;

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
      {Object.values(teamLogoMap).map((img, index) => {
        const src = getLogoSource(img);
        return src ? (
          <Image
            key={`preload-logo-${index}`}
            src={src}
            alt=""
            height={200}
            width={200}
            style={{ display: "none" }}
          />
        ) : null;
      })}

      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderRadius: ".5rem",
          overflow: "hidden",
          border: `1px solid ${colors.border}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.32)",
        }}
      >
        {currentMode?.image ? (
          <Image
            fill
            src={currentMode.image}
            alt="Current mode background"
            sizes="1200px"
            style={{
              height: "100%",
              position: "absolute",
              width: "100%",
              objectFit: "cover",
              filter: "brightness(42%)",
            }}
          />
        ) : null}

        <HigherLowerGameOverModal
          visible={gameOverModalVisible}
          score={score}
          handlePlayAgain={() => {
            resetGame();
            setGameOverModalVisible(false);
          }}
          interval={interval}
          maxScore={maxScore}
        />

        <Box sx={{ zIndex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: colors.gold, textAlign: "center", fontWeight: 900 }}>
            {currentMode?.isInverse ? "Who Had Less" : "Who Had More"}
          </Typography>
          <Typography variant="h4" align="center" mb={2} sx={{ fontWeight: 900 }}>
            {currentMode?.title?.split(" in")[0]}
          </Typography>

          <Box sx={{ position: "relative", width: "100%", mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: "1.5rem",
                borderRadius: 2,
                backgroundColor: "grey.700",
                "& .MuiLinearProgress-bar": { backgroundColor: colors.primary },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1.25rem",
                fontWeight: 900,
              }}
            >
              {secondsLeft}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Box sx={{ display: "flex", gap: ".5rem" }}>
              <Typography variant="body1" sx={{ color: colors.primary, fontWeight: 900 }}>
                SCORE
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 900 }}>{score}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: ".5rem" }}>
              <Typography variant="body1" sx={{ color: colors.gold, fontWeight: 900 }}>
                BEST
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 900 }}>{maxScore}</Typography>
            </Box>
          </Box>

          <Stack flexGrow={1} spacing={2} mt={2}>
            <Button
              sx={{ p: 0, flex: 1, backgroundColor: "#000", borderRadius: "1rem" }}
              onClick={() => onGuess(true)}
              disabled={hasPressed.current}
            >
              <HigherLowerPlayerCard
                player={passedFirstPlayer}
                correct={correctIndex === 0 || correctIndex === 2}
                incorrect={correctIndex === 3}
                statRevealed={firstPlayerStatRevealed}
                setStatRevealed={setFirstPlayerStatRevealed}
                setCorrectIndex={setCorrectIndex}
              />
            </Button>

            <Stack direction="row" alignItems="center" spacing={1}>
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
              sx={{ p: 0, flex: 1, backgroundColor: "#000", borderRadius: "1rem" }}
              onClick={() => onGuess(false)}
              disabled={hasPressed.current}
            >
              <HigherLowerPlayerCard
                player={passedSecondPlayer}
                correct={correctIndex === 1 || correctIndex === 3}
                incorrect={correctIndex === 2}
                statRevealed={secondPlayerStatRevealed}
                setStatRevealed={setSecondPlayerStatRevealed}
                setCorrectIndex={setCorrectIndex}
              />
            </Button>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
