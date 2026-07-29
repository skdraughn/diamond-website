"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import Footer from "./components/Footer";
import GameModule from "./components/GameModule";
import { colors } from "./theme/colors";
import { getPreferredStoreLink } from "./utils/appStore";

const hlMaxScoreKey = "diamond_hl_max_score";

function safeJSONParse(value: string | null, fallback = {}) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function statsFromStorage(raw: Record<string, number> = {}, totalKey: string, correctKey: string) {
  const total = raw[totalKey] || 0;
  const correct = raw[correctKey] || 0;
  return {
    streak: raw.streak || 0,
    won: raw.won || 0,
    winPercent: total ? `${Math.round((correct * 100) / total)}%` : "0%",
  };
}

export default function Home() {
  const [storeLink, setStoreLink] = useState(() => getPreferredStoreLink());
  const [localStats, setLocalStats] = useState({
    strikeout: {},
    reverseImmaculate: {},
    higherLower: { maxScore: 0 },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncLocalStats = () => {
      const strikeout = safeJSONParse(localStorage.getItem("diamond_strikeout_stats"));
      const reverseImmaculate = safeJSONParse(localStorage.getItem("diamond_ri_stats"));
      const maxScore = Number(localStorage.getItem(hlMaxScoreKey) || 0);

      setLocalStats({
        strikeout,
        reverseImmaculate,
        higherLower: { maxScore },
      });
    };

    const id = window.setTimeout(() => {
      setStoreLink(getPreferredStoreLink(navigator.userAgent));
      syncLocalStats();
    }, 0);
    window.addEventListener("diamond-stats-updated", syncLocalStats);
    window.addEventListener("storage", syncLocalStats);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("diamond-stats-updated", syncLocalStats);
      window.removeEventListener("storage", syncLocalStats);
    };
  }, []);

  const games = useMemo(
    () => [
      {
        title: "Strikeout",
        description: "Match players to stat clues",
        backgroundColor: colors.strikeout,
        iconKey: "strikeout",
        href: "/strikeout",
        ...statsFromStorage(
          localStats.strikeout,
          "redZoneGamesTotalCells",
          "redZoneGamesCorrectCells"
        ),
      },
      {
        title: "Reverse Immaculate",
        description: "Match teams to players",
        backgroundColor: colors.gold,
        iconKey: "reverse",
        href: "/reverseimmaculate",
        ...statsFromStorage(
          localStats.reverseImmaculate,
          "reverseImmaculateGamesTotalHeaders",
          "reverseImmaculateGamesCorrectHeaders"
        ),
      },
      {
        title: "Higher Lower",
        description: "Pick which player had more",
        backgroundColor: colors.higherLower,
        iconKey: "higherlower",
        href: "/higherlower",
        maxScore: localStats.higherLower.maxScore,
      },
    ],
    [localStats]
  );

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        isolation: "isolate",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ pt: { xs: "8.25rem", md: "10.75rem" }, pb: { xs: 5.5, md: 7 }, flex: 1 }}
      >
        <Box
          sx={{
            maxWidth: 780,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: colors.ice,
                fontWeight: 800,
                letterSpacing: "0.14em",
                fontSize: "0.73rem",
              }}
            >
              DAILY MLB TRIVIA
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.35rem", md: "3.65rem" },
                lineHeight: 1.02,
                mt: 0.8,
                maxWidth: 760,
              }}
            >
              Know baseball?
              <Box component="span" sx={{ display: "block", color: colors.ice }}>
                Prove it every day.
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.secondaryText,
                maxWidth: 680,
                mt: 2,
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Play today&apos;s MLB trivia lineup on the web, build your streaks, and
              take collections, leaderboards, multiplayer, and more into the Diamond app.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 2.9 }}>
              <Button component={Link} href="/strikeout" size="large">
                Play Today&apos;s Lineup
              </Button>
              <Button
                component="a"
                href={storeLink.href}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="large"
                endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ borderColor: colors.border, color: colors.text }}
              >
                {storeLink.label}
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 5.8, md: 7.2 } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Game Lineup
          </Typography>
          <Typography variant="body1" sx={{ color: colors.secondaryText, mt: 0.65, mb: 2.6 }}>
            Three distinct ways to test your baseball knowledge, updated daily.
          </Typography>

          <Grid
            container
            rowSpacing={{ xs: 3.5, md: 4 }}
            columnSpacing={{ xs: 2, sm: 2.5, lg: 3 }}
            sx={{ mt: 0.2 }}
          >
            {games.map((game) => (
              <Grid key={game.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                <GameModule {...game} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
