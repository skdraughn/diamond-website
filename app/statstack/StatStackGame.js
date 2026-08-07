"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import TouchAppRoundedIcon from "@mui/icons-material/TouchAppRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { generateClient } from "aws-amplify/api";
import useTriviaPlayers from "@/utils/useTriviaPlayers";
import { colors } from "@/app/theme/colors";
import { logFirebaseEvent } from "@/utils/firebaseAnalytics";
import { shareResult } from "@/app/utils/shareResult";
import CompleteGameModalShell from "@/app/components/CompleteGameModalShell";
import ConfirmActionDialog from "@/app/components/ConfirmActionDialog";
import PlayerSearch from "@/app/components/PlayerSearch";
import {
  getStatStackLogo,
  getStatStackLogoMetadata,
} from "@/app/utils/statStackLogos";
import { getStatStackFailureReasons } from "@/app/utils/statStack/seasonEligibility";
import { fetchStatStackPayload } from "@/app/utils/statStack/payload";
import {
  formatMLBSeason,
  getMLBSeasonRangeLabels,
} from "@/app/utils/statStack/formatSeason";
import { decodeMojibake } from "@/app/utils/normalizePlayers";

const client = generateClient();
const legacyQuery = /* GraphQL */ `
  query StatStackGamesByDate($date: AWSDate!, $nextToken: String) {
    statStackGamesByDate(date: $date, nextToken: $nextToken) {
      items {
        id date featuredStatLabel featuredStatUnit featuredStatPrecision
        payloadURL payloadChecksum payloadSchemaVersion
      }
    }
  }
`;
const compactQuery = legacyQuery.replace(
  "payloadURL payloadChecksum payloadSchemaVersion",
  `payloadURL payloadChecksum payloadSchemaVersion
        compactPayloadURL compactPayloadChecksum compactPayloadSchemaVersion`
);

const today = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
const formatScore = (value) => ((Number(value) || 0) / 10).toFixed(1);
const storageKey = (id) => `diamond_stat_stack_${id}`;
const statsKey = "diamond_stat_stack_stats";
const emptyStats = { played: 0, totalScoreTenths: 0, bestScoreTenths: 0 };

function readStatStackStats() {
  if (typeof window === "undefined") return emptyStats;
  try {
    const saved = JSON.parse(localStorage.getItem(statsKey) || "{}");
    return {
      played: Number(saved.played || 0),
      totalScoreTenths: Number(saved.totalScoreTenths || 0),
      bestScoreTenths: Number(saved.bestScoreTenths || 0),
    };
  } catch {
    return emptyStats;
  }
}

function logoSrc(logoKey) {
  return getStatStackLogo(logoKey) || "";
}

function withAlpha(color, alpha) {
  return /^#[0-9a-f]{6}$/i.test(String(color || ""))
    ? `${color}${alpha}`
    : colors.surface;
}

function orderedConstraints(constraints = []) {
  return [...constraints].sort((left, right) => {
    const priority = (constraint) => {
      if (
        constraint.logoKeys?.length ||
        constraint.key === "division" ||
        constraint.key === "league"
      ) return 0;
      if (constraint.key === "season") return 1;
      return 2;
    };
    return priority(left) - priority(right);
  });
}

