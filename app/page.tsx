"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import HomeGameGuide from "./components/HomeGameGuide";
import GameModule from "./components/GameModule";
import { colors } from "./theme/colors";
import { getPreferredStoreLink } from "./utils/appStore";
import { trackAppStoreClick } from "@/utils/firebaseAnalytics";

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
    statStack: { played: 0, totalScoreTenths: 0, bestScoreTenths: 0 },
    oneSixtyTwoZero: { played: 0, totalWins: 0, bestWins: 0, perfectSeasons: 0 },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncLocalStats = () => {
      const strikeout = safeJSONParse(localStorage.getItem("diamond_strikeout_stats"));
      const reverseImmaculate = safeJSONParse(localStorage.getItem("diamond_ri_stats"));
      const maxScore = Number(localStorage.getItem(hlMaxScoreKey) || 0);
      const statStack = safeJSONParse(localStorage.getItem("diamond_stat_stack_stats"));
      const oneSixtyTwoZero = safeJSONParse(localStorage.getItem("diamond_162_0_stats"));

      setLocalStats({
        strikeout,
        reverseImmaculate,
        higherLower: { maxScore },
        statStack,
        oneSixtyTwoZero,
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
        description: "Find the missing teams in an MLB grid",
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
        description: "Pick the higher MLB stat",
        backgroundColor: colors.higherLower,
        iconKey: "higherlower",
        href: "/higherlower",
        maxScore: localStats.higherLower.maxScore,
      },
      {
        title: "Stat Stack",
        description: "Pick five seasons for the featured stat",
        backgroundColor: colors.statStack,
        iconKey: "statstack",
        href: "/statstack",
        played: Number(localStats.statStack.played || 0),
        averageScore: localStats.statStack.played
          ? (Number(localStats.statStack.totalScoreTenths || 0) / Number(localStats.statStack.played) / 10).toFixed(1)
          : "0.0",
        bestScore: (Number(localStats.statStack.bestScoreTenths || 0) / 10).toFixed(1),
      },
      {
        title: "162-0",
        description: "Build a 162-0 team",
        backgroundColor: colors.oneSixtyTwoZero,
        iconKey: "oneSixtyTwoZero",
        href: "/162-0",
        played: Number(localStats.oneSixtyTwoZero.played || 0),
        averageWins: localStats.oneSixtyTwoZero.played
          ? (Number(localStats.oneSixtyTwoZero.totalWins || 0) / Number(localStats.oneSixtyTwoZero.played)).toFixed(1)
          : "0.0",
        bestWins: Number(localStats.oneSixtyTwoZero.bestWins || 0),
        perfectSeasons: Number(localStats.oneSixtyTwoZero.perfectSeasons || 0),
      },
    ],
    [localStats]
  );

  return (
    <Box
      component="main"
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
        sx={{ pt: 0, px: "0 !important", pb: { xs: 3, md: 4 }, flex: 1 }}
      >
        <Box
          sx={{
            maxWidth: 780,
          }}
        >
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "1.9rem", md: "2.6rem" },
                lineHeight: 1.02,
                mt: 0.8,
                maxWidth: 760,
              }}
            >
              Daily Baseball Trivia
              <Box component="span" sx={{ display: "block", color: colors.ice }}>
                &amp; MLB Games
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.secondaryText,
                maxWidth: 680,
                mt: 1.25,
                fontSize: { xs: "1rem", md: "1.1rem" },
              }}
            >
              Play daily baseball trivia and MLB games. Name players from stat clues, solve a reverse grid, compare player stats, or build a 162-0 team.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 2 }}>
              <Button component={Link} href="/strikeout" size="large">
                Play Today&apos;s Lineup
              </Button>
              <Button
                component="a"
                href={storeLink.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackAppStoreClick({
                    placement: "homepage_hero",
                    platform: storeLink.platform,
                  })
                }
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

        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Choose Your Baseball Trivia Game
          </Typography>
          <Typography variant="body1" sx={{ color: colors.secondaryText, mt: 0.65, mb: 2.6 }}>
            Play Strikeout, Reverse Immaculate, Higher Lower, Stat Stack, and 162-0 in your browser.
          </Typography>

          <Grid
            container
            rowSpacing={{ xs: 2.5, md: 3 }}
            columnSpacing={{ xs: 2, sm: 2.5, lg: 4 }}
            sx={{ mt: 0.2 }}
          >
            {games.map((game) => (
              <Grid key={game.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                <GameModule {...game} />
              </Grid>
            ))}
          </Grid>
        </Box>
        <HomeGameGuide />
      </Container>

    </Box>
  );
}
