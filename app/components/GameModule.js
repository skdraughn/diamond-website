import Link from "next/link";
import { Avatar, Box, Card, CardContent, Stack, Typography } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SportsBaseballRoundedIcon from "@mui/icons-material/SportsBaseballRounded";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import { colors } from "../theme/colors";

const iconMap = {
  strikeout: SportsBaseballRoundedIcon,
  reverse: GridOnRoundedIcon,
  higherlower: SwapVertRoundedIcon,
};

function getStats(title, { streak, won, winPercent, maxScore }) {
  if (title === "Higher Lower") return [{ label: "Best", value: maxScore || 0 }];
  return [
    { label: "Streak", value: streak || 0 },
    { label: "Wins", value: won || 0 },
    { label: "Win Rate", value: winPercent || "0%" },
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
}) {
  const stats = getStats(title, { streak, won, winPercent, maxScore });
  const Icon = iconMap[iconKey] || SportsBaseballRoundedIcon;

  return (
    <Card
      component={Link}
      href={href}
      sx={{
        height: "100%",
        borderRadius: 2.75,
        border: "none",
        background: "rgba(16, 21, 17, 0.94)",
        color: colors.text,
        textDecoration: "none",
        overflow: "hidden",
        boxShadow: "0 8px 20px rgba(0,0,0,0.24)",
        transition: "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 26px rgba(0,0,0,0.3)",
          backgroundColor: "rgba(20, 28, 22, 0.98)",
        },
      }}
    >
      <Box sx={{ height: 6, background: backgroundColor }} />
      <CardContent sx={{ p: { xs: 1.5, md: 1.75 }, height: "100%" }}>
        <Stack spacing={1.15} sx={{ height: "100%" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              sx={{
                width: { xs: 44, md: 48 },
                height: { xs: 44, md: 48 },
                borderRadius: 1.4,
                bgcolor: "rgba(255,255,255,0.07)",
                color: backgroundColor,
              }}
              variant="rounded"
            >
              <Icon />
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={0.35} alignItems="center">
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

          <Box sx={{ mt: "auto", borderRadius: 1.35, bgcolor: "rgba(7, 9, 8, 0.78)", px: 0.45, py: 0.55 }}>
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
