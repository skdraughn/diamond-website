import Link from "next/link";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ShuffleRoundedIcon from "@mui/icons-material/ShuffleRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import StackedBarChartRoundedIcon from "@mui/icons-material/StackedBarChartRounded";
import SportsBaseballRoundedIcon from "@mui/icons-material/SportsBaseballRounded";
import { colors } from "../theme/colors";

const iconMap = {
  strikeout: GridViewRoundedIcon,
  reverse: ShuffleRoundedIcon,
  higherlower: SwapVertRoundedIcon,
  statstack: StackedBarChartRoundedIcon,
  oneSixtyTwoZero: SportsBaseballRoundedIcon,
};

function getStats(title, { streak, won, winPercent, maxScore, played, averageScore, bestScore, averageWins, perfectSeasons }) {
  if (title === "Higher Lower") return [{ label: "Best", value: maxScore || 0 }];
  if (title === "Stat Stack") return [
    { label: "Played", value: played || 0 },
    { label: "Average", value: averageScore || "0.0" },
    { label: "Best", value: bestScore || "0.0" },
  ];
  if (title === "162-0") return [
    { label: "Played", value: played || 0 },
    { label: "Avg wins", value: averageWins || "0.0" },
    { label: "Perfect", value: perfectSeasons || 0 },
  ];
  return [
    { label: "Streak", value: streak || 0 },
    { label: "Wins", value: won || 0 },
    { label: "Correct %", value: winPercent || "0%" },
  ];
}

export default function GameModule({
  title,
  description,
  backgroundColor,
  iconKey,
  streak = 0,
  won = 0,
  winPercent = "0%",
  href,
  maxScore = 0,
  played = 0,
  averageScore = "0.0",
  bestScore = "0.0",
  averageWins = "0.0",
  perfectSeasons = 0,
}) {
  const stats = getStats(title, { streak, won, winPercent, maxScore, played, averageScore, bestScore, averageWins, perfectSeasons });
  const Icon = iconMap[iconKey] || GridViewRoundedIcon;

  return (
    <Card
      component={Link}
      href={href}
      sx={{
        display: "block",
        height: "100%",
        borderRadius: 0,
        border: "none",
        background: "transparent",
        color: colors.text,
        textDecoration: "none",
        overflow: "hidden",
        boxShadow: "none",
        transition: "opacity 180ms ease",
        "&:hover": {
          opacity: 0.88,
        },
      }}
    >
      <CardContent sx={{ p: "0 !important", height: "100%" }}>
        <Stack spacing={1.15} sx={{ height: "100%" }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: { xs: 46, md: 50 },
                height: { xs: 46, md: 50 },
                borderRadius: 1.6,
                display: "grid",
                placeItems: "center",
                bgcolor: `${backgroundColor}18`,
                color: backgroundColor,
                border: `1px solid ${backgroundColor}55`,
              }}
            >
              <Icon sx={{ fontSize: 26 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={0.35} sx={{ alignItems: "center" }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, lineHeight: 1.05, fontSize: { xs: "1rem", md: "1.05rem" } }}
                >
                  {title}
                </Typography>
                <ChevronRightRoundedIcon sx={{ color: colors.text, fontSize: 17 }} />
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  color: colors.secondaryText,
                  mt: 0.32,
                  fontSize: { xs: "0.91rem", md: "0.94rem" },
                  lineHeight: 1.2,
                }}
                noWrap
              >
                {description}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: "auto",
              borderRadius: 1.35,
              bgcolor: "rgba(5,12,22,0.48)",
              border: "1px solid rgba(220,235,255,0.08)",
              px: 0.45,
              py: 0.55,
            }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`, gap: 0.55 }}>
              {stats.map(({ label, value }) => (
                <Box
                  key={`${title}-${label}`}
                  sx={{
                    minWidth: 0,
                    textAlign: "center",
                    py: 0.35,
                    px: 0.25,
                    borderRight:
                      stats.length > 1 && label !== stats[stats.length - 1].label
                        ? "1px solid rgba(255,255,255,0.11)"
                        : "none",
                  }}
                >
                  <Typography variant="caption" sx={{ color: colors.secondaryText, lineHeight: 1, fontSize: "0.67rem", letterSpacing: 0, textTransform: "uppercase" }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 0.22, fontSize: { xs: "0.92rem", md: "0.95rem" } }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