function ConstraintContent({ constraint }) {
  const leagueLogo =
    constraint.key === "league" ? logoSrc(constraint.value) : "";
  const displayLogoKeys = constraint.logoKeys?.length
    ? constraint.logoKeys
    : constraint.key === "division"
      ? constraint.teamKeys || []
      : [];

  if (leagueLogo) {
    return (
      <Box
        component="img"
        src={leagueLogo}
        alt={`${constraint.value} League`}
        sx={{
          width: { xs: 54, md: 72 },
          height: { xs: 34, md: 46 },
          objectFit: "contain",
        }}
      />
    );
  }

  if (displayLogoKeys.length) {
    const isDivision = constraint.key === "division";
    return (
      <Stack
        direction="row"
        useFlexGap
        gap={0.45}
        sx={{
          flexWrap: isDivision ? { xs: "wrap", sm: "nowrap" } : "wrap",
          width: isDivision ? { xs: 56, sm: "auto" } : "auto",
          maxWidth: "100%",
          alignItems: "center",
        }}
      >
        {displayLogoKeys.map((key) => (
          <Box
            key={key}
            component="img"
            src={logoSrc(key)}
            alt=""
            sx={{
              width:
                displayLogoKeys.length > 1
                  ? { xs: 26, sm: 34, md: 42 }
                  : { xs: 52, md: 66 },
              height:
                displayLogoKeys.length > 1
                  ? { xs: 26, sm: 34, md: 42 }
                  : { xs: 52, md: 66 },
              objectFit: "contain",
            }}
          />
        ))}
      </Stack>
    );
  }

  if (constraint.key === "season") {
    const range = getMLBSeasonRangeLabels(constraint.value);
    return (
      <>
        <Typography
          sx={{
            color: colors.secondaryText,
            fontSize: "0.66rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
          }}
        >
          SEASONS
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "0.8rem", md: "0.92rem" },
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          {range ? `${range.start}–${range.end}` : constraint.value}
        </Typography>
      </>
    );
  }

  return (
    <>
      <Typography
        sx={{
          color: colors.secondaryText,
          fontSize: "0.66rem",
          fontWeight: 800,
          letterSpacing: "0.06em",
        }}
        noWrap
      >
        {(constraint.key === "position"
          ? "POSITION"
          : constraint.label || constraint.key
        ).toUpperCase()}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: "0.8rem", md: "0.92rem" },
          fontWeight: 800,
        }}
      >
        {constraint.value}
      </Typography>
    </>
  );
}

function LoadingBoard() {
  return (
    <Stack spacing={1}>
      <Skeleton variant="rounded" height={92} sx={{ bgcolor: colors.surface }} />
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rounded"
          height={88}
          sx={{ bgcolor: colors.surface }}
        />
      ))}
    </Stack>
  );
}

