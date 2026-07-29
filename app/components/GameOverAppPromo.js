"use client";

import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { Box, Button, Typography } from "@mui/material";
import { colors } from "../theme/colors";
import { getPreferredStoreLink } from "../utils/appStore";
import { trackAppStoreClick } from "@/utils/firebaseAnalytics";

export default function GameOverAppPromo() {
  const store = getPreferredStoreLink(
    typeof navigator === "undefined" ? "" : navigator.userAgent
  );

  return (
    <Box
      sx={{
        my: 2.25,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${colors.primary}88`,
        background: `linear-gradient(135deg, ${colors.primary}24, rgba(255,255,255,0.04))`,
      }}
    >
      <Typography sx={{ fontWeight: 900, color: colors.text }}>
        Your next challenge is waiting
      </Typography>
      <Typography variant="body2" color={colors.secondaryText} sx={{ mt: 0.4, mb: 1.4 }}>
        Save your stats, unlock collections, climb leaderboards, and play every
        Diamond mode in the app.
      </Typography>
      <Button
        component="a"
        href={store.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackAppStoreClick({
            placement: "game_over",
            platform: store.platform,
          })
        }
        size="small"
        endIcon={<OpenInNewRoundedIcon />}
      >
        Download the Diamond App
      </Button>
    </Box>
  );
}
