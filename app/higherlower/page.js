import { Suspense } from "react";
import { Typography } from "@mui/material";
import { openGraphImage } from "@/utils/sharedMetadata";
import GamePageLayout from "../components/GamePageLayout";
import GamePageLoadingFallback from "../components/GamePageLoadingFallback";
import { colors } from "../theme/colors";
import PlayHigherLower from "./PlayHigherLower";
import GameStructuredData from "../components/GameStructuredData";

export const metadata = {
  title: "Higher Lower | MLB Trivia Game",
  description:
    "Higher Lower is the MLB trivia game where you pick which player had more in the selected stat category.",
  alternates: { canonical: "/higherlower" },
  openGraph: {
    ...openGraphImage,
    title: "Higher Lower | MLB Trivia Game",
    description:
      "Pick the player with the higher stat and keep your streak alive in Higher Lower.",
    url: "https://www.diamondtrivia.app/higherlower",
    siteName: "Diamond Trivia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Higher Lower | MLB Trivia Game",
    description: "Compare MLB player stats and keep your streak alive in Higher Lower.",
  },
  robots: { index: true, follow: true },
};

export default function HigherLowerPage() {
  return (
    <>
      <GameStructuredData
        name="Higher Lower"
        path="/higherlower"
        description="A fast MLB trivia game where players compare two baseball players in a stat category."
        faqs={[
          {
            question: "What is Higher Lower?",
            answer:
              "Higher Lower is a fast MLB trivia game built around comparing player statistics.",
          },
          {
            question: "How do you play Higher Lower?",
            answer:
              "Select the player who leads the displayed category and continue for as long as your streak survives.",
          },
        ]}
      />
      <GamePageLayout
      heading="Play Higher Lower"
      subtitle="Fast MLB stat comparison game"
      intro="Two players appear at a time. Pick who owns the better number in the category and keep your streak alive."
      infoSections={[
        {
          title: "What Is Higher Lower?",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Higher Lower is a speed-focused MLB trivia game built around stat intuition.
            </Typography>
          ),
        },
        {
          title: "How To Play",
          content: (
            <>
              <Typography variant="body1" sx={{ color: colors.secondaryText }}>
                Select the player you think leads the category shown. For ERA, lower is
                better.
              </Typography>
              <Typography variant="body1" sx={{ color: colors.secondaryText }}>
                You start with 10 seconds per choice, and the timer tightens as your run
                gets hotter.
              </Typography>
            </>
          ),
        },
        {
          title: "Read the Category First",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              The better-known MLB player is not always the right answer. Identify the statistic being compared and the period shown on the cards before making your choice. Career totals, single-season totals, and per-game averages can tell very different stories.
            </Typography>
          ),
        },
        {
          title: "A Simple Comparison Example",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              If one card shows 25 home runs and another shows 30, the second card has the higher total. ERA works differently: a 2.50 ERA is better than a 3.50 ERA. Read the category carefully instead of always choosing the larger number.
            </Typography>
          ),
        },
        {
          title: "Build Better Stat Intuition",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Use what you know about each player’s role as a starting point, then consider the statistic itself. Specialists can beat famous all-around players in their best category. Stay focused on the two cards in front of you as the timer shortens; the goal is a correct comparison, not an overall ranking of baseball players.
            </Typography>
          ),
        },
      ]}
    >
      <Suspense fallback={<GamePageLoadingFallback />}>
        <PlayHigherLower />
      </Suspense>
      </GamePageLayout>
    </>
  );
}
