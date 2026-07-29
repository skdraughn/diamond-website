"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import { generateClient } from "aws-amplify/api";
import { Close } from "@mui/icons-material";
import { colors } from "../theme/colors";
import { appLinks } from "@/utils/appLinks";
import GameOverAppPromo from "./GameOverAppPromo";
import Userbadge from "./Userbadge";
import { formatRank, getCurrentRank } from "../utils/gridironThresholds";

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
      gridiron
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
  onClose,
  score,
  handlePlayAgain,
  interval,
  maxScore,
}) {
  const { board, loading, refresh } = useHigherLowerLeaderboard();

  useEffect(() => {
    if (visible) refresh();
  }, [refresh, visible]);

  const handleShare = async () => {
    const text = `Diamond Trivia Higher Lower\nScore: ${score}\nBest: ${maxScore}\n\n${appLinks.appStore}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Diamond Trivia", text });
        return;
      } catch {
        // Fall through to copying when the share sheet is unavailable.
      }
    }
    await navigator.clipboard?.writeText(text);
  };

  return (
    <Modal
      open={visible}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
    >
      <Box
        sx={{
          position: "relative",
          width: "90vw",
          maxWidth: 500,
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: colors.background,
          borderRadius: 3,
          p: 4,
          outline: "none",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ color: colors.text }}>
            You got to round {Math.floor(score / interval) + 1}
          </Typography>
          <IconButton onClick={onClose}>
            <Close sx={{ color: colors.text }} />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              border: `.2rem solid ${colors.primary}`,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${colors.primary}50`,
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
              py: ".5rem",
            }}
          >
            <Typography variant="caption" sx={{ color: colors.text }}>SCORE</Typography>
            <Typography variant="h4" sx={{ color: colors.text }}>{score}</Typography>
          </Box>
          <Box
            sx={{
              border: `.2rem solid ${colors.gold}`,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${colors.gold}50`,
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
              py: ".5rem",
            }}
          >
            <Typography variant="caption" sx={{ color: colors.text }}>BEST</Typography>
            <Typography variant="h4" sx={{ color: colors.text }}>{maxScore}</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            maxHeight: "30dvh",
            overflowY: "scroll",
            overflowX: "hidden",
            mt: "2rem",
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
                      borderRadius: "5px",
                      height: 35,
                    }}
                  >
                    <Typography variant="h6">{index + 1}</Typography>
                  </Box>

                  <Userbadge noClick small user={user} />
                  <Box>
                    <Typography variant="body1">
                      {getDisplayUsername(user?.username) || "deleted"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.tertiaryText, mt: "-2px" }}
                    >
                      {formatRank(getCurrentRank(user?.gridiron))}
                    </Typography>
                  </Box>

                  <Box sx={{ ml: "auto", height: 30 }}>
                    <Typography variant="h6">{player.score}</Typography>
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

        <GameOverAppPromo game="Higher Lower" />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={handleShare} sx={{ flex: 1 }}>Share</Button>
          <Button onClick={handlePlayAgain} sx={{ flex: 1 }}>Play Again</Button>
        </Box>
      </Box>
    </Modal>
  );
}
