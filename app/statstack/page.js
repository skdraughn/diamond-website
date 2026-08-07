import { Suspense } from "react";
import { Typography } from "@mui/material";
import GamePageLayout from "../components/GamePageLayout";
import GamePageLoadingFallback from "../components/GamePageLoadingFallback";
import StatStackGame from "./StatStackGame";
import { openGraphImage } from "@/utils/sharedMetadata";
import { colors } from "../theme/colors";

export const metadata = {
  title: "Stat Stack | Daily MLB Lineup Trivia Game",
  description:
    "Build a five-player MLB Stat Stack. Match every qualification and chase the highest possible percentile.",
  alternates: { canonical: "/statstack" },
  openGraph: {
    ...openGraphImage,
    title: "Stat Stack | Daily MLB Lineup Trivia Game",
    description: "Choose five qualifying player-seasons and maximize your MLB Stat Stack percentile.",
    url: "https://www.diamondtrivia.app/statstack",
    siteName: "Diamond Trivia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stat Stack | Daily MLB Trivia",
    description: "Build the best five-player MLB lineup for today's qualifications.",
  },
  robots: { index: true, follow: true },
};

export default function StatStackPage() {
  return (
    <GamePageLayout
      heading="Play Stat Stack"
      subtitle="Build the highest-percentile MLB lineup"
      intro="Fill five stacks with unique player-seasons. Every pick must satisfy its row, and stronger statistical seasons earn a higher percentile."
      maxWidth="lg"
      background={`linear-gradient(145deg, ${colors.background} 55%, rgba(160,32,240,0.12) 100%)`}
      infoSections={[
        {
          title: "What Is Stat Stack?",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Stat Stack is a daily MLB trivia game about player seasons, team history,
              positions, awards, and statistical performance. Each puzzle asks you to
              build a five-player lineup for one featured baseball stat—such as home runs,
              hits, stolen bases, strikeouts, or wins—while satisfying a
              different set of qualifications in every row.
            </Typography>
          ),
        },
        {
          title: "How To Play",
          content: (
            <>
              <Typography variant="body1" sx={{ color: colors.secondaryText }}>
                Start by reading the featured stat and all five qualification rows. A row
                can require a particular MLB team, league, season range, player
                position, career award, or a combination of those clues. Click any open
                row, search for an eligible player, and then choose one season from that
                player’s career.
              </Typography>
              <Typography variant="body1" sx={{ color: colors.secondaryText }}>
                Your exact player-season must satisfy every qualification shown in that
                row. For example, a player who appeared for the listed team will
                still be rejected if the selected season falls outside the required
                years. Each MLB player can appear only once across the five-row lineup,
                so use your strongest seasons carefully.
              </Typography>
              <Typography variant="body1" sx={{ color: colors.secondaryText }}>
                A valid selection locks into the board with its team logo, season, featured
                stat total, and percentile score. Complete all five rows to finish the
                daily Stat Stack. If you give up, every unfilled row receives a zero.
              </Typography>
            </>
          ),
        },
        {
          title: "How Stat Stack Scoring Works",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Every eligible player-season is ranked against the other valid answers for
              its row. Better statistical seasons earn a higher percentile, up to 100.0.
              Your final score is the average percentile of all five picks. Finding an
              answer completes a row; finding an elite answer builds a great stack. That
              makes the game both an MLB knowledge challenge and a strategy puzzle about
              choosing the best possible baseball seasons.
            </Typography>
          ),
        },
      ]}
    >
      <Suspense fallback={<GamePageLoadingFallback />}>
        <StatStackGame />
      </Suspense>
      <noscript>
        <p>
          Stat Stack is a daily MLB player-stat trivia game where you build a
          five-player lineup from qualifying baseball seasons and chase the highest
          average percentile.
        </p>
      </noscript>
    </GamePageLayout>
  );
}
