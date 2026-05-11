"use client";

import { useEffect, useRef, useState } from "react";
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
  setStatRevealed,
  setCorrectIndex,
}) {
  const [localPlayer, setLocalPlayer] = useState(player);
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);
  const statRevealedRef = useRef(statRevealed);
  const setStatRevealedRef = useRef(setStatRevealed);
  const setCorrectIndexRef = useRef(setCorrectIndex);

  useEffect(() => {
    statRevealedRef.current = statRevealed;
    setStatRevealedRef.current = setStatRevealed;
    setCorrectIndexRef.current = setCorrectIndex;
  }, [setCorrectIndex, setStatRevealed, statRevealed]);

  useEffect(() => {
    if (!player) return undefined;

    if (!statRevealedRef.current) {
      const id = window.setTimeout(() => setLocalPlayer(player), 0);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setLocalPlayer(player);
      setStatRevealedRef.current(false);
      setCorrectIndexRef.current(-1);
    }, 1400);

    return () => window.clearTimeout(id);
  }, [player]);

  const bgColor = correct
    ? "rgba(43, 103, 81, 0.88)"
    : incorrect
      ? "rgba(161, 71, 71, 0.88)"
      : "#000";

  const borderColor = correct
    ? colors.grass
    : incorrect
      ? colors.primary
      : "#000";
  const logoSrc = getTeamLogoSource(localPlayer?.team?.logoURL);
  const initialMotion = initialAnimationDone
    ? { x: "100%", opacity: 0 }
    : { y: 14, opacity: 0, scale: 0.98 };
  const animateMotion = initialAnimationDone
    ? { x: 0, opacity: 1, transition: { duration: 0.15 } }
    : { y: 0, opacity: 1, scale: 1, transition: { duration: 0.22, ease: "easeOut" } };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${localPlayer?.name || "player"}-${localPlayer?.stat || "stat"}`}
        initial={initialMotion}
        animate={animateMotion}
        exit={{ x: "-100%", opacity: 0, transition: { duration: 0.12 } }}
        onAnimationComplete={() => {
          if (!initialAnimationDone) setInitialAnimationDone(true);
        }}
        style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
      >
        <Card
          sx={{
            height: "100%",
            bgcolor: bgColor,
            borderRadius: 2,
            border: ".3rem solid",
            borderColor,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            minHeight: { xs: 210, md: 250 },
            py: { xs: 5, md: 7 },
          }}
        >
          {logoSrc ? (
            <Box sx={{ position: "absolute", inset: 0, opacity: 0.26 }}>
              <Image
                src={logoSrc}
                alt={localPlayer?.team?.name || ""}
                fill
                sizes="540px"
                style={{ objectFit: "contain" }}
              />
            </Box>
          ) : null}

          <CardContent sx={{ zIndex: 1, px: 2 }}>
            <Typography variant="h6" fontWeight={700} color="common.white">
              {localPlayer?.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: colors.text }}>
              Started {localPlayer?.startYear}
              {" | "}
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
                mt: 2,
                px: 3,
                py: 1,
                bgcolor: "#000",
                borderRadius: 1,
                display: "inline-block",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  color: correct
                    ? colors.grass
                    : incorrect
                      ? colors.primary
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
