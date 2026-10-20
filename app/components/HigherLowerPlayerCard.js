"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { colors } from "../theme/colors";
import { abbreviationsToColorMap } from "../utils/positions";
import { teamLogoMap } from "@/utils/teamLogoMap";

function getTeamLogoSource(logoURL) {
  const logo = logoURL ? teamLogoMap[logoURL] : null;
  return logo?.default || logo || null;
}

export default function HigherLowerPlayerCard({
  player,
  statRevealed = true,
  correct,
  incorrect,
  frozen = false,
  setStatRevealed,
  setCorrectIndex,
}) {
  const [localPlayer, setLocalPlayer] = useState(player);

  useEffect(() => {
    if (!player || frozen) return undefined;

    if (!statRevealed) {
      const id = window.setTimeout(() => setLocalPlayer(player), 0);
      setCorrectIndex(-1);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setLocalPlayer(player);
      setStatRevealed(false);
      setCorrectIndex(-1);
    }, 1400);

    return () => window.clearTimeout(id);
  }, [frozen, player, setCorrectIndex, setStatRevealed, statRevealed]);

  const bgColor = correct
    ? colors.correct
    : incorrect
      ? colors.incorrect
      : colors.backgroundHighlight;

  const borderColor = correct
    ? colors.grass
    : incorrect
      ? colors.strikeout
      : colors.border;
  const logoSrc = getTeamLogoSource(localPlayer?.team?.logoURL);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${localPlayer?.name || "player"}-${localPlayer?.stat || "stat"}`}
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1, transition: { duration: 0.15 } }}
        exit={{ x: "-100%", opacity: 0, transition: { duration: 0.12 } }}
        style={{ width: "100%", height: "100%" }}
      >
        <Card
          sx={{
            height: "100%",
            bgcolor: bgColor,
            borderRadius: 2,
            border: "1px solid",
            borderColor,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: { xs: 1.25, sm: 2, md: 3 },
            "& img": { width: { xs: "36px", sm: "80px" }, height: { xs: "36px", sm: "80px" }, marginBottom: { xs: "4px", sm: "10px" } },
            "& .MuiTypography-h5": { fontSize: { xs: "1.05rem", sm: "1.5rem" }, lineHeight: 1.2 },
            "& .MuiTypography-subtitle2": { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
            py: { xs: 1, sm: 3, md: 3.5 },
            transition: "background-color 160ms ease, border-color 160ms ease",
          }}
        >
          <CardContent
            sx={{
              p: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              "&:last-child": { pb: 0 },
            }}
          >
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={`${localPlayer?.team?.name || "Team"} logo`}
                width={80}
                height={80}
                style={{
                  objectFit: "contain",
                }}
              />
            ) : null}
            <Typography
              variant="h5"
              sx={{ color: "common.white", fontWeight: 900, lineHeight: 1.2 }}
            >
              {localPlayer?.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: colors.secondaryText, mt: 0.5 }}>
              Started {localPlayer?.startYear}
              {" • "}
              <Box
                component="span"
                sx={{
                  color:
                    abbreviationsToColorMap[localPlayer?.position] ||
                    colors.gold,
                  fontWeight: 700,
                }}
              >
                {localPlayer?.position}
              </Box>
            </Typography>

            <Box
              sx={{
                mt: { xs: 0.5, sm: 2 },
                px: { xs: 2, sm: 3.5 },
                py: { xs: 0.25, sm: 1.25 },
                bgcolor: colors.background,
                borderRadius: 1.5,
                border: `1px solid ${colors.border}`,
                display: "inline-block",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  color: correct
                    ? colors.grass
                    : incorrect
                      ? colors.strikeout
                      : "common.white",
                }}
              >
                {statRevealed ? localPlayer?.stat : "????"}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
