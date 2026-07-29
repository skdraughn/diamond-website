import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primary,
      contrastText: colors.chalk,
    },
    secondary: {
      main: colors.gold,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.text,
      secondary: colors.secondaryText,
    },
  },
  typography: {
    fontFamily:
      "var(--font-outfit), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontWeight: 800,
      letterSpacing: 0,
      color: colors.text,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: 0,
      color: colors.text,
    },
    h6: {
      fontWeight: 700,
      color: colors.text,
    },
    body1: {
      lineHeight: 1.65,
    },
    button: {
      textTransform: "none",
      fontWeight: 800,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(900px circle at 82% -8%, rgba(19,114,74,0.30), transparent 46%), radial-gradient(720px circle at 5% 16%, rgba(67,183,255,0.14), transparent 48%), linear-gradient(145deg, #071522 0%, #0b2b37 43%, #123a2d 100%)",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
        color: "primary",
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "9px 18px",
          boxShadow: "none",
          border: "1px solid rgba(220,235,255,0.15)",
          "&:hover": {
            boxShadow: "none",
            backgroundColor: "#185f43",
          },
          "&:focus-visible": {
            outline: `2px solid ${colors.focus}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          color: colors.text,
          boxShadow: "none",
        },
      },
    },
  },
});

export default theme;
