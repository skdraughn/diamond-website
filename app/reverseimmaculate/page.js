import { Suspense } from "react";
import { Typography } from "@mui/material";
import { openGraphImage } from "@/utils/sharedMetadata";
import GamePageLayout from "../components/GamePageLayout";
import GamePageLoadingFallback from "../components/GamePageLoadingFallback";
import { colors } from "../theme/colors";
import PlayReverseImmaculate from "./PlayReverseImmaculate";
import GameStructuredData from "../components/GameStructuredData";

export const metadata = {
  title: "Reverse Immaculate | MLB Grid Challenge",
  description:
    "Play Reverse Immaculate, the daily MLB reverse grid challenge. Match teams to player headers and test your baseball memory.",
  alternates: { canonical: "/reverseimmaculate" },
  openGraph: {
    ...openGraphImage,
    title: "Reverse Immaculate | MLB Player-Team Grid Game",
    description:
      "Reverse-engineer MLB team headers from a completed player grid in this daily challenge.",
    url: "https://www.diamondtrivia.app/reverseimmaculate",
    siteName: "Diamond Trivia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reverse Immaculate | MLB Grid Game",
    description:
      "Match teams to players in the daily Reverse Immaculate puzzle from Diamond Trivia.",
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
      heading="Reverse Immaculate"
      subtitle="Match the teams to the players"
      intro="Instead of filling player names, identify the row and column teams that make the completed grid valid."
      infoSections={[
        {
          title: "What Is Reverse Immaculate?",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Reverse Immaculate flips the classic grid format. You are shown player
              combinations and must infer the correct team headers.
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
          title: "An Example of the Deduction",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Suppose the first player in a row played for teams A and B, the second for B and C, and the third for B and D. Team B is the shared connection. Those letters are an illustration of the logic, not clues or answers from today’s grid.
            </Typography>
          ),
        },
        {
          title: "Start With the Strongest Connection",
          content: (
            <Typography variant="body1" sx={{ color: colors.secondaryText }}>
              Begin with the row or column whose players you know best. Consider shorter stops as well as the teams most associated with each player, and check your candidate against the entire line before spending a guess. Working through these overlaps turns baseball career knowledge into a process of elimination.
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
