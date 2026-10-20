import { Suspense } from "react";
import Link from "next/link";
import { Typography } from "@mui/material";
import { openGraphImage } from "@/utils/sharedMetadata";
import GamePageLayout from "../components/GamePageLayout";
import GamePageLoadingFallback from "../components/GamePageLoadingFallback";
import { colors } from "../theme/colors";
import PlayReverseImmaculate from "./PlayReverseImmaculate";
import GameStructuredData from "../components/GameStructuredData";

export const metadata = {
  title: "Reverse Immaculate Grid | Daily MLB Grid Game",
  description:
    "Play a daily MLB grid game with the players already filled in. Find the six missing teams in Reverse Immaculate and test your baseball knowledge.",
  alternates: { canonical: "/reverseimmaculate" },
  openGraph: {
    ...openGraphImage,
    title: "Reverse Immaculate Grid | Daily MLB Grid Game",
    description:
      "Play a daily MLB grid game with the players already filled in. Find the six missing teams in Reverse Immaculate and test your baseball knowledge.",
    url: "https://www.diamondtrivia.app/reverseimmaculate",
    siteName: "Diamond Trivia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reverse Immaculate Grid | Daily MLB Grid Game",
    description:
      "Play a daily MLB grid game with the players already filled in. Find the six missing teams in Reverse Immaculate and test your baseball knowledge.",
  },
  robots: { index: true, follow: true },
};

export default function ReverseImmaculatePage() {
  return (
    <>
      <GameStructuredData
        name="Reverse Immaculate"
        path="/reverseimmaculate"
        description="A daily MLB reverse grid game where players infer team headers from player combinations."
        faqs={[
          {
            question: "What is Reverse Immaculate?",
            answer:
              "Reverse Immaculate flips the classic baseball grid by showing player combinations and asking you to infer the team headers.",
          },
          {
            question: "How do you play Reverse Immaculate?",
            answer:
              "Choose the MLB team that makes each row or column valid for every player shown.",
          },
        ]}
      />
      <GamePageLayout
      reserveRightRail
      heading="Reverse Immaculate"
      subtitle="The daily MLB grid game with the players already filled in"
      intro="Find the missing team for each row and column. Every player in that line must have played for your chosen team. Solve all six headers to finish today’s baseball grid."
      infoSections={[
        {
          title: "What Is Reverse Immaculate?",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Reverse Immaculate is a daily MLB reverse grid. The nine player squares are filled in, and the six team headers are missing. Use the players’ career histories to work out which team belongs beside each row and above each column.
            </Typography>
          ),
        },
        {
          title: "How To Play",
          content: (
            <>
              <Typography variant="body1" sx={{ color: colors.secondaryText }}>
                Tap a row or column header and pick the team you believe fits that
                header. You get instant feedback.
              </Typography>
              <Typography variant="body1" sx={{ color: colors.secondaryText }}>
                You have three strikes unless the daily game says otherwise. A perfect run
                solves all six headers.
              </Typography>
            </>
          ),
        },
        {
          title: "Solve the Shared Team",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Each row or column gives you several MLB player careers to compare. Look for a team shared by every player in that line. One familiar player-team connection is a useful starting point, but it is not enough by itself to settle the header.
            </Typography>
          ),
        },
        {
          title: "Check All Three Players",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              A team that fits two players can still be wrong. Check the third player before submitting. Short stays and teams from early in a player’s career count too, so look beyond the jersey you remember best.
            </Typography>
          ),
        },
        {
          title: "Start With the Strongest Connection",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Begin with the row or column whose players you know best. Consider shorter stops as well as the teams most associated with each player, and check your candidate against the entire line before spending a guess.
            </Typography>
          ),
        },
        {
          title: "More Baseball Trivia Games",
          content: (
            <Typography sx={{ color: colors.secondaryText }}>
              Build an undefeated team in the <Link href="/162-0">162-0 baseball game</Link>, or pick qualifying player-seasons in <Link href="/statstack">MLB Stat Stack</Link>.
            </Typography>
          ),
        },
      ]}
    >
      <Suspense fallback={<GamePageLoadingFallback />}>
        <PlayReverseImmaculate />
      </Suspense>
      </GamePageLayout>
    </>
  );
}
