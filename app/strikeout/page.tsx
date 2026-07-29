import { Suspense } from "react";
import { Typography } from "@mui/material";
import { openGraphImage } from "@/utils/sharedMetadata";
import GamePageLayout from "../components/GamePageLayout";
import GamePageLoadingFallback from "../components/GamePageLoadingFallback";
import { colors } from "../theme/colors";
import PlayStrikeout from "./PlayStrikeout";
import GameStructuredData from "../components/GameStructuredData";

export const metadata = {
  title: "Strikeout | MLB Stats Grid Game",
  description:
    "Play Strikeout, the daily MLB stats grid challenge. Match players to stat clues, build streaks, and test your baseball knowledge.",
  alternates: { canonical: "/strikeout" },
  openGraph: {
    ...openGraphImage,
    title: "Strikeout | MLB Stats Grid Game",
    description:
      "Challenge yourself with Strikeout, the MLB stats-based trivia game. New grid every day.",
    url: "https://www.diamondtrivia.app/strikeout",
    siteName: "Diamond Trivia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strikeout | Daily MLB Stats Challenge",
    description:
      "Strikeout is the stat-matching MLB trivia game from Diamond Trivia. Play free every day.",
  },
  robots: { index: true, follow: true },
};

export default function StrikeoutPage() {
  return (
    <>
      <GameStructuredData
        name="Strikeout"
        path="/strikeout"
        description="A daily MLB stat grid game where players match baseball players to stat clues."
        faqs={[
          {
            question: "What is Strikeout?",
            answer:
              "Strikeout is a daily MLB stat challenge where you complete a grid by entering every player that matches the prompt.",
          },
          {
            question: "How do you play Strikeout?",
            answer:
              "Identify valid players for the prompt and fill every cell before using all three strikes.",
          },
        ]}
      />
      <GamePageLayout
      heading="Play Today's Strikeout"
      subtitle="Daily MLB stat-based trivia game"
      intro="Fill the board by matching players to stat clues. Each day brings a new challenge with fresh baseball prompts."
      maxWidth="md"
      infoSections={[
        {
          title: "What Is Strikeout?",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Strikeout is a daily MLB stat challenge where you complete a grid by entering
              every player that matches the prompt.
            </Typography>
          ),
        },
        {
          title: "How To Play",
          content: (
            <>
              <Typography variant="body1" sx={{ color: colors.secondaryText }}>
                Use the prompt to identify valid players and fill every cell before running
                out of strikes.
              </Typography>
              <Typography variant="body1" sx={{ color: colors.secondaryText }}>
                Correct answers reveal a tile. A miss adds a strike. You get three strikes
                unless the daily game says otherwise.
              </Typography>
            </>
          ),
        },
      ]}
    >
      <Suspense fallback={<GamePageLoadingFallback />}>
        <PlayStrikeout />
      </Suspense>
      </GamePageLayout>
    </>
  );
}
