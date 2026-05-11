"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
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

function getDayMoment() {
  const currentHour = new Date().getHours();
  if (currentHour >= 17) return "evening";
  if (currentHour >= 12) return "afternoon";
  if (currentHour >= 4) return "morning";
  return "night";
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

  const momentCopy = {
    morning: "start strong",
    afternoon: "keep the rally going",
    evening: "finish with a streak",
    night: "stay sharp",
  }[getDayMoment()];

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
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Container
        maxWidth="lg"
        sx={{ pt: { xs: "8.25rem", md: "10.75rem" }, pb: { xs: 5.5, md: 7 }, flex: 1 }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: { xs: 3.5, md: 5 }, alignItems: "center" }}>
          <Box>
            <Typography
              variant="h1"
              sx={{ fontSize: { xs: "2.2rem", md: "3.45rem" }, lineHeight: 1.03 }}
            >
              Daily MLB trivia that
              <Box component="span" sx={{ display: "block" }}>
                feels like first pitch.
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
              Play daily on web, then unlock more Diamond Trivia in the app. Keep your
              baseball brain warm and {momentCopy}.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 2.9 }}>
              <Button component={Link} href="/strikeout" size="large">
                Play Today&apos;s Games
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
            Strikeout, Reverse Immaculate, and Higher Lower are available on web.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
              gap: { xs: 2, sm: 2.5, lg: 3 },
              mt: 0.2,
            }}
          >
            {games.map((game) => (
              <Box key={game.title}>
                <GameModule {...game} />
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