export default function StatStackGame() {
  const { basicPlayers, loading: playersLoading } = useTriviaPlayers();
  const players = useMemo(
    () =>
      basicPlayers.map((player, statStackIndex) => ({
        id: String(player.id),
        name: decodeMojibake(player.n || player.name),
        pos: player.p || player.pos,
        playerID: String(player.id),
        playerName: decodeMojibake(player.n || player.name),
        position: player.p || player.pos,
        start: Number(player.s ?? player.start),
        end: Number(player.e ?? player.end),
        statStackIndex,
      })),
    [basicPlayers]
  );
  const [game, setGame] = useState(null);
  const [payload, setPayload] = useState(null);
  const [picks, setPicks] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [season, setSeason] = useState("");
  const [pickerError, setPickerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [summaryStats, setSummaryStats] = useState(emptyStats);
  const [reviewEnabled, setReviewEnabled] = useState(false);
  const [answersShown, setAnswersShown] = useState(false);
  const [expandedReviewRow, setExpandedReviewRow] = useState(null);
  const [giveUpOpen, setGiveUpOpen] = useState(false);
  const playersByID = useMemo(
    () => new Map(players.map((player) => [player.playerID, player])),
    [players]
  );

  useEffect(() => {
    if (playersLoading || !basicPlayers.length) return undefined;
    let active = true;
    async function load() {
      try {
        let response;
        try {
          response = await client.graphql({
            query: compactQuery,
            variables: { date: today() },
            authMode: "apiKey",
          });
        } catch (queryError) {
          if (!JSON.stringify(queryError).includes("compactPayload")) throw queryError;
          response = await client.graphql({
            query: legacyQuery,
            variables: { date: today() },
            authMode: "apiKey",
          });
        }
        const nextGame = response.data?.statStackGamesByDate?.items?.[0];
        if (!nextGame) throw new Error("No Stat Stack game is available today.");
        const nextPayload = await fetchStatStackPayload(
          nextGame,
          basicPlayers,
          (event, details) => logFirebaseEvent(`stat_stack_${event}`, {
            app: "diamond",
            game: "stat_stack",
            ...details,
          })
        );
        if (!active) return;
        setGame(nextGame);
        setPayload(nextPayload);
        const saved = JSON.parse(localStorage.getItem(storageKey(nextGame.id)) || "null");
        if (Array.isArray(saved?.picks)) {
          setPicks(saved.picks);
          setResultsOpen(saved.picks.length === 5);
        }
        setSummaryStats(readStatStackStats());
        logFirebaseEvent("game_start", { app: "diamond", game: "stat_stack" });
      } catch (loadError) {
        console.error("[StatStack] Failed to load today's board", loadError);
        if (active) setError(loadError.message || "Stat Stack could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [basicPlayers, playersLoading]);

  useEffect(() => {
    if (!game) return;
    const key = storageKey(game.id);
    const current = JSON.parse(localStorage.getItem(key) || "{}");
    localStorage.setItem(
      key,
      JSON.stringify({ picks, statsRecorded: Boolean(current.statsRecorded) })
    );
  }, [game, picks]);

  const usedPlayers = useMemo(() => new Set(picks.map((pick) => pick.playerID)), [picks]);
  const scoreTenths = useMemo(
    () =>
      picks.length
        ? Math.round(
            picks.reduce((sum, pick) => sum + Number(pick.percentileTenths || 0), 0) /
              picks.length
          )
        : 0,
    [picks]
  );
  const completed = picks.length === 5;

  const recordCompletedGame = (nextPicks) => {
    if (!game) return;
    const gameStorageKey = storageKey(game.id);
    const savedGame = JSON.parse(localStorage.getItem(gameStorageKey) || "{}");
    if (savedGame.statsRecorded) {
      setSummaryStats(readStatStackStats());
      return;
    }

    const completedScore = Math.round(
      nextPicks.reduce(
        (sum, item) => sum + Number(item.percentileTenths || 0),
        0
      ) / 5
    );
    const previous = JSON.parse(localStorage.getItem(statsKey) || "{}");
    const nextStats = {
      played: Number(previous.played || 0) + 1,
      totalScoreTenths:
        Number(previous.totalScoreTenths || 0) + completedScore,
      bestScoreTenths: Math.max(
        Number(previous.bestScoreTenths || 0),
        completedScore
      ),
    };

    localStorage.setItem(statsKey, JSON.stringify(nextStats));
    setSummaryStats(nextStats);
    localStorage.setItem(
      gameStorageKey,
      JSON.stringify({ picks: nextPicks, statsRecorded: true })
    );
    window.dispatchEvent(
      new CustomEvent("diamond-stats-updated", {
        detail: { key: statsKey },
      })
    );
  };
  const careerSeasons = useMemo(() => {
    if (!selectedPlayer) return [];
    const maximum = Number(payload?.playerDataset?.maximumSeason) || new Date().getFullYear();
    const start = Math.max(1981, selectedPlayer.start || 1981);
    const end = Math.min(maximum, selectedPlayer.end || maximum);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => end - index);
  }, [payload?.playerDataset?.maximumSeason, selectedPlayer]);

  const openPicker = (row) => {
    if (completed && answersShown) {
      setExpandedReviewRow((current) => current === row.id ? null : row.id);
      return;
    }
    if (completed || picks.some((pick) => pick.rowID === row.id)) return;
    setActiveRow(row);
    setSelectedPlayer(null);
    setSeason("");
    setPickerError("");
  };

  const submitPick = () => {
    if (!activeRow || !selectedPlayer || !season) return;
    if (usedPlayers.has(selectedPlayer.playerID)) {
      setPickerError(["Each player can only be used once."]);
      return;
    }
    const answer = activeRow.answers.find(
      (candidate) =>
        String(candidate.playerID) === selectedPlayer.playerID &&
        Number(candidate.season) === Number(season)
    );
    if (!answer) {
      setPickerError(
        getStatStackFailureReasons({
          row: activeRow,
          player: selectedPlayer,
          season: Number(season),
          statLabel: game.featuredStatLabel,
          teamNames: activeRow.teamNames || payload.teams || {},
          playerDataset: payload.playerDataset,
        })
      );
      return;
    }
    const pick = {
      ...answer,
      rowID: activeRow.id,
      playerName: selectedPlayer.playerName,
      teamName: payload.teams?.[answer.logoKey] || answer.teamName || answer.teamKey,
    };
    const next = [...picks, pick];
    setPicks(next);
    setActiveRow(null);
    if (next.length === 5) {
      recordCompletedGame(next);
      setResultsOpen(true);
      logFirebaseEvent("game_complete", {
        app: "diamond",
        game: "stat_stack",
        score_tenths: Math.round(
          next.reduce((sum, item) => sum + Number(item.percentileTenths || 0), 0) /
            next.length
        ),
      });
    }
  };

  const giveUp = () => {
    const next = payload.rows.map((row) => {
      const existing = picks.find((pick) => pick.rowID === row.id);
      return (
        existing || {
          rowID: row.id,
          playerID: `skipped-${row.id}`,
          playerName: "Skipped",
          season: null,
          statValue: 0,
          percentileTenths: 0,
          skipped: true,
        }
      );
    });
    setPicks(next);
    setGiveUpOpen(false);
    recordCompletedGame(next);
    setResultsOpen(true);
    logFirebaseEvent("game_complete", {
      app: "diamond",
      game: "stat_stack",
      score_tenths: Math.round(
        next.reduce((sum, item) => sum + Number(item.percentileTenths || 0), 0) / 5
      ),
      gave_up: 1,
    });
  };

  const share = async () => {
    const orderedPicks = payload.rows
      .map((row) => picks.find((pick) => pick.rowID === row.id))
      .filter(Boolean);
    const blocks = orderedPicks.map((pick) => {
      const value = Number(pick.percentileTenths) || 0;
      if (value >= 900) return "🟧";
      if (value >= 700) return "🟨";
      if (value >= 500) return "🟦";
      return "⬛";
    }).join("");
    const rowScores = orderedPicks
      .map(
        (pick, index) =>
          `${index + 1}. ${Number(pick.statValue || 0).toLocaleString()} ${
            game.featuredStatLabel
          } · ${formatScore(pick.percentileTenths)} percentile`
      )
      .join("\n");
    const text = `Blacktop Trivia\nStat Stack ${game.date}\nToday’s category: ${
      game.featuredStatLabel
    }\nScore: ${formatScore(
      scoreTenths
    )} percentile\n\n${rowScores}\n\n${blocks}`;
    const outcome = await shareResult({ game: "stat_stack", title: "Stat Stack", text });
    if (outcome === "copied") alert("Copied to clipboard!");
  };

  const tryAgain = () => {
    if (!game) return;
    localStorage.setItem(
      storageKey(game.id),
      JSON.stringify({ picks: [], statsRecorded: false })
    );
    setPicks([]);
    setResultsOpen(false);
    setReviewEnabled(false);
    setAnswersShown(false);
    setExpandedReviewRow(null);
    setActiveRow(null);
    setSelectedPlayer(null);
    setSeason("");
    setPickerError("");
  };

  const reviewBoard = () => {
    setReviewEnabled(true);
    setResultsOpen(false);
  };

  if (loading || playersLoading) {
    return <LoadingBoard />;
  }
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Stack spacing={0.8}>
        <Box
          sx={{
            px: { xs: 0.5, md: 0.75 },
            pb: 1.25,
            mb: 0.35,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Stack direction="row" gap={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: colors.secondaryText,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                }}
              >
                STAT
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" }, fontWeight: 800 }}>
                {game.featuredStatLabel}
              </Typography>
            </Box>
            <Box
              sx={{
                position: "relative",
                minWidth: 104,
                pl: 2,
                textAlign: "right",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: -2,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  bgcolor: colors.statStack,
                  borderRadius: 4,
                },
              }}
            >
              <Typography sx={{ color: colors.secondaryText, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em" }}>
                SCORE
              </Typography>
              <Typography sx={{ fontSize: { xs: "1.75rem", md: "2rem" }, fontWeight: 800, lineHeight: 1.1 }}>
                {picks.length ? formatScore(scoreTenths) : "—"}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {payload.rows.map((row, rowIndex) => {
          const pick = picks.find((item) => item.rowID === row.id);
          const constraints = orderedConstraints(row.constraints);
          const teamColor = pick
            ? getStatStackLogoMetadata(pick.logoKey)?.primaryColor || colors.statStack
            : colors.statStack;
          const isExpanded = answersShown && expandedReviewRow === row.id;
          return (
            <Box key={row.id}>
            <Paper
              component="button"
              type="button"
              disabled={completed && !answersShown}
              onClick={() => openPicker(row)}
              sx={{
                appearance: "none",
                width: "100%",
                minHeight: 78,
                p: 0,
                color: colors.text,
                font: "inherit",
                textAlign: "left",
                cursor:
                  completed && answersShown
                    ? "pointer"
                    : pick || completed
                      ? "default"
                      : "pointer",
                borderColor: pick ? teamColor : colors.border,
                borderRadius: isExpanded ? "6px 6px 0 0" : 1.5,
                bgcolor: pick
                  ? withAlpha(teamColor, "42")
                  : "rgba(21, 21, 22, 0.88)",
                boxShadow: "none",
                overflow: "hidden",
                transition: "border-color 160ms ease, background-color 160ms ease",
                "&:hover": (pick || completed) && !answersShown ? {} : {
                  borderColor: colors.statStack,
                  bgcolor: "rgba(35, 35, 38, 0.94)",
                },
                "&:disabled": { color: colors.text, opacity: 1 },
              }}
            >
              <Stack direction="row" sx={{ minHeight: 78, alignItems: "stretch" }}>
                <Box
                  sx={{
                    width: { xs: 42, sm: 52 },
                    flex: "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRight: `1px solid ${pick ? teamColor : colors.border}`,
                    bgcolor: pick
                      ? withAlpha(teamColor, "66")
                      : "rgba(5, 5, 6, 0.38)",
                  }}
                >
                  <Typography
                    sx={{
                      color: pick ? colors.text : colors.tertiaryText,
                      fontSize: "0.72rem",
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textShadow: pick
                        ? "0 1px 3px rgba(0,0,0,0.72)"
                        : "none",
                    }}
                  >
                    {String(rowIndex + 1).padStart(2, "0")}
                  </Typography>
                </Box>
                {pick ? (
                <Stack
                  direction="row"
                  gap={1.25}
                  sx={{ flex: 1, minWidth: 0, p: { xs: 1, md: 1.15 }, alignItems: "center" }}
                >
                  {!pick.skipped && pick.logoKey ? (
                    <Box
                      component="img"
                      src={logoSrc(pick.logoKey)}
                      alt=""
                      sx={{
                        width: { xs: 52, md: 66 },
                        height: { xs: 52, md: 66 },
                        objectFit: "contain",
                        flex: "0 0 auto",
                      }}
                    />
                  ) : (
                    <Box sx={{ width: 44, flex: "0 0 auto" }} />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={800} noWrap>
                      {decodeMojibake(pick.playerName)}
                    </Typography>
                    <Typography color={colors.secondaryText}>
                      {pick.skipped
                        ? "Unfilled row"
                        : `${formatMLBSeason(pick.season)} · ${pick.teamName || ""}`}
                    </Typography>
                  </Box>
                  <Box sx={{ pl: 1.5, minWidth: 120, textAlign: "right" }}>
                    <Typography fontWeight={800}>
                      {Number(pick.statValue || 0).toLocaleString()}{" "}
                      <Typography component="span" sx={{ color: colors.secondaryText, fontSize: "0.66rem", fontWeight: 800 }}>
                        {game.featuredStatLabel}
                      </Typography>
                    </Typography>
                    <Typography sx={{ color: colors.statStack, fontSize: "0.68rem", fontWeight: 800 }}>
                      {formatScore(pick.percentileTenths)} PERCENTILE
                    </Typography>
                  </Box>
                  {answersShown ? (
                    <ExpandMoreRoundedIcon
                      sx={{
                        ml: 0.25,
                        color: colors.secondaryText,
                        transition: "transform 160ms ease",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  ) : null}
                </Stack>
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "grid",
                    gridTemplateColumns: {
                      xs: `repeat(${constraints.length}, minmax(0, 1fr))`,
                      sm: constraints
                        .map((constraint) => {
                          if (constraint.key === "division") {
                            return "minmax(145px, 1.65fr)";
                          }
                          if (constraint.key === "league") {
                            return "minmax(90px, 0.85fr)";
                          }
                          if (constraint.key === "season") {
                            return "minmax(105px, 0.9fr)";
                          }
                          return "minmax(80px, 0.75fr)";
                        })
                        .join(" "),
                    },
                    minHeight: 76,
                  }}
                >
                  {constraints.map((constraint, constraintIndex) => (
                    <Box
                      key={`${row.id}-${constraint.key}-${constraint.value}`}
                      sx={{
                        px: { xs: 0.75, md: 1.1 },
                        py: 0.6,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        borderRight:
                          constraintIndex < constraints.length - 1
                            ? `1px solid ${colors.border}`
                            : "none",
                      }}
                    >
                      <ConstraintContent constraint={constraint} />
                    </Box>
                  ))}
                </Box>
              )}
              </Stack>
            </Paper>
            <Collapse in={isExpanded}>
              <Box
                sx={{
                  width: "100%",
                  border: `1px solid ${teamColor}88`,
                  borderTop: 0,
                  borderRadius: "0 0 6px 6px",
                  overflow: "hidden",
                  bgcolor: colors.background,
                }}
              >
                {[...(row.answers || [])]
                  .sort(
                    (left, right) =>
                      Number(right.statValue) - Number(left.statValue) ||
                      Number(right.percentileTenths) -
                        Number(left.percentileTenths) ||
                      Number(right.season) - Number(left.season)
                  )
                  .slice(0, 5)
                  .map((answer, answerIndex) => {
                    const player = playersByID.get(String(answer.playerID));
                    const answerTeamColor =
                      getStatStackLogoMetadata(answer.logoKey)?.primaryColor ||
                      teamColor;
                    return (
                      <Stack
                        key={`${answer.playerID}-${answer.season}-${answerIndex}`}
                        direction="row"
                        sx={{
                          minHeight: 72,
                          bgcolor: withAlpha(answerTeamColor, "32"),
                          alignItems: "center",
                        }}
                      >
                        <Stack
                          direction="row"
                          gap={1.25}
                          sx={{ flex: 1, minWidth: 0, p: { xs: 1, md: 1.15 }, alignItems: "center" }}
                        >
                        <Box
                          component="img"
                          src={logoSrc(answer.logoKey)}
                          alt=""
                          sx={{
                            width: { xs: 48, md: 56 },
                            height: { xs: 48, md: 56 },
                            objectFit: "contain",
                            flex: "0 0 auto",
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={800} noWrap>
                            {player?.playerName || player?.name || "MLB player"}
                          </Typography>
                          <Typography variant="body2" color={colors.secondaryText}>
                            {formatMLBSeason(answer.season)}
                            {payload.teams?.[answer.logoKey] || answer.teamName || answer.teamKey
                              ? ` · ${
                                  payload.teams?.[answer.logoKey] ||
                                  answer.teamName ||
                                  answer.teamKey
                                }`
                              : ""}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            pl: 1.5,
                            minWidth: 120,
                            textAlign: "right",
                          }}
                        >
                          <Typography fontWeight={800}>
                            {Number(answer.statValue || 0).toLocaleString()}{" "}
                            <Typography
                              component="span"
                              sx={{
                                color: colors.secondaryText,
                                fontSize: "0.66rem",
                                fontWeight: 800,
                              }}
                            >
                              {game.featuredStatLabel}
                            </Typography>
                          </Typography>
                          <Typography
                            sx={{
                              color: colors.statStack,
                              fontSize: "0.68rem",
                              fontWeight: 800,
                            }}
                          >
                            {formatScore(answer.percentileTenths)} PERCENTILE
                          </Typography>
                        </Box>
                        </Stack>
                      </Stack>
                    );
                  })}
              </Box>
            </Collapse>
            </Box>
          );
        })}

        {!completed && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={1}
            sx={{ pt: 0.75, alignItems: "center", justifyContent: "space-between" }}
          >
            <Stack direction="row" gap={0.75} sx={{ color: colors.secondaryText, alignItems: "center" }}>
              <TouchAppRoundedIcon sx={{ color: colors.statStack, fontSize: 20 }} />
              <Typography variant="body2">Click a row to select a player</Typography>
            </Stack>
            <Button
              variant="text"
              color="error"
              onClick={() => setGiveUpOpen(true)}
            >
              Give up and reveal results
            </Button>
          </Stack>
        )}
        {completed && reviewEnabled ? (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={1}
            sx={{ pt: 0.75, alignItems: "center", justifyContent: "space-between" }}
          >
            {answersShown ? (
              <Typography variant="body2" color={colors.secondaryText}>
                Click any row to view its top five eligible player-seasons.
              </Typography>
            ) : (
              <Box />
            )}
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                onClick={tryAgain}
                sx={{ borderColor: colors.border, color: colors.text }}
              >
                Try Again
              </Button>
              {!answersShown ? (
                <Button
                  variant="outlined"
                  onClick={() => setAnswersShown(true)}
                  sx={{ borderColor: colors.text, color: colors.text }}
                >
                  Show answers
                </Button>
              ) : null}
            </Stack>
          </Stack>
        ) : null}
      </Stack>

      <Dialog
        open={Boolean(activeRow)}
        onClose={() => setActiveRow(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              height: { xs: "min(620px, 88dvh)", sm: 620 },
              maxHeight: "88dvh",
              bgcolor: colors.backgroundHighlight,
              border: `1px solid ${colors.statStack}66`,
              boxShadow: "none",
              borderRadius: 2,
              backgroundImage: "none",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
            fontWeight: 800,
          }}
        >
          Select a player
          <IconButton
            onClick={() => setActiveRow(null)}
            aria-label="Close player picker"
            size="small"
          >
            <CloseRoundedIcon sx={{ color: colors.statStack }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <Stack spacing={2} sx={{ pt: 1, minHeight: 0, flex: 1 }}>
            {!selectedPlayer ? (
              <PlayerSearch
                triviaPlayers={players}
                handleSelectPlayer={(player) => {
                  setSelectedPlayer(player);
                  setSeason("");
                  setPickerError("");
                }}
                disabled={false}
                guesses={[...usedPlayers]}
                isTeamGame={false}
                teams={[]}
                inlineResults
                inputBackgroundColor={colors.background}
                accentColor={colors.statStack}
              />
            ) : (
              <Paper
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  bgcolor: colors.background,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={800}>{selectedPlayer.playerName}</Typography>
                  <Typography variant="body2" color={colors.secondaryText}>
                    {selectedPlayer.position || "MLB player"} · {selectedPlayer.start}–
                    {selectedPlayer.end}
                  </Typography>
                </Box>
                <Button
                  variant="text"
                  sx={{ color: colors.statStack }}
                  onClick={() => {
                    setSelectedPlayer(null);
                    setSeason("");
                    setPickerError("");
                  }}
                >
                  Change
                </Button>
              </Paper>
            )}
            {selectedPlayer ? (
              <FormControl
                fullWidth
                sx={{
                  "& .MuiInputLabel-root.Mui-focused": { color: colors.statStack },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.statStack,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.statStack,
                  },
                }}
              >
                <InputLabel id="stat-stack-season">Season</InputLabel>
                <Select
                  labelId="stat-stack-season"
                  label="Season"
                  value={season}
                  onChange={(event) => {
                    setSeason(event.target.value);
                    setPickerError("");
                  }}
                >
                  {careerSeasons.map((year) => (
                    <MenuItem key={year} value={year}>
                      {formatMLBSeason(year)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            {pickerError?.length ? (
              <Alert severity="warning">
                <Stack spacing={0.4}>
                  {pickerError.map((reason) => (
                    <Typography key={reason} variant="body2">
                      {reason}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="text"
            onClick={() => setActiveRow(null)}
            sx={{ color: colors.secondaryText }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitPick}
            disabled={!selectedPlayer || !season}
            sx={{
              bgcolor: colors.text,
              color: colors.background,
              "&:hover": { bgcolor: "#ded8ce" },
            }}
          >
            Lock pick
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmActionDialog
        open={giveUpOpen}
        onClose={() => setGiveUpOpen(false)}
        onConfirm={giveUp}
        title="Give up this stack?"
        description="Your remaining rows will be marked as skipped and today’s results will be revealed."
        confirmLabel="Give up"
        accentColor={colors.statStack}
      />

      <CompleteGameModalShell
        open={resultsOpen}
        onClose={() => setResultsOpen(false)}
        game="Stat Stack"
        statusTitle="Stat Stack complete"
        statusColor={colors.text}
        hero={
          <Box sx={{ textAlign: "center", mb: 2.5 }}>
            <Typography
              sx={{
                color: colors.statStack,
                fontSize: { xs: "2.8rem", sm: "3.4rem" },
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {formatScore(scoreTenths)}
            </Typography>
            <Typography sx={{ color: colors.secondaryText, mt: 0.75, fontWeight: 800 }}>
              Percentile
            </Typography>
          </Box>
        }
        statsItems={[
          { label: "Played", value: summaryStats.played, size: 4 },
          {
            label: "Avg",
            value: summaryStats.played
              ? formatScore(
                  Math.round(
                    summaryStats.totalScoreTenths / summaryStats.played
                  )
                )
              : "0.0",
            size: 4,
          },
          {
            label: "Best",
            value: formatScore(summaryStats.bestScoreTenths),
            size: 4,
          },
        ]}
        actions={[
          {
            label: "Try Again",
            variant: "outlined",
            onClick: tryAgain,
            sx: { borderColor: colors.border, color: colors.text },
          },
          {
            label: "Share",
            variant: "contained",
            onClick: share,
            sx: {
              bgcolor: colors.text,
              color: colors.background,
              "&:hover": { bgcolor: "#ded8ce" },
            },
          },
        ]}
        secondaryActions={[
          {
            label: "Review board",
            variant: "outlined",
            onClick: reviewBoard,
            sx: { borderColor: colors.text, color: colors.text },
          },
        ]}
      />
    </>
  );
}
