import {
  Box,
  Button,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import { colors } from "../theme/colors";
import GameOverAppPromo from "./GameOverAppPromo";

export default function CompleteGameModalShell({
  open,
  onClose,
  statusTitle,
  statusColor,
  subtitle,
  hero,
  statsItems = [],
  distribution,
  bonus,
  actions = [],
  secondaryActions = [],
  game,
}) {
  const totalDistribution = distribution?.values?.reduce(
    (acc, curr) => acc + Number(curr || 0),
    0
  );

  return (
    <Modal
      open={open}
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
          bgcolor: colors.backgroundHighlight,
          borderRadius: 3,
          border: `1px solid ${colors.border}`,
          p: { xs: 2.25, sm: 3 },
          outline: "none",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: subtitle ? 0 : 1.75 }}>
          <Typography variant="h6" sx={{ color: statusColor || colors.text, fontWeight: 900 }}>
            {statusTitle}
          </Typography>
          <IconButton onClick={onClose} aria-label="Close game over modal" size="small">
            <CloseIcon sx={{ color: colors.text }} />
          </IconButton>
        </Box>

        {subtitle ? (
          <Typography variant="subtitle1" sx={{ color: colors.secondaryText, mt: 0.35, mb: 2.25 }}>
            {subtitle}
          </Typography>
        ) : null}

        {hero || null}

        {statsItems.length > 0 ? (
          <Box
            sx={{
              backgroundColor: "rgba(5, 5, 6, 0.42)",
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              p: { xs: 1.5, sm: 2 },
              mb: 2.25,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: colors.secondaryText, fontWeight: 800, mb: 1.5 }}
            >
              Your Stats
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.max(1, statsItems.length)}, minmax(0, 1fr))`,
                gap: 1,
              }}
            >
              {statsItems.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    minWidth: 0,
                    py: 0.75,
                    px: 0.5,
                    textAlign: "center",
                    borderRight: item !== statsItems.at(-1) ? `1px solid ${colors.border}` : "none",
                  }}
                >
                  <Typography variant="h6" sx={{ color: colors.text, fontWeight: 900, lineHeight: 1.1 }}>
                    {item.value ?? 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {distribution?.values?.length ? (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{ color: colors.secondaryText, fontWeight: "bold", mb: 1, mt: 3 }}
                >
                  {distribution.title || "Distribution"}
                </Typography>
                {distribution.values.map((count, index) => {
                  const value = Number(count || 0);
                  const proportion =
                    totalDistribution > 0 ? (value / totalDistribution) * 100 : 0;
                  const barWidth = value > 0 ? Math.max(proportion, 18) : 12;

                  return (
                    <Box
                      key={`${distribution.title || "dist"}-${index}`}
                      sx={{ display: "flex", alignItems: "center", mb: "2px" }}
                    >
                      <Typography sx={{ width: "20px", color: colors.secondaryText }}>
                        {index + 1}
                      </Typography>
                      <Box
                        sx={{
                          height: "20px",
                          backgroundColor: colors.softGreen,
                          width: `calc(${barWidth}% - 30px)`,
                          ml: "10px",
                          borderTopRightRadius: "4px",
                          borderBottomRightRadius: "4px",
                          display: "flex",
                          justifyContent: "flex-end",
                          pr: ".5rem",
                          minWidth: "30px",
                        }}
                      >
                        <Typography sx={{ ml: 1, color: colors.text }}>{value}</Typography>
                      </Box>
                    </Box>
                  );
                })}
              </>
            ) : null}
          </Box>
        ) : null}

        {bonus?.show ? (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2.25 }}>
            <Image
              src="/diamond-app-icon-v2.webp"
              width={40}
              height={40}
              alt="Diamond Trivia"
              style={{ marginRight: 8, objectFit: "contain" }}
            />
            <Typography
              variant="h4"
              sx={{ alignSelf: "center", color: colors.text, fontWeight: "bold" }}
            >
              +{bonus.value || 0}
            </Typography>
          </Box>
        ) : null}

        <GameOverAppPromo game={game || statusTitle} />

        {actions.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant || "contained"}
                fullWidth
                onClick={action.onClick}
                color={action.color}
                sx={action.sx}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        ) : null}

        {secondaryActions.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, mt: 1 }}>
            {secondaryActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant || "outlined"}
                fullWidth
                onClick={action.onClick}
                color={action.color}
                sx={action.sx}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        ) : null}
      </Box>
    </Modal>
  );
}
