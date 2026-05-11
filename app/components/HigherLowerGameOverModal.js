"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Box, Button, IconButton, Modal, Typography } from "@mui/material";
import { generateClient } from "aws-amplify/api";
import { Close } from "@mui/icons-material";
import { colors } from "../theme/colors";
import { appLinks } from "@/utils/appLinks";

const higherLowerLeaderboardQuery = /* GraphQL */ `
  query HigherLowerGamesByTypeAndScore(
    $type: String!
    $sortDirection: ModelSortDirection
    $limit: Int
  ) {
    higherLowerGamesByTypeAndScore(
      type: $type
      sortDirection: $sortDirection
      limit: $limit
    ) {
      items {
        id
        userID
        score
      }
    }
  }
`;

const getUserQuery = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
    }
  }
`;

function getDisplayUsername(username) {
  if (!username) return "";
  if (username.includes("@") && username.includes(".com")) {
    return username.split("@")[0];
  }
  return username;
}

function useHigherLowerLeaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(false);
  const userCacheRef = useRef({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const client = generateClient();
      const hlResponse = await client.graphql({
        query: higherLowerLeaderboardQuery,
        variables: { type: "HL", sortDirection: "DESC", limit: 50 },
        authMode: "apiKey",
      });
      const items =
        hlResponse?.data?.higherLowerGamesByTypeAndScore?.items?.filter(Boolean) || [];
      const uniqueUserIDs = Array.from(new Set(items.map((rec) => rec.userID).filter(Boolean)));
      const toFetch = uniqueUserIDs.filter((id) => !userCacheRef.current[id]);

      await Promise.all(
        toFetch.map((id) =>
          client
            .graphql({
              query: getUserQuery,
              variables: { id },
              authMode: "apiKey",
            })
            .then((res) => {
              const user = res?.data?.getUser;
              if (user) userCacheRef.current[id] = user;
            })
            .catch((err) => {
              console.error(`Error fetching leaderboard user ${id}:`, err);
            })
        )
      );

      setBoard(
        items.map((rec) => ({
          id: rec.id,
          user: userCacheRef.current[rec.userID] || null,
          score: rec.score ?? 0,
        }))
      );
    } catch (err) {
      console.error("Error fetching Higher Lower leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { board, loading, refresh };
}

export default function HigherLowerGameOverModal({
  visible,
  score,
  handlePlayAgain,
  interval,
  maxScore,
}) {
  const { board, loading, refresh } = useHigherLowerLeaderboard();

  useEffect(() => {
    if (visible) refresh();
  }, [refresh, visible]);

  return (
    <Modal open={visible} onClose={handlePlayAgain}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
          maxWidth: 500,
          bgcolor: colors.background,
          borderRadius: 3,
          p: 4,
          outline: "none",
          border: `1px solid ${colors.border}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography variant="h6" color={colors.text}>
            You got to round {Math.floor(score / interval) + 1}
          </Typography>
          <IconButton onClick={handlePlayAgain} aria-label="Play again">
            <Close sx={{ color: colors.text }} />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", mt: 2 }}>
          <Box
            sx={{
              border: `.2rem solid ${colors.primary}`,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${colors.primary}40`,
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
              py: ".5rem",
            }}
          >
            <Typography variant="caption" color={colors.text}>
              SCORE
            </Typography>
            <Typography variant="h4" color={colors.text}>
              {score}
            </Typography>
          </Box>
          <Box
            sx={{
              border: `.2rem solid ${colors.gold}`,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${colors.gold}35`,
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
              py: ".5rem",
            }}
          >
            <Typography variant="caption" color={colors.text}>
              BEST
            </Typography>
            <Typography variant="h4" color={colors.text}>
              {maxScore}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            maxHeight: "30dvh",
            overflowY: "auto",
            overflowX: "hidden",
            mt: "2rem",
            pr: 0.5,
          }}
        >
          {loading ? (
            <Typography sx={{ color: colors.secondaryText, textAlign: "center" }}>
              Loading leaderboard...
            </Typography>
          ) : board.length ? (
            board.map((player, index) => {
              const user = player?.user || {};
              return (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "8px",
                    py: 0.5,
                  }}
                  key={player.id}
                >
                  <Box
                    sx={{
                      display: "flex",
                      position: "relative",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 35,
                      backgroundColor:
                        index === 0
                          ? colors.gold
                          : index === 1
                            ? "#c0c0c0"
                            : index === 2
                              ? "#cd7f32"
                              : "transparent",
                      borderRadius: 1,
                      height: 35,
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 900 }}>
                      {index + 1}
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body1" sx={{ color: colors.text, fontWeight: 700 }}>
                      {getDisplayUsername(user?.username) || "deleted"}
                    </Typography>
                  </Box>

                  <Box sx={{ ml: "auto", height: 30 }}>
                    <Typography variant="h6" sx={{ color: colors.text }}>
                      {player.score}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography sx={{ color: colors.secondaryText, textAlign: "center" }}>
              No leaderboard scores yet.
            </Typography>
          )}
        </Box>

        <Typography variant="h6" sx={{ textAlign: "center", my: 2, color: colors.text }}>
          Play Diamond Trivia on the go
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <Image
            src="/download-on-the-app-store.svg"
            alt="Download on the App Store"
            onClick={() => window.open(appLinks.appStore, "_blank")}
            width={150}
            height={50}
            style={{ cursor: "pointer" }}
          />
          <Image
            src="/google_play.png"
            alt="Get it on Google Play"
            onClick={() => window.open(appLinks.googlePlay, "_blank")}
            width={150}
            height={50}
            style={{ cursor: "pointer", borderRadius: ".3rem" }}
          />
        </Box>

        <Box sx={{ display: "flex" }}>
          <Button onClick={handlePlayAgain} sx={{ flex: 1 }}>
            Play Again
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
