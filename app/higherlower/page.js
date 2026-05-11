import { Suspense } from "react";
import { Typography } from "@mui/material";
import { openGraphImage } from "@/utils/sharedMetadata";
import GamePageLayout from "../components/GamePageLayout";
import GamePageLoadingFallback from "../components/GamePageLoadingFallback";
import { colors } from "../theme/colors";
import PlayHigherLower from "./PlayHigherLower";

export const metadata = {
  title: "Higher Lower | MLB Trivia Game",
  description:
    "Higher Lower is the MLB trivia game where you pick which player had more in the selected stat category.",
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
  );
}
