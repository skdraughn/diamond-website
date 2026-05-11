import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primary,
      contrastText: "#fff",
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
            "radial-gradient(1000px circle at 20% -10%, rgba(240,68,56,0.18), transparent 40%), radial-gradient(850px circle at 100% 0%, rgba(47,158,68,0.14), transparent 42%), #070908",
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
          borderRadius: 8,
          padding: "9px 18px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
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
