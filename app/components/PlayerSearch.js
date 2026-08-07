import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Paper,
  List,
  ListItem,
  Typography,
  Box,
} from "@mui/material";
import { colors } from "../theme/colors";
import { abbreviationsToColorMap } from "../utils/positions";
import useFastPlayerSearch from "../hooks/useFastPlayerSearch";

const PlayerSearch = ({
  triviaPlayers,
  handleSelectPlayer,
  disabled,
  isTeamGame,
  teams,
  inlineResults = false,
  inputBackgroundColor = colors.backgroundHighlight,
  accentColor = colors.primary,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const filteredPlayers = useFastPlayerSearch(
    triviaPlayers,
    inputValue,
    isTeamGame,
    teams
  );

  // Fix common UTF-8 mojibake (e.g. "Don\u00c4\u008di\u00c4\u0087" -> "Dončić")
  const fixMojibake = (str) => {
    try {
      const hexEscaped = Array.from(str)
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");
      return decodeURIComponent(hexEscaped);
    } catch {
      return str;
    }
  };
  // Focus the input field on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle keyboard navigation and selection
  const handleKeyDown = (e) => {
    if (!filteredPlayers.length) return;

    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault(); // Prevent default tab behavior
      setHighlightedIndex((prev) => (prev + 1) % filteredPlayers.length);
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault(); // Prevent default shift+tab behavior
      setHighlightedIndex((prev) =>
        prev === 0 ? filteredPlayers.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      handleSelectPlayer(filteredPlayers[highlightedIndex]);
      setInputValue(""); // Clear input after selection
      setHighlightedIndex(0); // Reset highlight
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mb: 3,
      }}
    >
      {/* Input Field */}
      <TextField
        fullWidth
        variant="outlined"
        color="primary"
        placeholder="Type a player name..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        inputRef={inputRef} // Attach ref to keep focus
        onKeyDown={handleKeyDown} // Handle key events
        sx={{
          width: "100%",
          color: colors.text,
          "& .MuiInputBase-input": {
            color: colors.text,
            bgcolor: inputBackgroundColor,
            borderRadius: 1,
          },
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: accentColor },
            "&.Mui-focused fieldset": { borderColor: accentColor },
          },
        }}
        aria-label="Guess player input"
        disabled={disabled}
      />

      {/* Dropdown List */}
      {inputValue && filteredPlayers.length > 0 && (
        <Paper
          sx={{
            position: inlineResults ? "static" : "absolute",
            top: inlineResults ? "auto" : "100%",
            width: "100%",
            zIndex: 10,
            p: 0,
          }}
        >
          <List dense sx={{ bgcolor: colors.background }}>
            {!isTeamGame
              ? filteredPlayers.map((player, index) => {
                  // decode any mojibake
                  const orig = fixMojibake(player.name);

                  return (
                    <ListItem
                      key={index}
                      onClick={() => {
                        handleSelectPlayer(player);
                        setInputValue(""); // Clear input after selection
                        setHighlightedIndex(0); // Reset highlight
                      }}
                      tabIndex={0}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        cursor: "pointer",
                        bgcolor:
                          index === highlightedIndex
                            ? colors.backgroundHighlight
                            : "transparent",
                        "&:hover": {
                          bgcolor: colors.backgroundHighlight,
                        },
                        "&:focus": {
                          outline: `2px solid ${accentColor}`,
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="body1">{orig}</Typography>
                        {(player.start || player.end) && (
                          <Typography variant="body2">
                            {player.start} - {player.end}
                          </Typography>
                        )}
                      </Box>

                      <Typography
                        variant="body1"
                        sx={{
                          ml: "auto",
                          color: abbreviationsToColorMap[player.pos],
                        }}
                      >
                        {player.pos}
                      </Typography>
                    </ListItem>
                  );
                })
              : filteredPlayers.map((player, index) => {
                  <ListItem
                    key={index}
                    onClick={() => {
                      handleSelectPlayer(player);
                      setInputValue(""); // Clear input after selection
                      setHighlightedIndex(0); // Reset highlight
                    }}
                    tabIndex={0}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      cursor: "pointer",
                      bgcolor:
                        index === highlightedIndex
                          ? colors.backgroundHighlight
                          : "transparent",
                      "&:hover": {
                        bgcolor: colors.backgroundHighlight,
                      },
                      "&:focus": {
                        outline: `2px solid ${colors.primary}`,
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="body1">{player.name}</Typography>
                    </Box>
                  </ListItem>;
                })}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default PlayerSearch;
