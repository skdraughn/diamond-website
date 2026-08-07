"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import SportsBaseballRoundedIcon from "@mui/icons-material/SportsBaseballRounded";
import OutlinedFlagRoundedIcon from "@mui/icons-material/OutlinedFlagRounded";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { colors } from "@/app/theme/colors";
import { logFirebaseEvent } from "@/utils/firebaseAnalytics";
import { androidAppUrl, getPreferredStoreLink, iosAppUrl } from "@/app/utils/appStore";
import { getStatStackLogo, getStatStackLogoMetadata } from "@/app/utils/statStackLogos";
import {
  calculateResult,
  compatiblePositions,
  createSpins,
  formatSeason,
  optimalSolution,
  placePlayer,
  POSITION_COLORS,
  POSITIONS,
  rerollSpin,
  searchPlayers,
} from "./gameLogic";
import { loadCatalog } from "./catalog";
import {
  easternDate,
  emptyState,
  persistState,
  readState,
  readStats,
  recordStats,
} from "./storage";
import useOneSixtyTwoZeroConfig from "./useOneSixtyTwoZeroConfig";

const ACCENT = "#2BB7FF";
const REEL_FACE_HEIGHT = 74;
const REEL_ITEM_COUNT = 9;
const FORMATION = {
  FLEX: { left: "40.875%", top: "4.75%" },
  OF: { left: "69.875%", top: "15.75%" },
  IF: { left: "10.875%", top: "42.75%" },
  P: { left: "40.875%", top: "45.75%" },
  C: { left: "40.875%", top: "72.75%" },
};

const grade = (value) => (Math.max(0, Number(value) || 0) / 10).toFixed(0);
const average = (stats) => stats.played ? (stats.totalWins / stats.played).toFixed(1) : "0.0";
const getCombo = (catalog, spin) =>
  catalog?.combinations.find((combination) => combination.id === spin?.combinationID);

function GameSkeleton() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,1.15fr) minmax(330px,.85fr)" }, gap: 2 }}>
      <Skeleton variant="rounded" sx={{ bgcolor: colors.surface, aspectRatio: "50/47", minHeight: 440 }} />
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={220} sx={{ bgcolor: colors.surface }} />
        <Skeleton variant="rounded" height={300} sx={{ bgcolor: colors.surface }} />
      </Stack>
    </Box>
  );
}

function StoreCTA({ placement, large = false }) {
  const [preferred, setPreferred] = useState(() => getPreferredStoreLink());
  useEffect(() => {
    setPreferred(getPreferredStoreLink(navigator.userAgent));
  }, []);
  const track = (platform) => logFirebaseEvent("app_handoff_click", {
    app: "diamond", game: "one_sixty_two_zero", placement, platform,
  });
  return (
    <Paper sx={{
      p: large ? 2.5 : 1.6,
      border: `1px solid ${ACCENT}66`,
      background: "rgba(43,183,255,.08)",
      textAlign: "center",
    }}>
      <Typography variant={large ? "h5" : "subtitle1"} fontWeight={900}>
        Take 162-0 with you
      </Typography>
      <Typography sx={{ color: colors.secondaryText, my: 1, fontSize: large ? 15 : 13 }}>
        Get more tickets, saved progress, rewards, daily leaderboards, and unlimited play with Pro.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "center" }}>
        <Button
          component="a"
          href={preferred.href}
          onClick={() => track(preferred.platform)}
          size={large ? "large" : "medium"}
        >
          {preferred.label}
        </Button>
        <Button
          component="a"
          href={preferred.platform === "android" ? iosAppUrl : androidAppUrl}
          onClick={() => track(preferred.platform === "android" ? "ios" : "android")}
          variant="outlined"
          sx={{ display: { xs: "none", md: "inline-flex" } }}
        >
          {preferred.platform === "android" ? "App Store" : "Google Play"}
        </Button>
      </Stack>
    </Paper>
  );
}

function PositionBadge({ position, large = false, responsive = false }) {
  const color = POSITION_COLORS[position] || ACCENT;
  return (
    <Box component="span" sx={{
      minWidth: responsive
        ? "clamp(22px, 27cqw, 34px)"
        : large ? 40 : 32,
      height: responsive
        ? "clamp(18px, 22cqw, 27px)"
        : large ? 29 : 25,
      px: position === "FLEX"
        ? responsive ? "2.2cqw" : large ? 1.5 : 1.1
        : responsive ? ".7cqw" : large ? 1.1 : .75,
      borderRadius: responsive ? "clamp(6px, 7cqw, 8px)" : large ? 1 : .875,
      border: `1px solid ${color}cc`,
      bgcolor: `${color}32`,
      color,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: responsive
        ? "clamp(8px, 10cqw, 12px)"
        : large ? 15 : 12,
      lineHeight: 1,
      fontWeight: 800,
    }}>
      {position}
    </Box>
  );
}

const resolveTeamLogo = (entry = {}) =>
  getStatStackLogo(entry.logoKey) || getStatStackLogo(entry.teamKey);

function TeamLogo({ logoKey, teamKey, alt = "", ...props }) {
  const src = resolveTeamLogo({ logoKey, teamKey });
  return src ? <Image src={src} alt={alt} {...props} /> : null;
}

