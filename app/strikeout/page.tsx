import { Suspense } from "react";
import Link from "next/link";
import { Typography } from "@mui/material";
import { openGraphImage } from "@/utils/sharedMetadata";
import GamePageLayout from "../components/GamePageLayout";
import GamePageLoadingFallback from "../components/GamePageLoadingFallback";
import { colors } from "../theme/colors";
import PlayStrikeout from "./PlayStrikeout";
import GameStructuredData from "../components/GameStructuredData";

export const metadata = {
  title: "Strikeout | Daily MLB Stats Trivia",
  description:
    "Play Strikeout, a daily baseball trivia game. Name the MLB players who match the stat clue and fill the board before you run out of strikes.",
  alternates: { canonical: "/strikeout" },
  openGraph: {
    ...openGraphImage,
    title: "Strikeout | Daily MLB Stats Trivia",
    description:
      "Play Strikeout, a daily baseball trivia game. Name the MLB players who match the stat clue and fill the board before you run out of strikes.",
    url: "https://www.diamondtrivia.app/strikeout",
    siteName: "Diamond Trivia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strikeout | Daily MLB Stats Trivia",
    description:
      "Play Strikeout, a daily baseball trivia game. Name the MLB players who match the stat clue and fill the board before you run out of strikes.",
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
      reserveRightRail
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
        {
          title: "Work Through the Prompt",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Read the whole clue before naming a player. Check whether it asks for a career total, a single season, a specific team, or a particular stretch of MLB history.
            </Typography>
          ),
        },
        {
          title: "Make Every Guess Count",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Start with the players you are most confident about, then work through the remaining possibilities by era or role. Re-read the clue when you get stuck: confusing a season total with a career total is an easy way to waste a strike. Use the daily challenge to test your baseball memory rather than guessing names at random.
            </Typography>
          ),
        },
        {
          title: "More Baseball Trivia Games",
          content: (
            <Typography sx={{ color: colors.secondaryText }}>
              Choose player-seasons in <Link href="/statstack">MLB Stat Stack</Link> or solve the missing teams in <Link href="/reverseimmaculate">Reverse Immaculate</Link>.
            </Typography>
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
