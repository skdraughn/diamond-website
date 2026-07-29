"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { generateClient } from "aws-amplify/api";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { appLinks } from "@/utils/appLinks";
import useTriviaPlayers from "@/utils/useTriviaPlayers";
import { STATIC_TEAMS } from "@/utils/teams";
import { teamLogoMap } from "@/utils/teamLogoMap";
import { colors } from "../theme/colors";

const STRIKEOUT_STATE_PREFIX = "diamond_strikeout_game_";

function loadStrikeoutState(gameID: string) {
  if (typeof window === "undefined" || !gameID) return null;
  try {
    const raw = localStorage.getItem(`${STRIKEOUT_STATE_PREFIX}${gameID}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStrikeoutState(gameID: string, state: Record<string, any>) {
  if (typeof window === "undefined" || !gameID) return;
  localStorage.setItem(`${STRIKEOUT_STATE_PREFIX}${gameID}`, JSON.stringify(state));
}

const customRedZoneGamesByDate = /* GraphQL */ `
  query RedZoneGamesByDate(
    $date: AWSDate!
    $filter: ModelRedZoneGameFilterInput
    $limit: Int
    $nextToken: String
  ) {
    redZoneGamesByDate(
      date: $date
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        date
        title
        subtitle
        numStrikes
        teamsHidden
        prompt
        cells {
          hint
          team
          teamID
          index
          answerPlayerID
          answerPlayerName
        }
        adLocked
      }
      nextToken
    }
  }
`;

function getTodayDate() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - offsetMs);
  return local.toISOString().slice(0, 10);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "").trim();
}

function findTeam(teamID?: string) {
  if (!teamID) return null;
  return (
    STATIC_TEAMS.find((team) =>
      team.abbrs.some((abbr) => abbr.toUpperCase() === teamID.toUpperCase())
    ) || null
  );
}

function StrikeoutHeader({ title, subtitle, prompt, score, strikes, numStrikes }: any) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        alignItems: "center",
        backgroundColor: colors.backgroundHighlight,
        borderRadius: 2,
        py: 1,
        px: 2,
        mb: 2,
        width: "100%",
        border: `1px solid ${colors.border}`,
      }}
    >
      <Box
        sx={{
          flex: 2.5,
          minWidth: 0,
          borderRight: `1px solid ${colors.surfaceStrong}`,
          pr: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: subtitle ? 0.5 : 0, fontSize: { xs: ".95rem", md: "1.2rem" } }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" sx={{ color: colors.secondaryText }}>
            {subtitle}
          </Typography>
        ) : null}
        {prompt ? (
          <Typography
            variant="body2"
            sx={{ mt: 0.5, fontStyle: "italic", color: colors.secondaryText }}
          >
            {prompt}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "row" }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" align="center" sx={{ display: "block", fontWeight: 700 }}>
            Score
          </Typography>
          <Typography
            variant="h1"
            align="center"
            sx={{ color: colors.grass, fontSize: { xs: "2.1rem", md: "3rem" }, lineHeight: 1 }}
          >
            {score}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" align="center" sx={{ display: "block", fontWeight: 700 }}>
            Strikes
          </Typography>
          <Typography
            variant="h1"
            align="center"
            sx={{ color: colors.strikeout, fontSize: { xs: "2.1rem", md: "3rem" }, lineHeight: 1 }}
          >
            {strikes}
            <Typography variant="caption" component="span">
              /{numStrikes}
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function StrikeoutSearch({ players, guesses, disabled, onSelect }: any) {
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredPlayers = useMemo(() => {
    const query = normalize(inputValue);
    if (!query) return [];
    return players
      .filter((player: any) => {
        const name = player.name || player.n || "";
        return normalize(name).includes(query) && !guesses.includes(player.id);
      })
      .slice(0, 8);
  }, [guesses, inputValue, players]);

  const choose = (player: any) => {
    onSelect(player);
    setInputValue("");
    setHighlightedIndex(0);
  };

  const handleKeyDown = (event: any) => {
    if (!filteredPlayers.length) return;
    if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredPlayers.length);
    } else if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev === 0 ? filteredPlayers.length - 1 : prev - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(filteredPlayers[highlightedIndex]);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3, width: "100%", position: "relative" }}>
      <TextField
        fullWidth
        variant="outlined"
        color="primary"
        placeholder="Type a player name..."
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Guess player input"
        disabled={disabled}
        sx={{
          "& .MuiInputBase-input": {
            color: colors.text,
            bgcolor: colors.backgroundHighlight,
            borderRadius: 1,
          },
        }}
      />
      {inputValue && filteredPlayers.length > 0 ? (
        <Paper sx={{ position: "absolute", top: "100%", width: "100%", zIndex: 10, p: 0 }}>
          <List dense sx={{ bgcolor: colors.background }}>
            {filteredPlayers.map((player: any, index: number) => (
              <ListItemButton
                key={player.id}
                onClick={() => choose(player)}
                selected={index === highlightedIndex}
                sx={{
                  bgcolor: index === highlightedIndex ? colors.backgroundHighlight : "transparent",
                  "&:hover": { bgcolor: colors.backgroundHighlight },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {player.name || player.n}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                    {[player.s || player.start, player.e || player.end].filter(Boolean).join(" - ")}
                    {player.p ? ` | ${player.p}` : ""}
                  </Typography>
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Paper>
      ) : null}
    </Box>
  );
}

function StrikeoutCell({
  cell,
  index,
  team,
  player,
  isRevealed,
  completed,
  answersShown,
  shouldShowTeam,
}: any) {
  const isMissed = completed && answersShown && !isRevealed;
  const showContent = isRevealed || isMissed;
  const logoSrc = team?.logoURL ? teamLogoMap[team.logoURL as keyof typeof teamLogoMap] : null;
  const playerName = player?.name || player?.n || cell.answerPlayerName;
  const bgColor = isRevealed
    ? `${colors.grass}50`
    : isMissed
      ? `${colors.primary}42`
      : colors.backgroundHighlight;
  const borderColor = isRevealed ? colors.grass : isMissed ? colors.primary : colors.border;

  return (
    <Box
      sx={{
        backgroundColor: bgColor,
        borderRadius: "6px",
        width: "100%",
        aspectRatio: "1 / 1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        py: "6px",
        px: "4px",
        border: `1px solid ${borderColor}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="body1"
        align="center"
        sx={{
          zIndex: 1,
          fontWeight: 700,
          fontSize: { xs: ".65rem", sm: ".74rem", md: ".88rem" },
          lineHeight: 1.08,
          color: isMissed ? colors.primary : colors.text,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {cell.hint}
      </Typography>

      {cell.percent !== undefined ? (
        <Typography variant="caption" sx={{ color: colors.secondaryText, lineHeight: 1 }}>
          {(cell.percent * 100).toFixed(0)}%
        </Typography>
      ) : null}

      {((showContent && team) || shouldShowTeam) && (
        <Box sx={{ width: "58%", aspectRatio: "1", position: "relative", my: 0.35 }}>
          {logoSrc ? (
            <Image src={logoSrc} alt={team?.name || "Team"} fill sizes="80px" style={{ objectFit: "contain" }} />
          ) : (
            <Box
              sx={{
                height: "100%",
                width: "100%",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: colors.surface,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 900 }}>
                {team?.abbreviation || cell.team || cell.teamID || "TM"}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Typography
        variant="body1"
        align="center"
        sx={{
          color: showContent ? colors.text : colors.secondaryText,
          zIndex: 1,
          fontSize: { md: ".9rem", xs: ".68rem" },
          fontWeight: 800,
          lineHeight: 1.05,
          width: "100%",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {showContent && playerName ? playerName : "?"}
      </Typography>

      <Typography variant="caption" sx={{ position: "absolute", top: 2, left: 5, color: colors.tertiaryText, fontSize: 10 }}>
        {index + 1}
      </Typography>
    </Box>
  );
}

function CompleteDialog({
  open,
  isCompleted,
  score,
  strikes,
  total,
  stats,
  onClose,
  onShare,
  onTryAgain,
}: any) {
  const correctPercent = stats?.redZoneGamesTotalCells
    ? Math.round(
        (stats.redZoneGamesCorrectCells / stats.redZoneGamesTotalCells) * 100
      )
    : 0;
  const winPercent = stats?.played
    ? Math.round(((stats.won || 0) / stats.played) * 100)
    : 0;

  return (
    <Dialog
      open={open}
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
            fontWeight: 900,
            color: isCompleted ? colors.grass : colors.strikeout,
          }}
        >
          {isCompleted ? "You Won!" : "You Lost"}
        </Typography>
        <IconButton onClick={onClose} aria-label="Close game result">
          <CloseRoundedIcon sx={{ color: colors.text }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "4px !important", pb: 3 }}>
        <Typography sx={{ color: colors.text, mb: 2.5 }}>
          You got {score} out of {total} correct with {strikes} strikes.
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
                label: "Total Correct Cells",
                value: stats?.redZoneGamesCorrectCells || 0,
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
          <Button fullWidth variant="outlined" onClick={onTryAgain}>
            Try Again
          </Button>
          <Button fullWidth onClick={onShare}>
            Share
          </Button>
        </Stack>
        <Button fullWidth onClick={onClose} variant="text" sx={{ mt: 1.25 }}>
          Review Board
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function PlayStrikeout() {
  const client = useMemo(() => generateClient(), []);
  const date = getTodayDate();
  const recordedStatsRef = useRef(false);
  const restoredGameRef = useRef<string | null>(null);
  const { basicPlayers, loading: playersLoading } = useTriviaPlayers();

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState<Record<number, any>>({});
  const [guesses, setGuesses] = useState<string[]>([]);
  const [answersShown, setAnswersShown] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resultsDismissed, setResultsDismissed] = useState(false);
  const [resultStats, setResultStats] = useState<any>(null);

  const numStrikes = game?.numStrikes || 3;
  const isGameOver = game ? strikes >= numStrikes : false;
  const isCompleted = game?.cells ? Object.keys(matched).length === game.cells.length : false;
  const isFinished = isGameOver || isCompleted;

  useEffect(() => {
    if (!date) return;
    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      try {
        let nextToken = null;
        let unlocked = null;
        do {
          const res = (await client.graphql({
            query: customRedZoneGamesByDate,
            variables: { date, nextToken },
            authMode: "apiKey",
          })) as any;
          const payload = res?.data?.redZoneGamesByDate;
          const items = payload?.items || [];
          nextToken = payload?.nextToken;
          unlocked = items.find((item: any) => !item?.adLocked);
        } while (nextToken && !unlocked);

        if (unlocked?.cells) {
          unlocked.cells.sort((a: any, b: any) => a.index - b.index);
        }

        if (unlocked?.id) {
          const saved = loadStrikeoutState(unlocked.id);
          if (saved) {
            setStrikes(Number(saved.strikes) || 0);
            setScore(Number(saved.score) || 0);
            setMatched(saved.matched && typeof saved.matched === "object" ? saved.matched : {});
            setGuesses(Array.isArray(saved.guesses) ? saved.guesses : []);
            setAnswersShown(Boolean(saved.answersShown));
            // A dismissal only lasts for the current visit. Returning to a
            // completed daily game should show its result again.
            setResultsDismissed(false);
            recordedStatsRef.current = Boolean(saved.statsRecorded);
            if (saved.statsRecorded) {
              try {
                setResultStats(
                  JSON.parse(localStorage.getItem("diamond_strikeout_stats") || "{}")
                );
              } catch {
                setResultStats(null);
              }
            }
          }
          restoredGameRef.current = unlocked.id;
        }
        setGame(unlocked || null);
      } catch (err) {
        console.error("Error fetching Strikeout game:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [client, date]);

  useEffect(() => {
    if (!isFinished || !game?.cells?.length) return;

    if (!recordedStatsRef.current) {
      const won = score === game.cells.length;
      const raw = localStorage.getItem("diamond_strikeout_stats");
      const previous = raw ? JSON.parse(raw) : {};
      const next = {
        played: (previous.played || 0) + 1,
        streak: won ? (previous.streak || 0) + 1 : 0,
        maxStreak: won
          ? Math.max(previous.maxStreak || 0, (previous.streak || 0) + 1)
          : previous.maxStreak || 0,
        won: (previous.won || 0) + (won ? 1 : 0),
        redZoneGamesCorrectCells: (previous.redZoneGamesCorrectCells || 0) + score,
        redZoneGamesTotalCells: (previous.redZoneGamesTotalCells || 0) + game.cells.length,
      };
      localStorage.setItem("diamond_strikeout_stats", JSON.stringify(next));
      setResultStats(next);
      window.dispatchEvent(new Event("diamond-stats-updated"));
      recordedStatsRef.current = true;
    }

    if (!resultsDismissed) {
      const timer = window.setTimeout(() => setModalVisible(true), 500);
      return () => window.clearTimeout(timer);
    }
  }, [game, isFinished, resultsDismissed, score]);

  useEffect(() => {
    if (!game?.id || restoredGameRef.current !== game.id) return;
    saveStrikeoutState(game.id, {
      strikes,
      score,
      matched,
      guesses,
      answersShown,
      resultsDismissed,
      statsRecorded: recordedStatsRef.current,
    });
  }, [answersShown, game?.id, guesses, matched, resultsDismissed, score, strikes]);

  const playerById = useMemo(
    () => Object.fromEntries((basicPlayers || []).map((player: any) => [player.id, player])),
    [basicPlayers]
  );

  const handleGuess = (player: any) => {
    if (isFinished || !game || guesses.includes(player.id)) return;

    const targetCell = game.cells.find((cell: any) => cell.answerPlayerID === player.id);
    setGuesses((prev) => [...prev, player.id]);

    if (targetCell) {
      setMatched((prev) => ({
        ...prev,
        [targetCell.index - 1]: {
          correct: true,
          player: { name: player.n || player.name, id: player.id },
        },
      }));
      setScore((prev) => prev + 1);
    } else {
      setStrikes((prev) => prev + 1);
    }
  };

  const handleShare = async () => {
    if (!game) return;
    const grid = game.cells
      .map((_: any, index: number) => (matched[index] ? "🟩" : "🟥"))
      .join("");
    const shareText = `Diamond Trivia\nStrikeout ${game.date}\n\nScore: ${score}/${game.cells.length}\nStrikes: ${strikes}\n\n${grid}\n\n${appLinks.appStore}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Diamond Trivia", text: shareText });
      } catch {
        await navigator.clipboard?.writeText(shareText);
      }
    } else {
      await navigator.clipboard?.writeText(shareText);
      alert("Results copied to clipboard.");
    }
  };

  const handleTryAgain = () => {
    setStrikes(0);
    setAnswersShown(false);
    setModalVisible(false);
    setResultsDismissed(false);
    setResultStats(null);
    recordedStatsRef.current = false;
  };

  if (loading || playersLoading) {
    return (
      <Skeleton
        variant="rectangular"
        height={600}
        width="100%"
        animation="wave"
        sx={{ bgcolor: colors.backgroundHighlight, borderRadius: 2 }}
      />
    );
  }

  if (error || !game) {
    return (
      <Box sx={{ height: 420, display: "grid", placeItems: "center", color: colors.secondaryText }}>
        {error ? "Error loading Strikeout." : "No Strikeout game is available today."}
      </Box>
    );
  }

  return (
    <>
      <StrikeoutHeader
        title={game.title || "Strikeout"}
        subtitle={game.subtitle}
        prompt={game.prompt}
        score={score}
        strikes={strikes}
        numStrikes={numStrikes}
      />

      <StrikeoutSearch
        players={basicPlayers}
        guesses={guesses}
        disabled={isFinished}
        onSelect={handleGuess}
      />

      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: { xs: 0.5, md: 0.5 },
            width: "100%",
          }}
        >
          {game.cells.map((cell: any, index: number) => {
            const isRevealed = Boolean(matched[index]);
            const team = findTeam(cell.team || cell.teamID);
            const displayPlayer = isRevealed
              ? matched[index].player
              : playerById[cell.answerPlayerID] || { name: cell.answerPlayerName };

            return (
              <StrikeoutCell
                key={cell.index}
                cell={cell}
                index={index}
                team={team}
                player={displayPlayer}
                isRevealed={isRevealed}
                completed={isFinished}
                answersShown={answersShown}
                shouldShowTeam={(game.teamsHidden || 0) < cell.index}
              />
            );
          })}
        </Box>

        {isFinished ? (
          <Box sx={{ mt: "1rem", ml: "auto", gap: "1rem", alignItems: "center", display: "flex" }}>
            <Button variant="outlined" color="secondary" onClick={handleTryAgain}>
              Try Again
            </Button>
            {!answersShown ? <Button onClick={() => setAnswersShown(true)}>Show Answers</Button> : null}
          </Box>
        ) : null}
      </Box>

      <CompleteDialog
        open={modalVisible}
        onClose={() => {
          setResultsDismissed(true);
          setModalVisible(false);
        }}
        isCompleted={isCompleted}
        score={score}
        strikes={strikes}
        total={game.cells.length}
        stats={resultStats}
        onShare={handleShare}
        onTryAgain={handleTryAgain}
      />
    </>
  );
}
