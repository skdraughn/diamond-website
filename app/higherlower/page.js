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
      ]}
    >
      <Suspense fallback={<GamePageLoadingFallback />}>
        <PlayHigherLower />
      </Suspense>
      </GamePageLayout>
    </>
  );
}