function PlayerCard({ pick, position, selected, compatible, onClick }) {
  const teamColor = getStatStackLogoMetadata(pick?.logoKey)?.primaryColor || ACCENT;
  const name = String(pick?.playerName || "Open").trim().split(/\s+/);
  const first = name[0] || "";
  const last = name.slice(1).join(" ");
  const positions = pick
    ? [
        position,
        ...(pick.positions || []).filter((eligiblePosition) => eligiblePosition !== position),
      ]
    : [position];
  return (
    <Box
      component={motion.button}
      type="button"
      onClick={onClick}
      aria-label={pick ? `${position}: ${pick.playerName}. Select to move or swap.` : `${position}: open`}
      sx={{
        containerType: "inline-size",
        width: "100%",
        aspectRatio: "1 / 1.26",
        borderRadius: "clamp(8px, 10cqw, 14px)",
        border: `clamp(1.2px, 1.8cqw, 2.4px) solid ${
          selected || compatible
            ? ACCENT
            : pick ? teamColor : "rgba(122,151,184,.58)"
        }`,
        boxShadow: selected || compatible
          ? `0 0 clamp(16px, 24cqw, 28px) ${ACCENT}82`
          : pick
            ? `0 0 clamp(8px, 15cqw, 18px) ${teamColor}48, 0 5px 14px rgba(0,0,0,.34)`
            : "none",
        bgcolor: pick ? "rgba(8,18,32,.92)" : "rgba(8,18,32,.96)",
        color: colors.text,
        p: "clamp(4px, 5cqw, 7px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color .18s, box-shadow .18s, transform .18s",
        "&:focus-visible": { outline: `3px solid ${ACCENT}`, outlineOffset: 3 },
      }}
    >
      {pick ? (
        <>
          <Stack
            direction="row"
            sx={{
              width: "100%",
              justifyContent: "center",
              gap: "clamp(3px, 4cqw, 6px)",
              minHeight: "clamp(14px, 18cqw, 24px)",
            }}
          >
            {positions.map((eligiblePosition, index) => (
              <Typography
                key={eligiblePosition}
                component="span"
                sx={{
                  color: POSITION_COLORS[eligiblePosition],
                  opacity: index === 0 ? 1 : .34,
                  fontSize: "clamp(8px, 10cqw, 12px)",
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {eligiblePosition}
              </Typography>
            ))}
          </Stack>
          <Box sx={{
            position: "relative",
            flex: 1,
            width: "100%",
            minHeight: 0,
            my: "2cqw",
          }}>
            <TeamLogo
              logoKey={pick.logoKey}
              teamKey={pick.teamKey}
              fill
              sizes="(max-width: 900px) 15vw, 110px"
              alt=""
              style={{ objectFit: "contain", padding: "3cqw" }}
            />
          </Box>
          <Box sx={{
            width: "100%",
            minHeight: "clamp(22px, 28cqw, 36px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}>
            {first && <Typography noWrap sx={{
              width: "100%", textAlign: "center",
              fontSize: "clamp(9px, 13cqw, 15px)", lineHeight: 1, fontWeight: 700,
            }}>{first}</Typography>}
            {last && <Typography noWrap sx={{
              width: "100%", textAlign: "center",
              fontSize: "clamp(9px, 13cqw, 15px)", lineHeight: 1, fontWeight: 700,
            }}>{last}</Typography>}
          </Box>
        </>
      ) : (
        <Box sx={{ flex: 1, width: "100%", display: "grid", placeItems: "center" }}>
          <PositionBadge position={position} large responsive />
        </Box>
      )}
    </Box>
  );
}

function Court({ picks, spins, selected, onSelect, onPlace, round, onGiveUp, giveUpDisabled }) {
  const hydratedPicks = picks.map((pick) => {
    const spin = spins?.[Number(pick.round)];
    return {
      ...pick,
      teamKey: pick.teamKey || spin?.teamKey,
      teamName: pick.teamName || spin?.teamName,
      logoKey: pick.logoKey || spin?.logoKey || spin?.teamKey,
    };
  });
  const byPosition = new Map(hydratedPicks.map((pick) => [pick.assignedPosition, pick]));
  const legal = new Set(selected ? compatiblePositions(
    selected,
    picks.filter((pick) => String(pick.playerID) !== String(selected.playerID))
  ) : []);
  return (
    <Box sx={{
      position: "relative",
      width: "100%",
      aspectRatio: "50/47",
      overflow: "hidden",
      borderRadius: 2.5,
      border: `2px solid ${ACCENT}d1`,
      bgcolor: "rgba(4,6,8,.82)",
      backgroundImage:
        "linear-gradient(rgba(0,2,4,.48),rgba(0,2,4,.48)), url('/one-sixty-two-zero-icon.webp')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      boxShadow: `0 0 24px ${ACCENT}38`,
    }}>
      <Typography sx={{
        position: "absolute",
        top: { xs: 11, sm: 16 },
        left: { xs: 12, sm: 18 },
        color: ACCENT,
        fontSize: { xs: 10, sm: 12 },
        fontWeight: 800,
        letterSpacing: ".04em",
      }}>ROUND {round + 1} OF 5</Typography>
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={<OutlinedFlagRoundedIcon />}
        disabled={giveUpDisabled}
        onClick={onGiveUp}
        sx={{
          position: "absolute",
          right: 9,
          top: 9,
          zIndex: 20,
          minWidth: 0,
          borderRadius: 5,
          px: 1.5,
          bgcolor: "rgba(5, 14, 23, .9)",
          "&:hover": { bgcolor: "rgba(5, 14, 23, .98)" },
        }}
      >
        Give Up
      </Button>
      <LayoutGroup id="one-sixty-two-zero-lineup">
        {POSITIONS.map((position) => {
          const pick = byPosition.get(position);
          const isSelected = selected && pick && String(selected.playerID) === String(pick.playerID);
          const isCompatible = selected && legal.has(position) && !isSelected;
          return (
            <Box
              component={motion.div}
              layout
              layoutId={pick
                ? `one-sixty-two-zero-slot-${pick.playerID}`
                : `one-sixty-two-zero-empty-${position}`}
              key={position}
              sx={{
                position: "absolute",
                width: "18.25%",
                ...FORMATION[position],
                zIndex: pick ? 2 : 1,
              }}
              transition={{ type: "spring", stiffness: 360, damping: 28, mass: .55 }}
            >
              <PlayerCard
                pick={pick}
                position={position}
                selected={isSelected}
                compatible={isCompatible}
                onClick={() => {
                  if (selected && (isCompatible || isSelected)) {
                    if (isSelected) onSelect(null);
                    else onPlace(selected, position);
                  } else if (pick) onSelect(pick);
                }}
              />
            </Box>
          );
        })}
      </LayoutGroup>
    </Box>
  );
}

function SlotMachine({
  spin,
  combinations,
  spinning,
  spinKind,
  reducedMotion,
  picks,
  attempt,
  onReroll,
}) {
  const teamItems = useMemo(() => {
    const result = getCombo({ combinations }, spin);
    if (!result) return [];
    const index = Math.max(0, combinations.findIndex((item) => item.id === result.id));
    return [
      ...Array.from(
        { length: REEL_ITEM_COUNT - 1 },
        (_, offset) =>
          combinations[(index + 1 + offset * 17) % Math.max(1, combinations.length)]
          || result,
      ),
      result,
    ];
  }, [combinations, spin]);
  const eraItems = useMemo(() => {
    const result = getCombo({ combinations }, spin);
    if (!result) return [];
    const decades = [...new Set(combinations.map((combo) => Number(combo.decadeEnd)))]
      .filter(Number.isFinite)
      .sort((left, right) => left - right);
    const index = Math.max(0, decades.indexOf(Number(result.decadeEnd)));
    return [
      ...Array.from(
        { length: REEL_ITEM_COUNT - 1 },
        (_, offset) =>
          decades[(index + 1 + offset * 3) % Math.max(1, decades.length)]
          || Number(result.decadeEnd),
      ),
      Number(result.decadeEnd),
    ];
  }, [combinations, spin]);
  const disabled = spinning || picks.some((pick) => pick.round === attempt.currentRound);
  return (
    <Box sx={{
      border: "1px solid rgba(255,255,255,.14)",
      borderRadius: 2.5,
      bgcolor: "rgba(4,9,14,.92)",
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,0,0,.3)",
      flex: "0 0 auto",
    }}>
      <Stack direction="row" spacing={1} sx={{ height: 90, p: .9 }}>
        {[["team", teamItems], ["era", eraItems]].map(([type, items]) => (
          <Box key={type} sx={{
            flex: 1,
            border: "1px solid rgba(255,255,255,.18)",
            borderRadius: 1.6,
            p: .35,
            bgcolor: "rgba(1,4,8,.74)",
            overflow: "hidden",
          }}>
            <Box sx={{
              position: "relative",
              height: REEL_FACE_HEIGHT,
              overflow: "hidden",
              borderRadius: 1,
              bgcolor: "rgba(0,0,0,.28)",
              perspective: 560,
              "&::before,&::after": {
                content: '""',
                position: "absolute",
                zIndex: 2,
                left: 0,
                right: 0,
                height: 18,
                pointerEvents: "none",
              },
              "&::before": {
                top: 0,
                background: "linear-gradient(rgba(3,8,13,.98),transparent)",
              },
              "&::after": {
                bottom: 0,
                background: "linear-gradient(transparent,rgba(3,8,13,.98))",
              },
            }}>
              <Box
                key={`${spin?.combinationID}-${type}`}
                sx={{
                  transform: `translateY(-${REEL_FACE_HEIGHT * (REEL_ITEM_COUNT - 1)}px)`,
                  animation: spinning
                    && (spinKind === "both" || spinKind === type)
                    && !reducedMotion
                    ? `${type === "team" ? "eightyTeamReelSpin" : "eightyEraReelSpin"} ${
                        spinKind === "both"
                          ? type === "team" ? "2.25s" : "2.45s"
                          : type === "team" ? "1.45s" : "1.58s"
                      } cubic-bezier(.12,.72,.14,1) forwards`
                    : "none",
                  "@keyframes eightyTeamReelSpin": {
                    from: { transform: "translateY(0)" },
                    to: { transform: `translateY(-${REEL_FACE_HEIGHT * (REEL_ITEM_COUNT - 1)}px)` },
                  },
                  "@keyframes eightyEraReelSpin": {
                    "0%": { transform: "translateY(0)" },
                    "7%": {
                      transform: spinKind === "both"
                        ? "translateY(0)"
                        : `translateY(-${Math.round(REEL_FACE_HEIGHT * .35)}px)`,
                    },
                    "100%": { transform: `translateY(-${REEL_FACE_HEIGHT * (REEL_ITEM_COUNT - 1)}px)` },
                  },
                }}
              >
                {items.map((item, index) => (
                  <Box
                    key={`${type}-${index}-${typeof item === "object" ? item.id : item}`}
                    sx={{
                      height: REEL_FACE_HEIGHT,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: .15,
                      px: .75,
                    }}
                  >
                    {type === "team" ? <>
                      <Box sx={{ position: "relative", width: 38, height: 38 }}>
                        <TeamLogo
                          logoKey={item.logoKey}
                          teamKey={item.teamKey}
                          fill
                          sizes="38px"
                          alt=""
                          style={{ objectFit: "contain" }}
                        />
                      </Box>
                      <Typography noWrap sx={{
                        width: "100%",
                        textAlign: "center",
                        fontSize: { xs: 9, sm: 10 },
                        lineHeight: 1.2,
                        fontWeight: 700,
                      }}>{item.teamName}</Typography>
                    </> : (
                      <Typography sx={{ color: ACCENT, fontSize: 29, lineHeight: 1, fontWeight: 800 }}>
                        {item}s
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <Button
          variant="text"
          startIcon={<RefreshRoundedIcon />}
          disabled={disabled || !attempt.teamRerollsRemaining}
          onClick={() => onReroll("team")}
          sx={{ minHeight: 30, borderRadius: 0, color: "rgba(255,255,255,.58)", fontSize: 11 }}
        >
          {attempt.teamRerollsRemaining ? "Reroll team" : "Team used"}
        </Button>
        <Button
          variant="text"
          startIcon={<RefreshRoundedIcon />}
          disabled={disabled || !attempt.eraRerollsRemaining}
          onClick={() => onReroll("era")}
          sx={{
            minHeight: 30,
            borderRadius: 0,
            color: "rgba(255,255,255,.58)",
            borderLeft: "1px solid rgba(255,255,255,.08)",
            fontSize: 11,
          }}
        >
          {attempt.eraRerollsRemaining ? "Reroll era" : "Era used"}
        </Button>
      </Box>
    </Box>
  );
}

function PickerContent({
  combination,
  picks,
  selected,
  onSelect,
  disabled,
  modal = false,
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, "");
  const result = useMemo(
    () => searchPlayers(combination?.players || [], query, picks),
    [combination, picks, query]
  );
  useEffect(() => {
    setQuery("");
  }, [combination?.id]);
  return (
    <Paper sx={{
      p: modal ? 0 : 2,
      display: "flex",
      minHeight: 0,
      height: modal ? "auto" : "100%",
      flex: 1,
      flexDirection: "column",
      overflow: "hidden",
      bgcolor: modal ? "transparent" : colors.backgroundHighlight,
      border: modal ? 0 : `1px solid ${ACCENT}66`,
      backgroundImage: "none",
      boxShadow: "none",
    }}>
      {!modal && <>
        <Typography fontWeight={800}>Draft a player</Typography>
        <Typography variant="body2" sx={{ color: colors.secondaryText, mb: 1.5 }}>
          {combination
            ? `${combination.teamName} · ${combination.decadeEnd}s`
            : "Awaiting slot-machine result…"}
        </Typography>
      </>}
      <TextField
        autoFocus={modal}
        fullWidth
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter"
            && result.players.length === 1
            && !result.players[0].disabledReason
          ) {
            onSelect(result.players[0]);
          }
        }}
        placeholder="Type a player name..."
        disabled={disabled || !combination}
        slotProps={{
          input: { startAdornment: <SearchRoundedIcon sx={{ color: colors.secondaryText, mr: 1 }} /> },
          htmlInput: { "aria-label": "Search eligible 162-0 players" },
        }}
        sx={{
          "& .MuiInputBase-input": { color: colors.text },
          "& .MuiOutlinedInput-root": {
            bgcolor: colors.background,
            "&:hover fieldset": { borderColor: ACCENT },
            "&.Mui-focused fieldset": { borderColor: ACCENT },
          },
        }}
      />
      <Typography variant="caption" sx={{ color: colors.secondaryText, mt: .6, mb: .4 }}>
        Enter at least three letters from a first or last name.
      </Typography>
      {normalizedQuery.length >= 3 && (
        <Paper sx={{
          mt: 1,
          p: 0,
          minHeight: 0,
          maxHeight: modal ? "none" : 224,
          flex: modal ? "1 1 auto" : "0 1 auto",
          overflowY: "auto",
          bgcolor: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: 1,
          backgroundImage: "none",
          boxShadow: "none",
        }}>
          <List disablePadding>
            {result.status === "too_broad" && (
              <Typography sx={{ p: 2, color: colors.secondaryText, textAlign: "center" }}>
                Keep typing to narrow the results.
              </Typography>
            )}
            {result.status === "empty" && (
              <Typography sx={{ p: 2, color: colors.secondaryText, textAlign: "center" }}>
                No eligible player matches that name.
              </Typography>
            )}
            {result.players.map((player) => (
              <ListItemButton
                key={player.playerID}
                selected={String(selected?.playerID) === String(player.playerID)}
                disabled={Boolean(player.disabledReason)}
                onClick={() => onSelect(player)}
                sx={{
                  height: player.disabledReason ? 66 : modal ? 58 : 52,
                  minHeight: player.disabledReason ? 66 : modal ? 58 : 52,
                  px: 1.5,
                  gap: 1.5,
                  borderBottom: `1px solid ${colors.border}`,
                  "&:last-child": { borderBottom: 0 },
                  "&.Mui-selected": {
                    bgcolor: `${ACCENT}24`,
                    boxShadow: `inset 3px 0 0 ${ACCENT}`,
                  },
                  "&.Mui-selected:hover": { bgcolor: `${ACCENT}2e` },
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography fontWeight={700} noWrap>{player.playerName}</Typography>
                  {player.disabledReason && (
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{ display: "block", color: colors.softRed, mt: .25 }}
                    >
                      {player.disabledReason}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={.7} sx={{ flexShrink: 0 }}>
                  {player.positions.map((position) => (
                    <PositionBadge key={position} position={position} />
                  ))}
                </Stack>
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Paper>
  );
}

function MobilePicker({ open, onClose, combination, ...props }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            height: { xs: "min(620px, 88dvh)", sm: 620 },
            maxHeight: "88dvh",
            bgcolor: colors.backgroundHighlight,
            border: `1px solid ${ACCENT}66`,
            boxShadow: "none",
            borderRadius: 2,
            backgroundImage: "none",
          },
        },
      }}
    >
      <DialogTitle sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pb: 1,
      }}>
        <Box>
          <Typography component="span" fontWeight={800}>Select a player</Typography>
          <Typography variant="body2" sx={{ color: colors.secondaryText }}>
            {combination
              ? `${combination.teamName} · ${combination.decadeEnd}s`
              : "Awaiting slot-machine result…"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close player picker" size="small">
          <CloseRoundedIcon sx={{ color: ACCENT }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        pt: 1,
      }}>
        <PickerContent combination={combination} modal {...props} />
      </DialogContent>
    </Dialog>
  );
}

function PlayerDetails({ pick, onClose }) {
  if (!pick) return null;
  const pitcher = pick.role === "P";
  const designatedHitter = pick.role === "DH";
  const stats = pick.seasonStats || [];
  const metrics = pitcher
    ? [
        ["PIT", pick.pitchingTenths, "Season-relative pitching performance using ERA+, fielding-independent pitching, strikeouts, and walks."],
        ["AVL", pick.reliabilityTenths, "Playing-time workload relative to pitchers in the same season."],
        ["DOM", pick.dominanceTenths, "Total season impact based primarily on wins above replacement."],
      ]
    : [
        ["OFF", pick.offenseTenths, "Season-relative hitting and baserunning production, including OPS+, offensive value, and baserunning runs."],
        ...(designatedHitter ? [] : [["DEF", pick.defenseTenths, "Season-relative defensive run value using genuine fielding and positional-defense estimates."]]),
        ["AVL", pick.reliabilityTenths, "Playing-time workload relative to players in the same season and role."],
        ["DOM", pick.dominanceTenths, "Total season impact based primarily on wins above replacement."],
      ];
  const seasonStats = pitcher
    ? [["IP", stats[0], 1], ["ERA+", stats[1], 0], ["FIP-", stats[2], 0], ["K/9", stats[3], 1], ["BB/9", stats[4], 1], ["WAR", stats[5], 1]]
    : [["PA", stats[0], 0], ["OPS+", stats[1], 0], ["WAR", stats[2], 1], ["oWAR", stats[3], 1], ["DEF Runs", stats[4], 1], ["Fielding Runs", stats[5], 1]];
  const formula = pitcher
    ? "OVR combines 75% pitching, 10% availability, and 15% dominance."
    : designatedHitter
      ? "OVR combines 70% offense, 15% availability, and 15% dominance. DH seasons are not penalized for fielding."
      : "OVR combines 45% offense, 35% defense, 10% availability, and 10% dominance.";
  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: {
        sx: {
          maxHeight: "86dvh",
          bgcolor: colors.backgroundHighlight,
          border: `1px solid ${ACCENT}66`,
          backgroundImage: "none",
          boxShadow: "none",
        },
      } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pr: 1 }}>
        <Box sx={{ position: "relative", width: 52, height: 52 }}>
          <TeamLogo logoKey={pick.logoKey} teamKey={pick.teamKey} fill sizes="52px" alt="" style={{ objectFit: "contain" }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3" sx={{ fontSize: "1.25rem" }} noWrap>
            {pick.playerName}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondaryText }} noWrap>
            {pick.teamName} · {formatSeason(pick.season)} · {pick.positions.join("/")}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 52, textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: colors.secondaryText, display: "block" }}>
            OVR
          </Typography>
          <Typography variant="h3" sx={{ color: ACCENT, fontSize: "1.55rem" }}>
            {grade(pick.ratingTenths)}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close player details"><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ py: 2.5 }}>
        <Typography variant="overline" sx={{ color: colors.secondaryText }}>
          Season stats
        </Typography>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          mt: .5,
          mb: 2.5,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
          overflow: "hidden",
        }}>
          {seasonStats.map(([label, value, decimals], index) => (
            <Box
              key={label}
              sx={{
                py: 1.25,
                textAlign: "center",
                bgcolor: colors.surface,
                borderRight: index % 3 !== 2 ? `1px solid ${colors.border}` : 0,
                borderBottom: index < 3 ? `1px solid ${colors.border}` : 0,
              }}
            >
              <Typography fontWeight={800}>
                {Number.isFinite(Number(value)) ? Number(value).toFixed(decimals) : "—"}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.secondaryText }}>{label}</Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="overline" sx={{ color: colors.secondaryText }}>
          Player grades
        </Typography>
        <Stack spacing={1} sx={{ mt: .5 }}>
          {metrics.map(([label, value, description]) => (
            <Paper
              key={label}
              sx={{
                p: 1.5,
                border: `1px solid ${colors.border}`,
                bgcolor: colors.surface,
                backgroundImage: "none",
                boxShadow: "none",
              }}
            >
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Typography fontWeight={800}>{label}</Typography>
                <Typography variant="h3" sx={{ color: ACCENT, fontSize: "1.35rem" }}>
                  {grade(value)}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                {description}
              </Typography>
            </Paper>
          ))}
        </Stack>

        <Paper sx={{
          mt: 2,
          p: 1.5,
          border: `1px solid ${ACCENT}44`,
          bgcolor: `${ACCENT}0d`,
          backgroundImage: "none",
          boxShadow: "none",
        }}>
          <Typography fontWeight={800}>Overall rating</Typography>
          <Typography variant="body2" sx={{ color: colors.secondaryText, mt: .5 }}>
            {formula} A résumé bonus is awarded for honors such as All-Star selections, Gold
            Gloves, Silver Sluggers, All-MLB teams, MVP, Cy Young, championships, and postseason
            MVPs. The bonus is capped at 8 total. Every component is compared with the same season
            and role, and OVR is capped at 100.
          </Typography>
        </Paper>
      </DialogContent>
    </Dialog>
  );
}

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new window.Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});
const roundedCanvasRect = (context, x, y, width, height, radius, fill, stroke, lineWidth = 2) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  if (fill) {
    context.fillStyle = fill;
    context.fill();
  }
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.stroke();
  }
};
const fitCanvasText = (context, text, maxWidth, startingSize, minimumSize = 16) => {
  let size = startingSize;
  do {
    context.font = `700 ${size}px Outfit, Arial, sans-serif`;
    if (context.measureText(String(text)).width <= maxWidth) return size;
    size -= 1;
  } while (size > minimumSize);
  return size;
};
const wrapCanvasText = (context, text, maxWidth, maxLines = 2) => {
  const words = String(text).split(" ");
  const lines = [];
  for (const word of words) {
    const candidate = `${lines.at(-1) || ""} ${word}`.trim();
    if (!lines.length || context.measureText(candidate).width > maxWidth) lines.push(word);
    else lines[lines.length - 1] = candidate;
  }
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1]}…`;
  }
  return lines;
};

async function createSharePng({ picks, result, accuracy }) {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  const entries = POSITIONS.map((position) => [
    position,
    picks.find((pick) => pick.assignedPosition === position),
  ]);
  const [brandLogo, backgroundArt, asphalt, ...teamLogos] = await Promise.all([
    loadImage("/diamond-app-icon-v2.webp"),
    loadImage("/one-sixty-two-zero-icon.webp"),
    loadImage("/one-sixty-two-zero-icon.webp"),
    ...entries.map(([, pick]) => (
      pick && resolveTeamLogo(pick)
        ? loadImage(resolveTeamLogo(pick))
        : Promise.resolve(null)
    )),
  ]);

  const background = context.createLinearGradient(0, 0, 1080, 1350);
  background.addColorStop(0, "#02070d");
  background.addColorStop(.52, "#07131f");
  background.addColorStop(1, "#010407");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.globalAlpha = .14;
  const artScale = Math.max(1080 / backgroundArt.width, 1350 / backgroundArt.height);
  const artWidth = backgroundArt.width * artScale;
  const artHeight = backgroundArt.height * artScale;
  context.drawImage(
    backgroundArt,
    (1080 - artWidth) / 2,
    (1350 - artHeight) / 2,
    artWidth,
    artHeight,
  );
  context.restore();
  const glow = context.createRadialGradient(540, 410, 40, 540, 430, 690);
  glow.addColorStop(0, "rgba(43,183,255,.22)");
  glow.addColorStop(1, "rgba(43,183,255,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 1080, 1080);

  context.fillStyle = "rgba(2,10,18,.94)";
  context.fillRect(0, 0, 1080, 128);
  context.fillStyle = ACCENT;
  context.fillRect(0, 126, 1080, 3);
  context.drawImage(brandLogo, 48, 30, 68, 68);
  context.fillStyle = "#f4f8fc";
  context.font = "700 40px Outfit, Arial, sans-serif";
  context.fillText("Diamond Trivia", 136, 68);
  context.fillStyle = ACCENT;
  context.font = "500 22px Outfit, Arial, sans-serif";
  context.fillText("Download on the App Store or Google Play", 136, 101);

  const court = { x: 54, y: 164, width: 972, height: 650 };
  roundedCanvasRect(
    context,
    court.x,
    court.y,
    court.width,
    court.height,
    28,
    "#040608",
    "rgba(43,183,255,.9)",
    3,
  );
  context.save();
  context.beginPath();
  context.roundRect(court.x, court.y, court.width, court.height, 28);
  context.clip();
  context.globalAlpha = .52;
  context.drawImage(asphalt, court.x, court.y, court.width, court.height);
  context.globalAlpha = 1;
  context.fillStyle = "rgba(0,2,4,.48)";
  context.fillRect(court.x, court.y, court.width, court.height);
  context.restore();

  const locations = {
    FLEX: [455, 167],
    OF: [738, 239],
    IF: [163, 415],
    P: [455, 434],
    C: [455, 609],
  };
  entries.forEach(([position, pick], index) => {
    const [x, y] = locations[position];
    const width = 170;
    const height = 214;
    const teamColor = pick
      ? getStatStackLogoMetadata(pick.logoKey)?.primaryColor || ACCENT
      : "rgba(255,255,255,.24)";
    roundedCanvasRect(
      context,
      x,
      y,
      width,
      height,
      18,
      "rgba(2,12,23,.96)",
      teamColor,
      3,
    );
    if (!pick) {
      context.textAlign = "center";
      context.fillStyle = POSITION_COLORS[position] || ACCENT;
      context.font = "800 25px Outfit, Arial, sans-serif";
      context.fillText(position, x + width / 2, y + height / 2 + 8);
      return;
    }
    const orderedPositions = [
      position,
      ...(pick.positions || []).filter(
        (eligiblePosition) => eligiblePosition !== position,
      ),
    ];
    let positionX = x + 16;
    context.textAlign = "left";
    orderedPositions.forEach((eligiblePosition, positionIndex) => {
      context.globalAlpha = positionIndex === 0 ? 1 : .34;
      context.fillStyle = POSITION_COLORS[eligiblePosition] || ACCENT;
      context.font = "800 17px Outfit, Arial, sans-serif";
      context.fillText(eligiblePosition, positionX, y + 27);
      positionX += context.measureText(eligiblePosition).width + 9;
    });
    context.globalAlpha = 1;
    context.textAlign = "right";
    context.fillStyle = "#8ea5b8";
    context.font = "700 11px Outfit, Arial, sans-serif";
    context.fillText("OVR", x + width - 14, y + 18);
    context.fillStyle = ACCENT;
    context.font = "800 20px Outfit, Arial, sans-serif";
    context.fillText(grade(pick.ratingTenths), x + width - 14, y + 38);

    const logo = teamLogos[index];
    if (logo) context.drawImage(logo, x + 58, y + 45, 54, 54);
    context.textAlign = "center";
    context.fillStyle = "#f4f8fc";
    const nameParts = String(pick.playerName || "").trim().split(/\s+/);
    const nameLines = [
      nameParts[0] || "—",
      nameParts.slice(1).join(" "),
    ].filter(Boolean);
    const longestNameLine = nameLines.reduce(
      (longest, line) => line.length > longest.length ? line : longest,
      "",
    );
    const nameSize = fitCanvasText(context, longestNameLine, width - 24, 20, 15);
    context.font = `700 ${nameSize}px Outfit, Arial, sans-serif`;
    nameLines.forEach((line, lineIndex) => {
      context.fillText(line, x + width / 2, y + 128 + lineIndex * 22);
    });
    context.fillStyle = "#91a6b8";
    context.font = "600 14px Outfit, Arial, sans-serif";
    context.fillText(formatSeason(pick.season), x + width / 2, y + 196);
  });

  roundedCanvasRect(
    context,
    54,
    840,
    972,
    230,
    24,
    "rgba(2,12,23,.92)",
    "rgba(255,255,255,.20)",
  );
  context.textAlign = "center";
  context.fillStyle = "#b6c3cf";
  context.font = "700 25px Outfit, Arial, sans-serif";
  context.fillText("PROJECTED RECORD", 540, 886);
  context.fillStyle = ACCENT;
  context.font = "800 100px Outfit, Arial, sans-serif";
  context.fillText(`${result.projectedWins}-${162 - result.projectedWins}`, 540, 988);
  context.font = "600 24px Outfit, Arial, sans-serif";
  context.fillStyle = "#b6c3cf";
  context.fillText("Roster rating", 350, 1030);
  context.fillText("Draft accuracy", 690, 1030);
  context.textAlign = "left";
  context.fillStyle = ACCENT;
  context.font = "800 25px Outfit, Arial, sans-serif";
  context.fillText((result.rosterRatingTenths / 10).toFixed(1), 438, 1030);
  context.fillText(`${accuracy}%`, 786, 1030);

  roundedCanvasRect(
    context,
    54,
    1094,
    972,
    208,
    24,
    "rgba(2,12,23,.92)",
    "rgba(255,255,255,.20)",
  );
  context.textAlign = "left";
  context.fillStyle = "#f4f8fc";
  context.font = "700 28px Outfit, Arial, sans-serif";
  context.fillText("The scouting report", 82, 1137);
  context.font = "500 21px Outfit, Arial, sans-serif";
  result.scoutingReport.slice(0, 3).forEach((item, index) => {
    const y = 1179 + index * 43;
    context.beginPath();
    context.arc(92, y - 7, 7, 0, Math.PI * 2);
    context.fillStyle = item.tone === "strength"
      ? "#5DD39E"
      : item.tone === "weakness" ? "#FF9E64" : ACCENT;
    context.fill();
    context.fillStyle = "#b9c6d2";
    const lines = wrapCanvasText(context, item.text, 885, 1);
    context.fillText(lines[0], 116, y);
  });
  context.textAlign = "center";
  context.fillStyle = "#6f879b";
  context.font = "600 17px Outfit, Arial, sans-serif";
  context.fillText(
    "DOWNLOAD DIAMOND TRIVIA ON THE APP STORE OR GOOGLE PLAY",
    540,
    1330,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob
        ? resolve(blob)
        : reject(new Error("PNG generation failed.")),
      "image/png",
      1,
    );
  });
}

function ShareDialog({ open, onClose, picks, result, accuracy }) {
  const [blob, setBlob] = useState(null);
  const [preview, setPreview] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const text = useMemo(() => [
    "⚾ Diamond Trivia 162-0",
    `Projected record: ${result.projectedWins}-${162 - result.projectedWins}`,
    `Roster rating: ${(result.rosterRatingTenths / 10).toFixed(1)} | Draft accuracy: ${accuracy}%`,
    "",
    ...POSITIONS.map((position) => {
      const pick = picks.find((item) => item.assignedPosition === position);
      if (!pick) return `${position}: Open`;
      return `${position}: ${pick.playerName} — ${pick.teamName}, ${formatSeason(pick.season)} (${grade(pick.ratingTenths)} OVR)`;
    }),
    "",
    "Can you build a 162-0 team?",
    "https://www.diamondtrivia.com/162-0",
  ].join("\n"), [accuracy, picks, result]);
  useEffect(() => {
    if (!open || blob) return undefined;
    let cancelled = false;
    setPreparing(true);
    createSharePng({ picks, result, accuracy }).then((nextBlob) => {
      if (cancelled) return;
      setBlob(nextBlob);
      setPreview(URL.createObjectURL(nextBlob));
      setPreparing(false);
    }).catch(() => setPreparing(false));
    return () => {
      cancelled = true;
    };
  }, [accuracy, blob, open, picks, result]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);
  const shareText = async () => {
    logFirebaseEvent("share_text", { app: "diamond", game: "one_sixty_two_zero" });
    if (navigator.share) await navigator.share({ title: "Diamond Trivia 162-0", text, url: "https://www.diamondtrivia.com/162-0" });
    else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };
  const shareImage = async () => {
    if (!blob) return;
    logFirebaseEvent("share_image", { app: "diamond", game: "one_sixty_two_zero" });
    const file = new File([blob], "diamond-162-0.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text, title: "Diamond Trivia 162-0" });
    } else {
      const link = document.createElement("a");
      link.href = preview;
      link.download = file.name;
      link.click();
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: {
        sx: {
          bgcolor: "#05090d",
          backgroundImage: "none",
          border: `1px solid ${colors.border}`,
          maxHeight: "calc(100dvh - 24px)",
        },
      } }}
    >
      <DialogTitle sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        pb: 1.25,
      }}>
        <Typography component="span" variant="h2" sx={{ fontSize: { xs: "1.35rem", sm: "1.65rem" } }}>
          Share your 162-0 draft
        </Typography>
        <IconButton onClick={onClose} aria-label="Close share preview">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 1.5, sm: 2.5 }, pb: 2.5 }}>
        <Box sx={{
          width: "100%",
          aspectRatio: "4 / 5",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          bgcolor: "#02070c",
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
        }}>
          {preview ? (
            <Box
              component="img"
              src={preview}
              alt="Preview of your Diamond Trivia 162-0 share card"
              sx={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
            />
          ) : (
            <Stack spacing={1.25} sx={{ alignItems: "center" }}>
              <CircularProgress size={44} thickness={3.5} />
              <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                {preparing ? "Building your share card…" : "Preview unavailable"}
              </Typography>
            </Stack>
          )}
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 2 }}>
          <Button
            size="large"
            startIcon={<ShareRoundedIcon />}
            disabled={!blob}
            onClick={shareImage}
            sx={{ flex: 1, minHeight: 54 }}
          >
            {preparing ? "Preparing…" : "Share"}
          </Button>
          <Button
            size="large"
            variant="outlined"
            onClick={shareText}
            sx={{ flex: 1, minHeight: 54 }}
          >
            Share text only
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function ResultRosterRows({ picks, onSelect }) {
  const interactive = typeof onSelect === "function";
  return (
    <Stack spacing={.55}>
      {POSITIONS.map((position) => {
        const pick = picks.find((item) => item.assignedPosition === position);
        return (
          <Box
            component={interactive && pick ? "button" : "div"}
            type={interactive && pick ? "button" : undefined}
            key={position}
            onClick={interactive && pick ? () => onSelect(pick) : undefined}
            sx={{
              width: "100%",
              border: 0,
              color: colors.text,
              background: "transparent",
              display: "grid",
              gridTemplateColumns: interactive
                ? "42px 38px minmax(0,1fr) auto 24px"
                : "42px 38px minmax(0,1fr) auto",
              alignItems: "center",
              gap: 1,
              py: .7,
              px: 0,
              textAlign: "left",
              cursor: interactive && pick ? "pointer" : "default",
              transition: interactive && pick ? "background-color 160ms ease" : "none",
              "&:hover": {
                bgcolor: interactive && pick ? colors.backgroundHighlight : "transparent",
              },
              "&:focus-visible": {
                outline: `2px solid ${ACCENT}`,
                outlineOffset: 2,
              },
            }}
          >
            <PositionBadge position={position} />
            <Box sx={{ position: "relative", width: 34, height: 34 }}>
              {pick && <TeamLogo
                logoKey={pick.logoKey} teamKey={pick.teamKey} fill sizes="34px" alt=""
                style={{ objectFit: "contain" }}
              />}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={850} noWrap>{pick?.playerName || "Gave Up Round"}</Typography>
              {pick && <Typography variant="caption" sx={{ color: colors.secondaryText }} noWrap>
                {formatSeason(pick.season)} · {pick.role === "P"
                  ? `PIT ${grade(pick.pitchingTenths)} · AVL ${grade(pick.reliabilityTenths)} · DOM ${grade(pick.dominanceTenths)}`
                  : `OFF ${grade(pick.offenseTenths)}${pick.role === "DH" ? "" : ` · DEF ${grade(pick.defenseTenths)}`} · AVL ${grade(pick.reliabilityTenths)} · DOM ${grade(pick.dominanceTenths)}`}
              </Typography>}
            </Box>
            <Typography sx={{ color: ACCENT, fontWeight: 950 }}>
              {pick ? grade(pick.ratingTenths) : "—"}
            </Typography>
            {interactive && pick && (
              <ChevronRightRoundedIcon
                aria-hidden
                sx={{ color: colors.secondaryText, fontSize: 24 }}
              />
            )}
          </Box>
        );
      })}
    </Stack>
  );
}

function ResultPage({ attempt, catalog, stats, remaining, onFinalAttempt }) {
  const [selected, setSelected] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const solution = useMemo(() => optimalSolution({
    spins: attempt.spins, combinations: catalog.combinations, calibration: catalog.calibration,
  }), [attempt.spins, catalog]);
  const result = useMemo(() => calculateResult(attempt.picks, catalog.calibration), [attempt.picks, catalog]);
  const total = attempt.picks.reduce((sum, pick) => sum + Number(pick.ratingTenths), 0);
  const accuracy = solution?.ratingTotalTenths
    ? Math.min(100, Math.round(total / solution.ratingTotalTenths * 100)) : 0;
  return (
    <>
      <Stack spacing={1.5} sx={{ width: "100%" }}>
        <Paper sx={{
          py: { xs: 2, md: 2.5 },
          textAlign: "center",
          border: `1px solid ${ACCENT}55`,
          bgcolor: colors.backgroundHighlight,
        }}>
          <Typography variant="overline" sx={{ color: colors.secondaryText }}>
            Projected record
          </Typography>
          <Typography sx={{
            color: ACCENT,
            fontSize: { xs: 54, sm: 66, md: 76 },
            fontWeight: 950,
            lineHeight: 1,
          }}>
            {result.projectedWins}-{162 - result.projectedWins}
          </Typography>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            spacing={2}
            sx={{ justifyContent: "center", mt: 1 }}
          >
            <Typography>
              Roster rating{" "}
              <Box component="strong" sx={{ color: ACCENT }}>
                {(result.rosterRatingTenths / 10).toFixed(1)}
              </Box>
            </Typography>
            <Typography>
              Draft accuracy <Box component="strong" sx={{ color: ACCENT }}>{accuracy}%</Box>
            </Typography>
          </Stack>
        </Paper>

        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0,1.15fr) minmax(330px,.85fr)" },
          gap: 1.5,
          alignItems: "start",
        }}>
          <Stack spacing={1.5}>
            <Paper sx={{ p: 1.7 }}>
              <Typography variant="h6" sx={{ mb: .5 }}>Your lineup</Typography>
              <ResultRosterRows picks={attempt.picks} onSelect={setSelected} />
            </Paper>
            {solution && (
              <Paper sx={{ p: 1.7 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="h6">Solution</Typography>
                    <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                      Best legal lineup from your five draws
                    </Typography>
                  </Box>
                  <Typography sx={{ color: ACCENT, fontWeight: 950 }}>
                    {solution.projectedWins}-{162 - solution.projectedWins}
                  </Typography>
                </Stack>
                <ResultRosterRows picks={solution.picks} />
              </Paper>
            )}
          </Stack>

          <Stack spacing={1.5}>
            <Paper sx={{ p: 1.7 }}>
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                border: `1px solid ${colors.border}`,
                borderRadius: 1.5,
                overflow: "hidden",
                textAlign: "center",
              }}>
                {[
                  ["Accuracy", `${accuracy}%`],
                  ["Played", stats.played],
                  ["Avg wins", average(stats)],
                  ["Best", stats.played ? `${stats.bestWins}-${162 - stats.bestWins}` : "—"],
                  ["162-0s", stats.perfectSeasons],
                ].map(([label, value], index) => (
                  <Box
                    key={label}
                    sx={{
                      gridColumn: index === 0 ? "1 / -1" : "auto",
                      py: index === 0 ? 1.6 : 1.35,
                      bgcolor: index === 0 ? `${ACCENT}12` : colors.backgroundHighlight,
                      borderBottom: index < 3 ? `1px solid ${colors.border}` : 0,
                      borderRight: index > 0 && index % 2 === 1
                        ? `1px solid ${colors.border}`
                        : 0,
                    }}
                  >
                    <Typography sx={{
                      color: index === 0 ? ACCENT : colors.text,
                      fontSize: index === 0 ? "1.5rem" : "1.05rem",
                      fontWeight: 900,
                    }}>{value}</Typography>
                    <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper sx={{ p: 1.7 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>The scouting report</Typography>
              <Stack spacing={1.1}>
                {result.scoutingReport.map((item) => (
                  <Box
                    key={item.text}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "12px minmax(0,1fr)",
                      columnGap: 1.2,
                      alignItems: "start",
                    }}
                  >
                    <Box sx={{
                      height: "1.65em",
                      display: "grid",
                      placeItems: "center",
                    }}>
                      <Box sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: item.tone === "strength"
                          ? "#54D49A"
                          : item.tone === "weakness" ? "#ff9a62" : ACCENT,
                      }} />
                    </Box>
                    <Typography sx={{ color: colors.secondaryText, lineHeight: 1.65 }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
            <StoreCTA
              placement={remaining ? "result_sidebar" : "result_sidebar_attempt_limit"}
              large
            />
          </Stack>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ShareRoundedIcon />}
            onClick={() => {
              setShareOpen(true);
              logFirebaseEvent("share_preview", {
                app: "diamond",
                game: "one_sixty_two_zero",
              });
            }}
            sx={{ flex: 1 }}
          >
            Share
          </Button>
          {remaining ? (
            <>
              <Button size="large" onClick={onFinalAttempt} sx={{ flex: 1.3 }}>
                Play final web attempt
              </Button>
              <Button
                component="a"
                href={getPreferredStoreLink(
                  typeof navigator === "undefined" ? "" : navigator.userAgent,
                ).href}
                onClick={() => logFirebaseEvent("app_handoff_click", {
                  app: "diamond",
                  game: "one_sixty_two_zero",
                  placement: "attempt_one_result",
                  platform: getPreferredStoreLink(navigator.userAgent).platform,
                })}
                variant="outlined"
                sx={{ flex: 1 }}
              >
                Continue in the app
              </Button>
            </>
          ) : (
            <Button
              component="a"
              href={getPreferredStoreLink(
                typeof navigator === "undefined" ? "" : navigator.userAgent,
              ).href}
              onClick={() => logFirebaseEvent("app_handoff_click", {
                app: "diamond",
                game: "one_sixty_two_zero",
                placement: "attempt_limit",
                platform: getPreferredStoreLink(navigator.userAgent).platform,
              })}
              sx={{ flex: 1.3 }}
            >
              Continue in the app
            </Button>
          )}
        </Stack>
        {!remaining && <Alert severity="info" sx={{ borderRadius: 0 }}>You have used today&apos;s two web attempts. Continue in the app for more tickets, rewards, leaderboards, and unlimited Pro play.</Alert>}
      </Stack>
      <PlayerDetails pick={selected} onClose={() => setSelected(null)} />
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        picks={attempt.picks}
        result={result}
        accuracy={accuracy}
      />
    </>
  );
}

function GameBoard({ catalog, state, setState, stats, setStats }) {
  const reduceMotion = useReducedMotion();
  const attempt = state.active;
  const spin = attempt.spins[attempt.currentRound];
  const combination = getCombo(catalog, spin);
  const roundPick = attempt.picks.find((pick) => pick.round === attempt.currentRound);
  const [revealed, setRevealed] = useState(null);
  const [spinning, setSpinning] = useState(true);
  const [selected, setSelected] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [giveUpOpen, setGiveUpOpen] = useState(false);
  const nextSpinKind = useRef("both");
  const [spinKind, setSpinKind] = useState("both");

  useEffect(() => {
    if (attempt.completed) return undefined;
    const requestedSpinKind = nextSpinKind.current;
    nextSpinKind.current = "both";
    setSpinKind(requestedSpinKind);
    setSelected(null);
    setRevealed(null);
    setSpinning(true);
    const timer = setTimeout(() => {
      setRevealed(combination);
      setSpinning(false);
      logFirebaseEvent("slot_resolved", {
        app: "diamond", game: "one_sixty_two_zero",
        attempt_number: attempt.attemptNumber, round_number: attempt.currentRound + 1,
      });
    }, reduceMotion ? 250 : requestedSpinKind === "both" ? 2500 : 1650);
    return () => clearTimeout(timer);
  }, [attempt.attemptNumber, attempt.completed, attempt.currentRound, combination, reduceMotion, spin.combinationID]);

  useEffect(() => {
    const beforeUnload = (event) => {
      if (!attempt.completed) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const confirmNavigation = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link || attempt.completed) return;
      if (!window.confirm("Leave this 162-0 draft? Your current round will be waiting when you return.")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", confirmNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", confirmNavigation, true);
    };
  }, [attempt.completed]);

  const update = (patch) => {
    const next = { ...state, active: { ...attempt, ...patch } };
    persistState(next);
    setState(next);
  };
  const place = (player, position) => {
    const nextPicks = placePlayer(
      attempt.picks,
      player,
      position,
      combination,
      attempt.currentRound,
      attempt.spins
    );
    if (!nextPicks) return;
    const autoReassigned = nextPicks.some((pick) => {
      const prior = attempt.picks.find((item) => item.round === pick.round);
      return prior && prior.assignedPosition !== pick.assignedPosition;
    });
    update({ picks: nextPicks });
    setSelected(null);
    setPickerOpen(false);
    logFirebaseEvent(autoReassigned ? "lineup_auto_reassigned" : "player_placed", {
      app: "diamond", game: "one_sixty_two_zero",
      attempt_number: attempt.attemptNumber, round_number: attempt.currentRound + 1,
      position,
    });
  };
  const completeAttempt = (reason = "finished") => {
    setSelected(null);
    setPickerOpen(false);
    setGiveUpOpen(false);
    const result = calculateResult(attempt.picks, catalog.calibration);
    const completed = {
      ...attempt,
      ...result,
      completed: true,
      completedAt: Date.now(),
    };
    const nextStats = recordStats(stats, result.projectedWins);
    const next = {
      ...state,
      active: completed,
      attempts: [...state.attempts, completed].slice(-2),
    };
    persistState(next);
    setStats(nextStats);
    setState(next);
    logFirebaseEvent("game_complete", {
      app: "diamond", game: "one_sixty_two_zero",
      attempt_number: attempt.attemptNumber,
      projected_wins: result.projectedWins,
      duration_ms: Date.now() - attempt.startedAt,
      completion_reason: reason,
    });
    if (reason !== "finished") {
      logFirebaseEvent(reason, {
        app: "diamond", game: "one_sixty_two_zero",
        attempt_number: attempt.attemptNumber,
        round_number: attempt.currentRound + 1,
        filled_slots: attempt.picks.length,
        projected_wins: result.projectedWins,
        platform: "web",
      });
    }
  };
  const advance = () => {
    if (selected) {
      setSelected(null);
      return;
    }
    if (!roundPick) return;
    logFirebaseEvent("round_complete", {
      app: "diamond", game: "one_sixty_two_zero",
      attempt_number: attempt.attemptNumber, round_number: attempt.currentRound + 1,
    });
    if (attempt.currentRound < 4) {
      setSelected(null);
      setRevealed(null);
      setSpinKind("both");
      setSpinning(true);
      update({ currentRound: attempt.currentRound + 1 });
      return;
    }
    completeAttempt();
  };
  const giveUpRound = () => {
    if (roundPick || spinning) return;
    setSelected(null);
    setPickerOpen(false);
    setGiveUpOpen(false);
    if (attempt.currentRound === 4) {
      completeAttempt("gave_up_round");
      return;
    }
    update({ currentRound: attempt.currentRound + 1 });
    logFirebaseEvent("gave_up_round", {
      app: "diamond", game: "one_sixty_two_zero",
      attempt_number: attempt.attemptNumber,
      round_number: attempt.currentRound + 1,
      filled_slots: attempt.picks.length,
      platform: "web",
    });
  };
  const reroll = (kind) => {
    if (roundPick || spinning) return;
    const replacement = rerollSpin({
      spin, combinations: catalog.combinations, spins: attempt.spins, kind,
    });
    if (!replacement) return;
    const key = kind === "team" ? "teamRerollsRemaining" : "eraRerollsRemaining";
    if (!attempt[key]) return;
    nextSpinKind.current = kind;
    setSelected(null);
    setRevealed(null);
    setSpinKind(kind);
    setSpinning(true);
    update({
      spins: attempt.spins.map((item, index) => index === attempt.currentRound ? replacement : item),
      [key]: attempt[key] - 1,
    });
    logFirebaseEvent("reroll", {
      app: "diamond", game: "one_sixty_two_zero",
      reroll_type: kind, attempt_number: attempt.attemptNumber,
    });
  };
  return (
    <>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0,1.1fr) minmax(340px,.78fr)" },
        gap: 2,
        alignItems: "stretch",
      }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ position: "relative" }}>
            <Court picks={attempt.picks} spins={attempt.spins} selected={selected} round={attempt.currentRound} onGiveUp={() => setGiveUpOpen(true)} giveUpDisabled={spinning} onSelect={(entry) => {
              setSelected(entry);
              if (entry) logFirebaseEvent("player_selected", {
                app: "diamond", game: "one_sixty_two_zero", selection_type: "roster",
              });
            }} onPlace={place} />
          </Box>
        </Box>
        <Stack spacing={2} sx={{ minHeight: 0, height: "100%" }}>
          <SlotMachine
            spin={spin}
            combinations={catalog.combinations}
            spinning={spinning}
            spinKind={spinKind}
            reducedMotion={reduceMotion}
            picks={attempt.picks}
            attempt={attempt}
            onReroll={reroll}
          />
          <Box sx={{ display: { xs: "none", md: "flex" }, minHeight: 0, flex: 1 }}>
            <PickerContent
              combination={spinning ? null : revealed}
              picks={attempt.picks}
              selected={selected}
              disabled={spinning || Boolean(roundPick)}
              onSelect={(player) => {
                setSelected(player);
                logFirebaseEvent("player_selected", {
                  app: "diamond", game: "one_sixty_two_zero", selection_type: "picker",
                });
              }}
            />
          </Box>
          <Box sx={{ mt: "auto!important" }}>
            {selected ? (
              <Button fullWidth size="large" variant="outlined" onClick={advance}>Deselect</Button>
            ) : roundPick ? (
              <Button fullWidth size="large" onClick={advance}>
                {attempt.currentRound === 4 ? "Finish Draft" : "Advance Round"}
              </Button>
            ) : (
              <Button
                fullWidth
                size="large"
                disabled={spinning}
                onClick={() => setPickerOpen(true)}
                sx={{ display: { xs: "flex", md: "none" } }}
              >
                Draft a player
              </Button>
            )}
          </Box>
        </Stack>
      </Box>
      <MobilePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        combination={spinning ? null : revealed}
        picks={attempt.picks}
        selected={selected}
        disabled={spinning || Boolean(roundPick)}
        onSelect={(player) => {
          setSelected(player);
          setPickerOpen(false);
          logFirebaseEvent("player_selected", {
            app: "diamond", game: "one_sixty_two_zero", selection_type: "picker",
          });
        }}
      />
      <Dialog
        open={giveUpOpen}
        onClose={() => setGiveUpOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              bgcolor: colors.surface,
              backgroundImage: "none",
              border: `1px solid ${colors.border}`,
            },
          },
        }}
      >
        <DialogTitle>Give Up?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.secondaryText, mb: 2 }}>
            {roundPick
              ? "Finish the attempt with your current lineup. Empty positions count as zero."
              : "Skip this draw or finish the attempt with your current lineup. Empty positions count as zero."}
          </Typography>
          <Stack spacing={1}>
            {!roundPick && (
              <Button color="error" variant="outlined" onClick={giveUpRound}>
                Give Up Round
              </Button>
            )}
            <Button color="error" variant="contained" onClick={() => completeAttempt("gave_up_attempt")}>
              Give Up Attempt
            </Button>
            <Button color="inherit" onClick={() => setGiveUpOpen(false)}>Cancel</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function PlayOneSixtyTwoZero() {
  const { config, loading: configLoading, error: configError, retry: retryConfig } = useOneSixtyTwoZeroConfig();
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogReload, setCatalogReload] = useState(0);
  const [state, setState] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    logFirebaseEvent("game_impression", { app: "diamond", game: "one_sixty_two_zero" });
  }, []);
  useEffect(() => {
    if (configLoading || !config) return undefined;
    let active = true;
    setCatalogLoading(true);
    loadCatalog(config).then((nextCatalog) => {
      if (!active) return;
      setCatalog(nextCatalog);
      setCatalogError(null);
      setCatalogLoading(false);
    }).catch((error) => {
      if (!active) return;
      setCatalogError(error);
      setCatalogLoading(false);
    });
    return () => {
      active = false;
    };
  }, [catalogReload, config, configLoading]);
  useEffect(() => {
    if (!catalog || state) return;
    const current = readState();
    setStats(readStats());
    const activeCatalogIsCompatible = !current.active || (
      current.active.catalogVersion === catalog.catalogVersion
      && current.active.catalogChecksum === catalog.catalogChecksum
      && Array.isArray(current.active.spins)
      && current.active.spins.every((spin) => getCombo(catalog, spin))
    );
    if (!activeCatalogIsCompatible) {
      setState({
        ...emptyState(easternDate()),
        resetNotice: "The 162-0 player catalog changed while this draft was active. Continue to replace the incompatible draft; your career statistics will be preserved.",
      });
      return;
    }
    if (!current.active && current.attempts.length === 0) {
      const attempt = {
        attemptNumber: 1,
        catalogVersion: catalog.catalogVersion,
        catalogChecksum: catalog.catalogChecksum,
        startedAt: Date.now(),
        currentRound: 0,
        spins: createSpins(catalog.combinations),
        picks: [],
        teamRerollsRemaining: 1,
        eraRerollsRemaining: 1,
        completed: false,
      };
      const next = { ...current, active: attempt };
      persistState(next);
      setState(next);
      logFirebaseEvent("game_start", {
        app: "diamond", game: "one_sixty_two_zero", attempt_number: 1,
      });
    } else {
      setState(current);
    }
  }, [catalog, state]);
  useEffect(() => {
    if (state && !state.active && state.attempts.length >= 2) {
      logFirebaseEvent("attempt_limit_view", {
        app: "diamond", game: "one_sixty_two_zero",
      });
    }
  }, [state]);

  const startFinal = () => {
    const attempt = {
      attemptNumber: 2,
      catalogVersion: catalog.catalogVersion,
      catalogChecksum: catalog.catalogChecksum,
      startedAt: Date.now(),
      currentRound: 0,
      spins: createSpins(catalog.combinations),
      picks: [],
      teamRerollsRemaining: 1,
      eraRerollsRemaining: 1,
      completed: false,
    };
    const next = { ...state, active: attempt };
    persistState(next);
    setState(next);
    logFirebaseEvent("second_attempt_start", {
      app: "diamond", game: "one_sixty_two_zero", attempt_number: 2,
    });
  };

  if (configError) {
    return (
      <Alert severity="error" action={<Button color="inherit" onClick={retryConfig}>Retry</Button>}>
        162-0 could not read its Firebase catalog configuration.
      </Alert>
    );
  }
  if (catalogError) {
    return (
      <Alert
        severity="error"
        action={<Button color="inherit" onClick={() => {
          void retryConfig();
          setCatalogReload((value) => value + 1);
        }}>Retry</Button>}
      >
        162-0 could not load its verified player catalog. Check your connection and try again.
      </Alert>
    );
  }
  if (configLoading || catalogLoading || !state || !stats) return <GameSkeleton />;
  if (state.resetNotice) {
    return (
      <Alert severity="warning" action={<Button color="inherit" onClick={() => {
        const next = emptyState(easternDate());
        persistState(next);
        setState(null);
      }}>Continue</Button>}>
        {state.resetNotice}
      </Alert>
    );
  }
  if (state.active?.completed) {
    return (
      <ResultPage
        attempt={state.active}
        catalog={catalog}
        stats={stats}
        remaining={Math.max(0, 2 - state.attempts.length)}
        onFinalAttempt={startFinal}
      />
    );
  }
  if (!state.active && state.attempts.length >= 2) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <SportsBaseballRoundedIcon sx={{ fontSize: 56, color: ACCENT }} />
        <Typography variant="h3" sx={{ mt: 1 }}>Two strong drafts today</Typography>
        <Typography sx={{ my: 2, color: colors.secondaryText }}>
          Continue in the app for more tickets, rewards, leaderboards, and unlimited Pro play.
        </Typography>
        <StoreCTA placement="attempt_limit" large />
      </Paper>
    );
  }
  if (!state.active && state.attempts.length === 1) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h3">One final web draft</Typography>
        <Typography sx={{ my: 2, color: colors.secondaryText }}>Take one more shot at 162-0 or continue in the app.</Typography>
        <Stack spacing={1.3} sx={{ maxWidth: 420, mx: "auto" }}>
          <Button size="large" onClick={startFinal}>Play final web attempt</Button>
          <StoreCTA placement="attempt_one_result" />
        </Stack>
      </Paper>
    );
  }
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button
          variant="text"
          startIcon={<InfoOutlinedIcon />}
          onClick={() => document.getElementById("how-to-play-162-0")?.scrollIntoView({ behavior: "smooth" })}
        >
          How to play
        </Button>
      </Box>
      <GameBoard catalog={catalog} state={state} setState={setState} stats={stats} setStats={setStats} />
      <Box component="style">{`
        @keyframes eightyReel {
          from { transform: translateY(0); }
          75% { transform: translateY(var(--reel-distance)); }
          to { transform: translateY(var(--reel-distance)); }
        }
      `}</Box>
    </>
  );
}
