"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { colors } from "../theme/colors";

export default function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  accentColor = colors.statStack,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            bgcolor: colors.backgroundHighlight,
            border: `1px solid ${accentColor}66`,
            borderRadius: 2,
            boxShadow: "0 22px 60px rgba(0, 0, 0, 0.48)",
            backgroundImage: "none",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, textAlign: "center" }}>
        <Typography component="span" sx={{ fontSize: "1.25rem", fontWeight: 900 }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: colors.secondaryText, textAlign: "center" }}>
          {description}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{ borderColor: colors.border, color: colors.text }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onConfirm}
          sx={{
            bgcolor: colors.text,
            color: colors.background,
            "&:hover": { bgcolor: "#ded8ce" },
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
