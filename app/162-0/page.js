import { Suspense } from "react";
import Link from "next/link";
import { Box, Paper, Stack, Typography } from "@mui/material";
import GamePageLayout from "../components/GamePageLayout";
import GamePageLoadingFallback from "../components/GamePageLoadingFallback";
import { colors } from "../theme/colors";
import PlayOneSixtyTwoZero from "./PlayOneSixtyTwoZero";

const title = "162-0 Baseball Game | Build an Undefeated MLB Team";
const description = "Play the 162-0 baseball game. Draft players from random MLB teams and decades, fill five roster spots, and see if your team can go undefeated.";
const faq = [
  ["How do you play 162-0?", "You receive five MLB team-and-decade draws. Choose one qualifying player from each draw and fill pitcher, infielder, outfielder, catcher, and flex."],
  ["How are players rated?", "Hitters and pitchers use different season ratings. The pitcher contributes 25% of the roster grade, and the four hitter slots contribute 75%. The game converts the roster grade into a projected 162-game record."],
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
    ["3", "Fill all five roster spots", "Fill P, IF, OF, C, and FLEX. Select a player and then click a highlighted field position. Multi-position players can move, swap, and automatically reshuffle the rest of the lineup when a legal arrangement exists."],
    ["4", "Lock the round", "Once the current player is on the field, advance to the next draw. A player cannot be drafted twice, but placed players can still move among their eligible positions before the draft finishes."],
    ["5", "See your projected record", "After five rounds, 162-0 combines your hitter and pitcher ratings, compares your draft with the best legal lineup from the same draws, and projects a 162-game record."],
  ];
  return (
    <GamePageLayout
      heading="Play 162-0"
      subtitle="Can you build an undefeated MLB team?"
      intro="Build a 162-0 team in five rounds. Each draw gives you an MLB team and decade. Pick a player, fill an open position, and see your projected record."
      maxWidth="xl"
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
          title: "How to Build a 162-0 Team",
          content: (
            <Stack spacing={1.3}>
              <Typography sx={{ color: colors.secondaryText }}>Fill pitcher, infielder, outfielder, catcher, and FLEX. Hitters eligible at IF, OF, C, or DH can fill FLEX; a pitcher-only season cannot. Check the open positions before committing to a name.</Typography>
              <Typography sx={{ color: colors.secondaryText }}>The pitcher contributes 25% of the roster grade. Each of the four hitter slots contributes 18.75%, and an empty slot contributes zero. A strong pitcher can be worth choosing over a familiar hitter.</Typography>
              <Typography sx={{ color: colors.secondaryText }}>Use a reroll if you’re stumped. A team reroll keeps the decade; a decade reroll keeps the team. You have one of each across all five rounds.</Typography>
            </Stack>
          ),
        },
        {
          title: "How Your Record Is Calculated",
          content: (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.2 }}>
              {[
                ["Player impact", "Hitters are rated on offense, defense where applicable, availability, and dominance. Pitchers use pitching, availability, and dominance. Season achievements can add up to eight points."],
                ["Offense", "Era-adjusted offensive impact and production from the selected player-season."],
                ["Defense", "Season-relative defensive run value using genuine fielding and positional-defense estimates."],
                ["Availability", "Games and workload relative to the rest of MLB in that season."],
                ["Roster balance", "Four hitter slots contribute 75% of the roster grade and the pitcher contributes 25%."],
                ["Lineup quality", "The game combines the five slot ratings, then applies its baseball scoring adjustment before calculating projected wins."],
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
        {
          title: "More Baseball Trivia Games",
          content: (
            <Typography sx={{ color: colors.secondaryText }}>
              Match teams to players in <Link href="/reverseimmaculate">Reverse Immaculate, the daily MLB grid game</Link>, or choose player-seasons for a featured stat in <Link href="/statstack">MLB Stat Stack</Link>.
            </Typography>
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
