"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Modal,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CancelRounded from "@mui/icons-material/CancelRounded";
import useReverseImmaculateGameByDate from "../hooks/useReverseImmaculateGameByDate";
import useTeams from "../hooks/useTeams";
import { getLocalISODate } from "../utils/date";
import { colors } from "../theme/colors";
import { divisionTeams } from "../utils/divisionTeams";
import { teamLogoMap } from "@/utils/teamLogoMap";
import { appLinks } from "@/utils/appLinks";

const STORAGE_PREFIX = "diamond_ri_";

function normalizeTeamKey(value) {
  return String(value || "").trim().toUpperCase();
}

function teamMatchesID(team, teamID) {
  const key = normalizeTeamKey(teamID);
  return (team?.abbrs || []).some((abbr) => normalizeTeamKey(abbr) === key);
}

function findTeam(teams, teamID) {
  return teams.find((team) => teamMatchesID(team, teamID)) || null;
}

function getTeamLogoSource(logoURL) {
  const logo = logoURL ? teamLogoMap[logoURL] : null;
  return logo?.default || logo || null;
}

function getTeamLogoCssUrl(logoURL) {
  const source = getTeamLogoSource(logoURL);
  return source?.src || (typeof source === "string" ? source : null);
}

function loadState(game) {
  if (typeof window === "undefined" || !game?.id) return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${game.id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(gameID, state) {
  if (typeof window === "undefined" || !gameID) return;
  localStorage.setItem(`${STORAGE_PREFIX}${gameID}`, JSON.stringify(state));
}

function TeamHeader({
  teamID,
  index,
  onHeaderPress,
  matched,
  guesses = [],
  teams = [],
  completed,
  answersShown,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const size = isMobile ? 72 : 108;
  const correctTeam = findTeam(teams, teamID);
  const isMatched = matched || (completed && answersShown);
  const logoSrc = getTeamLogoSource(correctTeam?.logoURL);
  const wrongGuessCount = guesses.filter((guessID) => {
    const guessedTeam = teams.find((team) => team.id === guessID);
    return !teamMatchesID(guessedTeam, teamID);
  }).length;
  const isClickable = !isMatched && !completed;

  return (
    <Box
      component="button"
      type="button"
      disabled={!isClickable}
      onClick={() => {
        if (isClickable) onHeaderPress(index);
      }}
      sx={{
        width: size,
        height: size,
        borderRadius: 2.5,
        border: `1px solid ${isMatched ? colors.grass : colors.border}`,
        background: isMatched
          ? `linear-gradient(180deg, ${colors.surfaceStrong}, ${colors.backgroundHighlight})`
          : `linear-gradient(180deg, ${colors.surface}, ${colors.backgroundHighlight})`,
        color: colors.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        cursor: isClickable ? "pointer" : "default",
        p: 1,
        transition: "transform 180ms ease, border-color 180ms ease, opacity 180ms ease",
        "&:hover": isClickable
          ? {
              transform: "translateY(-1px)",
              borderColor: colors.primary,
            }
          : undefined,
        "&:focus-visible": {
          outline: `2px solid ${colors.primary}`,
          outlineOffset: "2px",
        },
      }}
    >
      {isMatched && logoSrc ? (
        <Image
          src={logoSrc}
          alt={correctTeam?.name || `team-${index}`}
          width={Math.round(size * 0.78)}
          height={Math.round(size * 0.78)}
          style={{ objectFit: "contain" }}
        />
      ) : (
        <>
          <Typography
            component="span"
            sx={{
              fontSize: isMobile ? "1.6rem" : "2rem",
              lineHeight: 1,
              fontWeight: 700,
              color: colors.secondaryText,
            }}
          >
            ?
          </Typography>
          {!isMobile ? (
            <Typography
              component="span"
              sx={{
                fontSize: "0.66rem",
                letterSpacing: 0,
                color: colors.tertiaryText,
              }}
            >
              TAP TO GUESS
            </Typography>
          ) : null}
        </>
      )}

      {wrongGuessCount > 0 ? (
        <Box
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            minWidth: 20,
            height: 20,
            borderRadius: 999,
            px: 0.75,
            backgroundColor: "rgba(240, 68, 56, 0.2)",
            border: "1px solid rgba(240, 68, 56, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: "0.7rem", color: colors.primary, fontWeight: 700 }}>
            {wrongGuessCount}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}

function GridCell({
  player,
  rowTeam,
  colTeam,
  showRowTeam,
  showColTeam,
  teams,
  rowIndex,
  colIndex,
}) {
  const rowLogo = getTeamLogoSource(findTeam(teams, rowTeam)?.logoURL);
  const colLogo = getTeamLogoSource(findTeam(teams, colTeam)?.logoURL);
  const fullName = player || "-";

  const renderBadge = (logo, visible, label) => (
    <Box
      sx={{
        width: { xs: 18, sm: 20, md: 22 },
        height: { xs: 18, sm: 20, md: 22 },
        borderRadius: 1,
        border: `1px solid ${colors.border}`,
        backgroundColor: visible ? colors.surfaceStrong : colors.backgroundHighlight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {visible && logo ? (
        <Image
          src={logo}
          alt={label}
          width={22}
          height={22}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <Typography sx={{ fontSize: "0.55rem", color: colors.tertiaryText }}>
          -
        </Typography>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: 1,
        background: `linear-gradient(180deg, ${colors.surface}, ${colors.backgroundHighlight})`,
        border: `1px solid ${colors.border}`,
        p: { xs: 0.75, sm: 1 },
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        textAlign: "center",
        borderTopLeftRadius: colIndex === 0 && rowIndex === 0 ? 12 : 0,
        borderTopRightRadius: colIndex === 2 && rowIndex === 0 ? 12 : 0,
        borderBottomLeftRadius: colIndex === 0 && rowIndex === 2 ? 12 : 0,
        borderBottomRightRadius: colIndex === 2 && rowIndex === 2 ? 12 : 0,
      }}
    >
      <Box sx={{ width: "100%", px: { xs: 0.6, sm: 0.75 } }}>
        <Typography
          variant="body1"
          sx={{
            zIndex: 1,
            fontWeight: 700,
            color: colors.text,
            fontSize: { xs: "0.8rem", md: "0.95rem" },
            lineHeight: 1.18,
            overflowWrap: "anywhere",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          {fullName}
        </Typography>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 5,
          right: 5,
          display: "flex",
          flexDirection: "row",
          gap: 0.35,
          zIndex: 2,
        }}
      >
        {renderBadge(rowLogo, showRowTeam, "row team")}
        {renderBadge(colLogo, showColTeam, "column team")}
      </Box>
    </Box>
  );
}

function TeamSelectModal({
  modalVisible,
  onClose,
  teams,
  handleSelectTeam,
  modalHeader,
  rowGuesses,
  colGuesses,
}) {
  const searchArray = modalHeader?.type === "row" ? rowGuesses : colGuesses;
  const guessedTeams = searchArray?.[modalHeader?.index] || [];

  return (
    <Modal open={modalVisible} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: colors.backgroundHighlight,
          borderRadius: 2,
          outline: "none",
          border: `1px solid ${colors.border}`,
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
          maxHeight: "80vh",
          overflowY: "auto",
          p: 3,
          minWidth: { xs: "min(92vw, 420px)", sm: 420 },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" color={colors.text} sx={{ fontWeight: 800 }}>
            {modalHeader?.type?.charAt(0)?.toUpperCase() +
              modalHeader?.type?.slice(1)}{" "}
            {modalHeader?.index + 1}
          </Typography>
          <IconButton onClick={onClose} aria-label="Close team picker">
            <CloseIcon sx={{ color: colors.text }} />
          </IconButton>
        </Box>

        <Grid container columnSpacing={4} rowSpacing={1}>
          {Object.entries(divisionTeams).map(([division, divTeams]) => (
            <Grid size={6} key={division}>
              <Typography variant="body2" sx={{ color: colors.secondaryText, mb: 0.5 }}>
                {division}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 1, width: "100%" }}>
                {divTeams.map((teamName) => {
                  const team = teams.find(({ name }) => name === teamName);
                  if (!team) return null;
                  const alreadyGuessed = guessedTeams.includes(team.id);
                  const logoUrl = getTeamLogoCssUrl(team.logoURL);
                  return (
                    <Box
                      component="button"
                      type="button"
                      disabled={alreadyGuessed}
                      onClick={() =>
                        handleSelectTeam(
                          team,
                          modalHeader?.type === "row" ? modalHeader.index : -1,
                          modalHeader?.type === "col" ? modalHeader.index : -1
                        )
                      }
                      sx={{
                        flex: 1,
                        aspectRatio: 1,
                        borderRadius: 1,
                        cursor: alreadyGuessed ? "not-allowed" : "pointer",
                        opacity: alreadyGuessed ? 0.5 : 1,
                        border: "none",
                        backgroundColor: "transparent",
                        backgroundImage: logoUrl ? `url(${logoUrl})` : "none",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        position: "relative",
                        transition: "opacity 180ms ease",
                        ":hover": { opacity: alreadyGuessed ? 0.5 : 0.7 },
                      }}
                      key={teamName}
                      aria-label={team.name}
                    >
                      {alreadyGuessed ? (
                        <CloseIcon
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            color: colors.primary,
                            opacity: 0.6,
                          }}
                        />
                      ) : null}
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Modal>
  );
}

function ResultsModal({
  visible,
  onClose,
  score,
  total,
  game,
  matchedRows,
  matchedCols,
  resetGame,
  stats,
}) {
  const winPercent = stats?.played
    ? Math.round(((stats.won || 0) / stats.played) * 100)
    : 0;
  const correctPercent = stats?.reverseImmaculateGamesTotalHeaders
    ? Math.round(
        ((stats.reverseImmaculateGamesCorrectHeaders || 0) /
          stats.reverseImmaculateGamesTotalHeaders) *
          100
      )
    : 0;

  const handleShare = async () => {
    const solvedRows = Array(3)
      .fill(null)
      .map((_, i) => (matchedRows.includes(i) ? "🟩" : "🟥"))
      .join("");
    const solvedCols = Array(3)
      .fill(null)
      .map((_, i) => (matchedCols.includes(i) ? "🟩" : "🟥"))
      .join("");
    const msg = `Diamond Trivia Reverse Immaculate ${game?.date}\nRows: ${solvedRows}\nCols: ${solvedCols}\nScore: ${score}/${total}\n\n${appLinks.appStore}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Diamond Trivia", text: msg });
      } catch {
        await navigator.clipboard?.writeText(msg);
      }
    } else {
      await navigator.clipboard.writeText(msg);
      alert("Copied to clipboard!");
    }
  };

  return (
    <Dialog
      open={visible}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            backgroundColor: colors.background,
            backgroundImage: "none",
            border: `1px solid ${colors.border}`,
            borderRadius: 3,
            boxShadow: "0 24px 80px rgba(0,0,0,0.62)",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          pb: 1,
        }}
      >
        <Typography
          component="span"
          variant="h6"
          sx={{
            color: score === total ? colors.gold : colors.strikeout,
            fontWeight: 900,
          }}
        >
          {score === total ? "You Won!" : "You Lost"}
        </Typography>
        <IconButton onClick={onClose} aria-label="Close game result">
          <CloseIcon sx={{ color: colors.text }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: "4px !important", pb: 3 }}>
        <Typography sx={{ color: colors.text, mb: 2.5 }}>
          You got {matchedRows.length}/3 rows and {matchedCols.length}/3 columns correct.
        </Typography>

        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.backgroundHighlight,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ color: colors.secondaryText, fontWeight: 800, mb: 1.5 }}
          >
            Your Stats
          </Typography>
          <Grid container spacing={1.5}>
            {[
              { label: "Played", value: stats?.played || 0, size: 3 },
              { label: "Win %", value: `${winPercent}%`, size: 3 },
              { label: "Win Streak", value: stats?.streak || 0, size: 3 },
              { label: "Max Streak", value: stats?.maxStreak || 0, size: 3 },
              {
                label: "Total Correct Headers",
                value: stats?.reverseImmaculateGamesCorrectHeaders || 0,
                size: 6,
              },
              { label: "Correct %", value: `${correctPercent}%`, size: 6 },
            ].map((item) => (
              <Grid key={item.label} size={item.size} sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 900 }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                  {item.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            border: `1px solid ${colors.primary}70`,
            background:
              "linear-gradient(140deg, rgba(19,114,74,0.34), rgba(14,34,56,0.95))",
          }}
        >
          <Typography sx={{ color: colors.text, fontWeight: 900 }}>
            More baseball trivia is waiting in the app
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondaryText, mt: 0.5, mb: 1.5 }}>
            Play collections, climb leaderboards, and compete with other MLB fans.
          </Typography>
          <Button
            component="a"
            href={appLinks.appStore}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
          >
            Download Diamond Trivia
          </Button>
        </Box>

        <Stack direction="row" spacing={1.25}>
          <Button fullWidth variant="outlined" onClick={resetGame}>
            Try Again
          </Button>
          <Button fullWidth onClick={handleShare}>Share</Button>
        </Stack>
        <Button fullWidth onClick={onClose} variant="text" sx={{ mt: 1.25 }}>
          Review Board
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function PlayReverseImmaculate() {
  const today = getLocalISODate();
  const { teams, loading: teamsLoading } = useTeams();
  const { game, loading: gameLoading, error } = useReverseImmaculateGameByDate(today);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalHeader, setModalHeader] = useState({ type: null, index: null });
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [resultsDismissed, setResultsDismissed] = useState(false);
  const [answersShown, setAnswersShown] = useState(false);
  const [resultStats, setResultStats] = useState(null);
  const [state, setState] = useState({
    rowGuesses: [],
    colGuesses: [],
    matchedRows: [],
    matchedCols: [],
    score: 0,
    strikes: 0,
    completed: false,
  });
  const recordedRef = useRef(false);

  useEffect(() => {
    if (!game) return;
    const stored = loadState(game);
    const nextState =
      stored || {
        rowGuesses: Array.from({ length: game.rowTeams?.length || 0 }, () => []),
        colGuesses: Array.from({ length: game.colTeams?.length || 0 }, () => []),
        matchedRows: [],
        matchedCols: [],
        score: 0,
        strikes: 0,
        completed: false,
      };
    const id = window.setTimeout(() => {
      setState(nextState);
      recordedRef.current = Boolean(stored?.completed);
      try {
        const rawStats = JSON.parse(localStorage.getItem("diamond_ri_stats") || "{}");
        const inferredPlayed =
          rawStats.played ||
          Math.floor(
            (rawStats.reverseImmaculateGamesTotalHeaders || 0) /
              Math.max(
                1,
                (game.rowTeams?.length || 0) + (game.colTeams?.length || 0)
              )
          );
        setResultStats({
          ...rawStats,
          played: inferredPlayed,
          maxStreak: rawStats.maxStreak || rawStats.streak || 0,
        });
      } catch {
        setResultStats(null);
      }
      setResultsDismissed(false);
      setResultsModalVisible(Boolean(stored?.completed));
    }, 0);
    return () => window.clearTimeout(id);
  }, [game]);

  const totalStrikes = game?.numStrikes || 3;
  const totalTeams = (game?.rowTeams?.length || 0) + (game?.colTeams?.length || 0);

  const recordStats = useCallback(
    (finalState) => {
      if (!game || recordedRef.current) return;
      const won = finalState.score === totalTeams;
      const raw = localStorage.getItem("diamond_ri_stats");
      const previous = raw ? JSON.parse(raw) : {};
      const previousPlayed =
        previous.played ||
        Math.floor(
          (previous.reverseImmaculateGamesTotalHeaders || 0) /
            Math.max(1, totalTeams)
        );
      const nextStreak = won ? (previous.streak || 0) + 1 : 0;
      const nextStats = {
        played: previousPlayed + 1,
        streak: nextStreak,
        maxStreak: Math.max(previous.maxStreak || previous.streak || 0, nextStreak),
        won: (previous.won || 0) + (won ? 1 : 0),
        reverseImmaculateGamesCorrectHeaders:
          (previous.reverseImmaculateGamesCorrectHeaders || 0) + finalState.score,
        reverseImmaculateGamesTotalHeaders:
          (previous.reverseImmaculateGamesTotalHeaders || 0) + totalTeams,
      };
      localStorage.setItem(
        "diamond_ri_stats",
        JSON.stringify(nextStats)
      );
      setResultStats(nextStats);
      window.dispatchEvent(new Event("diamond-stats-updated"));
      recordedRef.current = true;
    },
    [game, totalTeams]
  );

  const completeGame = useCallback(
    (nextState) => {
      if (!game) return;
      const finalState = { ...nextState, completed: true };
      setState(finalState);
      saveState(game.id, finalState);
      recordStats(finalState);
      if (!resultsDismissed) setResultsModalVisible(true);
    },
    [game, recordStats, resultsDismissed]
  );

  useEffect(() => {
    if (!game || state.completed) return;
    const allSolved =
      state.matchedRows.length === game.rowTeams.length &&
      state.matchedCols.length === game.colTeams.length;
    const tooManyStrikes = state.strikes >= totalStrikes;
    if (allSolved || tooManyStrikes) {
      const id = window.setTimeout(() => completeGame(state), 0);
      return () => window.clearTimeout(id);
    }
  }, [completeGame, game, state, totalStrikes]);

  const handleSelectTeam = (team, rowIndex, colIndex) => {
    if (!game || state.completed) return;

    const isRow = rowIndex !== -1;
    const targetID = isRow ? game.rowTeams[rowIndex] : game.colTeams[colIndex];
    const correct = teamMatchesID(team, targetID);
    const index = isRow ? rowIndex : colIndex;

    const next = {
      ...state,
      rowGuesses: state.rowGuesses.map((guesses, i) =>
        isRow && i === index && !guesses.includes(team.id) ? [...guesses, team.id] : guesses
      ),
      colGuesses: state.colGuesses.map((guesses, i) =>
        !isRow && i === index && !guesses.includes(team.id) ? [...guesses, team.id] : guesses
      ),
      matchedRows: isRow && correct ? Array.from(new Set([...state.matchedRows, index])) : state.matchedRows,
      matchedCols: !isRow && correct ? Array.from(new Set([...state.matchedCols, index])) : state.matchedCols,
      score: correct ? state.score + 1 : state.score,
      strikes: correct ? state.strikes : state.strikes + 1,
    };

    setState(next);
    saveState(game.id, next);
    setModalVisible(false);
  };

  const resetGame = () => {
    if (!game) return;
    const fresh = {
      rowGuesses: Array.from({ length: game.rowTeams.length }, () => []),
      colGuesses: Array.from({ length: game.colTeams.length }, () => []),
      matchedRows: [],
      matchedCols: [],
      score: 0,
      strikes: 0,
      completed: false,
    };
    recordedRef.current = false;
    setAnswersShown(false);
    setResultsDismissed(false);
    setResultsModalVisible(false);
    setState(fresh);
    saveState(game.id, fresh);
  };

  if (gameLoading || teamsLoading || game === undefined) {
    return (
      <Skeleton
        variant="rectangular"
        height={600}
        width="100%"
        animation="wave"
        sx={{ bgcolor: colors.backgroundHighlight }}
      />
    );
  }

  if (error || !game) {
    return (
      <Typography sx={{ mt: "4rem", textAlign: "center", color: colors.secondaryText }}>
        {error ? "Reverse Immaculate failed to load." : "No Reverse Immaculate is available for today."}
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ overflowX: "auto", width: "100%" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `${isMobile ? "72px" : "112px"} repeat(${
              game.colTeams.length
            }, minmax(${isMobile ? "72px" : "104px"}, 1fr))`,
            gridTemplateRows: `${isMobile ? "72px" : "112px"} repeat(${
              game.rowTeams.length
            }, minmax(${isMobile ? "72px" : "104px"}, 1fr))`,
            gap: { xs: 0.75, md: 1 },
            minWidth: isMobile ? "360px" : "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Image
              src="/diamond-app-icon-v2.webp"
              alt="Diamond Trivia"
              width={isMobile ? 48 : 72}
              height={isMobile ? 48 : 72}
              style={{ borderRadius: "18%", objectFit: "cover" }}
              priority
            />
          </Box>

          {game.colTeams.map((teamID, index) => (
            <Box key={`col-${index}`} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <TeamHeader
                teamID={teamID}
                index={index}
                onHeaderPress={(i) => {
                  setModalHeader({ type: "col", index: i });
                  setModalVisible(true);
                }}
                matched={state.matchedCols.includes(index)}
                guesses={state.colGuesses[index] || []}
                teams={teams}
                completed={state.completed}
                answersShown={answersShown}
              />
            </Box>
          ))}

          {game.rowTeams.map((teamID, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <TeamHeader
                  teamID={teamID}
                  index={rowIndex}
                  onHeaderPress={(i) => {
                    setModalHeader({ type: "row", index: i });
                    setModalVisible(true);
                  }}
                  matched={state.matchedRows.includes(rowIndex)}
                  guesses={state.rowGuesses[rowIndex] || []}
                  teams={teams}
                  completed={state.completed}
                  answersShown={answersShown}
                />
              </Box>
              {game.colTeams.map((_, colIndex) => {
                const cell = game.cells.find(
                  (candidate) => candidate.rowIndex === rowIndex && candidate.colIndex === colIndex
                );
                return (
                  <Box key={`cell-${rowIndex}-${colIndex}`}>
                    <GridCell
                      player={cell?.playerName}
                      rowTeam={game.rowTeams[rowIndex]}
                      colTeam={game.colTeams[colIndex]}
                      showRowTeam={answersShown || state.matchedRows.includes(rowIndex)}
                      showColTeam={answersShown || state.matchedCols.includes(colIndex)}
                      teams={teams}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                    />
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          gap: 1.25,
          width: "100%",
          mt: 2.25,
        }}
      >
        {state.completed ? (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Button variant="outlined" color="secondary" onClick={resetGame}>
              Try Again
            </Button>
            {!answersShown ? <Button onClick={() => setAnswersShown(true)}>Show Answers</Button> : null}
          </Box>
        ) : null}

        <Box
          sx={{
            ml: { xs: 0, md: "auto" },
            width: { xs: "100%", sm: "auto" },
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(130px, 1fr))",
            gap: 1,
          }}
        >
          <Box
            sx={{
              borderRadius: 2,
              border: `1px solid ${colors.border}`,
              bgcolor: colors.surface,
              px: { xs: 1.25, md: 1.5 },
              py: { xs: 1, md: 1.15 },
            }}
          >
            <Typography sx={{ color: colors.secondaryText, fontSize: "0.82rem" }}>
              Score
            </Typography>
            <Typography sx={{ color: colors.grass, fontWeight: 700, fontSize: "2rem", lineHeight: 1.05 }}>
              {state.score}
              <Typography component="span" sx={{ color: colors.secondaryText, fontSize: "1rem", fontWeight: 600 }}>
                /{totalTeams}
              </Typography>
            </Typography>
          </Box>

          <Box
            sx={{
              borderRadius: 2,
              border: `1px solid ${colors.border}`,
              bgcolor: colors.surface,
              px: { xs: 1.25, md: 1.5 },
              py: { xs: 1, md: 1.15 },
            }}
          >
            <Typography sx={{ color: colors.secondaryText, fontSize: "0.82rem", mb: 0.6 }}>
              Strikes
            </Typography>
            <Box sx={{ display: "flex", gap: 0.35 }}>
              {Array.from({ length: totalStrikes }).map((_, index) => (
                <CancelRounded
                  key={index}
                  sx={{
                    fontSize: { xs: "1.35rem", md: "1.6rem" },
                    color: index < state.strikes ? colors.primary : colors.tertiaryText,
                    opacity: index < state.strikes ? 0.95 : 0.45,
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <TeamSelectModal
        modalVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        teams={teams}
        handleSelectTeam={handleSelectTeam}
        modalHeader={modalHeader}
        rowGuesses={state.rowGuesses}
        colGuesses={state.colGuesses}
      />

      <ResultsModal
        visible={resultsModalVisible}
        onClose={() => {
          setResultsDismissed(true);
          setResultsModalVisible(false);
        }}
        score={state.score}
        total={totalTeams}
        game={game}
        matchedRows={state.matchedRows}
        matchedCols={state.matchedCols}
        resetGame={resetGame}
        stats={resultStats}
      />
    </>
  );
}
