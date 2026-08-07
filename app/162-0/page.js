import { Suspense } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import GamePageLayout from "../components/GamePageLayout";
import GamePageLoadingFallback from "../components/GamePageLoadingFallback";
import { colors } from "../theme/colors";
import PlayOneSixtyTwoZero from "./PlayOneSixtyTwoZero";

const title = "162-0 | Build the Perfect MLB Starting Five";
const description = "Draft five MLB player-seasons across team eras, build a legal starting five, and see whether your lineup can project to a 162-0 record.";
const faq = [
  ["How do you play 162-0?", "You receive five MLB team-and-decade draws. Choose one qualifying player from each draw and fill pitcher, infielder, outfielder, catcher, and flex."],
  ["How are players rated?", "Each qualifying season receives era-adjusted offense, defense, availability, and dominance grades. The final lineup also rewards its weakest starter and two-way balance."],
  ["Can players change positions?", "Yes. A player can fill any position listed on their card. Selecting a player and then another legal position automatically rearranges the rest of the lineup when possible."],
  ["How many times can I play on the website?", "You receive two browser drafts per Eastern Time day. The Diamond Trivia app offers more tickets, rewards, daily leaderboards, saved progress, and unlimited Pro play."],
  ["What do rerolls change?", "Each draft includes one team reroll and one decade reroll. A reroll must be used before placing the player for that round."],
];

export const metadata = {
  title,
  description,
  alternates: { canonical: "/162-0" },
  openGraph: {
    title,
    description,
    url: "https://www.diamondtrivia.app/162-0",
    siteName: "Diamond Trivia",
    type: "website",
    images: [{
      url: "/162-0/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Diamond Trivia 162-0 baseball lineup game",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/162-0/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export default function EightyTwoZeroPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        name: "162-0",
        url: "https://www.diamondtrivia.app/162-0",
        description,
        gamePlatform: "Web Browser",
        applicationCategory: "Game",
        genre: ["Sports", "Trivia", "Baseball"],
        publisher: { "@type": "Organization", name: "Diamond Trivia" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Diamond Trivia", item: "https://www.diamondtrivia.app/" },
          { "@type": "ListItem", position: 2, name: "162-0", item: "https://www.diamondtrivia.app/162-0" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text },
        })),
      },
    ],
  };
  const steps = [
    ["1", "Get a team and decade", "Each of five rounds spins an MLB franchise identity and decade. You have one team reroll and one decade reroll for the entire draft, and each must be used before placing that round’s player."],
    ["2", "Choose a qualifying player", "Search at least three letters from a player’s first or last name. The player must have appeared for the exact historical team identity during the selected decade. The game uses that player’s highest-rated qualifying season."],
    ["3", "Build a legal starting five", "Fill P, IF, OF, C, and FLEX. Select a player and then click a highlighted field position. Multi-position players can move, swap, and automatically reshuffle the rest of the lineup when a legal arrangement exists."],
    ["4", "Lock the round", "Once the current player is on the field, advance to the next draw. A player cannot be drafted twice, but placed players can still move among their eligible positions before the draft finishes."],
    ["5", "See your projected record", "After five rounds, 162-0 grades your players, accounts for two-way balance and the weakest starter, compares your draft with the best legal lineup from the same draws, and projects a 162-game record."],
  ];
  return (
    <GamePageLayout
      heading="Play 162-0"
      subtitle="Can you build the perfect MLB starting five?"
      intro="Spin an MLB team and decade, draft one qualifying player per round, arrange every position, and chase an undefeated 162-0 projection."
      maxWidth="xl"
      background="linear-gradient(145deg, #0b0b0c 45%, rgba(43,183,255,.11) 100%)"
      infoSections={[
        {
          title: "How to Play 162-0",
          content: (
            <Stack id="how-to-play-162-0" spacing={1.4}>
              {steps.map(([number, heading, copy]) => (
                <Stack key={number} direction="row" spacing={1.4} sx={{ alignItems: "flex-start" }}>
                  <Box sx={{
                    flex: "0 0 auto", width: 30, height: 30, borderRadius: "50%",
                    bgcolor: "#2BB7FF", color: colors.background, display: "grid",
                    placeItems: "center", fontWeight: 950,
                  }}>{number}</Box>
                  <Box>
                    <Typography fontWeight={900}>{heading}</Typography>
                    <Typography sx={{ color: colors.secondaryText }}>{copy}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          ),
        },
        {
          title: "How Your Record Is Calculated",
          content: (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.2 }}>
              {[
                ["Player impact", "A player’s grade is hitter or pitcher components, availability, dominance, and résumé value. Season-specific résumé value can add up to eight points."],
                ["Offense", "Era-adjusted offensive impact and production from the selected player-season."],
                ["Defense", "Season-relative defensive run value using genuine fielding and positional-defense estimates."],
                ["Availability", "Games and workload relative to the rest of MLB in that season."],
                ["Two-way balance", "Four hitter slots contribute 75% of the roster grade and the pitcher contributes 25%."],
                ["Lineup quality", "The five legal roster slots are combined using Diamond’s native 162-0 calibration."],
                ["Projected wins", "The final roster score is converted into a 162-game projection. A true 162-0 requires a nearly perfect lineup."],
              ].map(([heading, copy]) => (
                <Paper key={heading} sx={{ p: 1.5 }}>
                  <Typography fontWeight={900}>{heading}</Typography>
                  <Typography sx={{ color: colors.secondaryText }}>{copy}</Typography>
                </Paper>
              ))}
            </Box>
          ),
        },
        {
          title: "162-0 Frequently Asked Questions",
          content: (
            <Stack spacing={1.3}>
              {faq.map(([question, answer]) => (
                <Box key={question}>
                  <Typography fontWeight={900}>{question}</Typography>
                  <Typography sx={{ color: colors.secondaryText }}>{answer}</Typography>
                </Box>
              ))}
            </Stack>
          ),
        },
      ]}
    >
      <Suspense fallback={<GamePageLoadingFallback />}>
        <PlayOneSixtyTwoZero />
      </Suspense>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <noscript><p>162-0 is an MLB lineup game where you draft five qualifying player-seasons and chase an undefeated projected record.</p></noscript>
    </GamePageLayout>
  );
}
