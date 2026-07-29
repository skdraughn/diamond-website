"use client";

import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { colors } from "../theme/colors";
import { getPreferredStoreLink } from "../utils/appStore";

export default function AppBenefitPromo({ game }) {
  const [storeLink, setStoreLink] = useState(() => getPreferredStoreLink());

  useEffect(() => {
    const timeoutID = window.setTimeout(() => {
      setStoreLink(getPreferredStoreLink(navigator.userAgent));
    }, 0);
    return () => window.clearTimeout(timeoutID);
  }, []);

  return (
    <Box
      component="aside"
      sx={{
        mt: 5,
        p: { xs: 2.5, md: 3.5 },
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        background:
          "linear-gradient(140deg, rgba(19,114,74,0.28), rgba(8,18,32,0.88) 58%)",
      }}
    >
      <Typography variant="h2" sx={{ fontSize: { xs: "1.4rem", md: "1.8rem" } }}>
        Play more {game} in the Diamond app
      </Typography>
      <Typography sx={{ color: colors.secondaryText, mt: 1, mb: 2 }}>
        Save your progress, climb MLB trivia leaderboards, play collections, and
        compete with other baseball fans.
      </Typography>
      <Button
        component="a"
        href={storeLink.href}
        target="_blank"
        rel="noopener noreferrer"
        endIcon={<OpenInNewRoundedIcon />}
      >
        Download Diamond Trivia
      </Button>
    </Box>
  );
}
