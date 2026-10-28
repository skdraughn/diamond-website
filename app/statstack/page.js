import GameStructuredData from "../components/GameStructuredData";
import { Suspense } from "react";
import Link from "next/link";
import { Typography } from "@mui/material";
import GamePageLayout from "../components/GamePageLayout";
import GamePageLoadingFallback from "../components/GamePageLoadingFallback";
import StatStackGame from "./StatStackGame";
import { openGraphImage } from "@/utils/sharedMetadata";
import { colors } from "../theme/colors";

export const metadata = {
  title: "Stat Stack | Daily MLB Player Stats Game",
  description:
    "Play MLB Stat Stack. Choose five player-seasons that fit the row clues and score as highly as possible in the featured baseball stat.",
  alternates: { canonical: "/statstack" },
  openGraph: {
    ...openGraphImage,
    title: "Stat Stack | Daily MLB Player Stats Game",
    description: "Play MLB Stat Stack. Choose five player-seasons that fit the row clues and score as highly as possible in the featured baseball stat.",
    url: "https://www.diamondtrivia.app/statstack",
    siteName: "Diamond Trivia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stat Stack | Daily MLB Player Stats Game",
    description: "Play MLB Stat Stack. Choose five player-seasons that fit the row clues and score as highly as possible in the featured baseball stat.",
  },
  robots: { index: true, follow: true },
};

export default function StatStackPage() {
  return (
    <GamePageLayout
      heading="Play Stat Stack"
      subtitle="Build the highest-percentile MLB lineup"
      intro="Fill five rows with player-seasons that meet every clue. Your score depends on the featured stat shown at the top of the game. Each player can be used once."
      maxWidth="lg"
      infoSections={[
        {
          title: "What Is Stat Stack?",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Stat Stack is a daily MLB trivia game about player seasons, team history,
              positions, awards, and statistical performance. Each puzzle asks you to
              build a five-player lineup for one featured baseball stat (such as home runs,
              hits, stolen bases, strikeouts, or wins) while satisfying a
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
              Your final score is the average percentile of all five picks. Check the featured stat before choosing a season: a player’s best season for one stat may not be their best for another.
            </Typography>
          ),
        },
        {
          title: "More Baseball Trivia Games",
          content: (
            <Typography sx={{ color: colors.secondaryText }}>
              Build a team in the <Link href="/162-0">162-0 baseball game</Link> or solve the missing teams in <Link href="/reverseimmaculate">Reverse Immaculate</Link>.
            </Typography>
          ),
        },
      ]}
    >
      <GameStructuredData name="Stat Stack" description={metadata.description} path="/statstack" />
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
