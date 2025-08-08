import { createTheme, responsiveFontSizes, alpha } from "@mui/material/styles";

const buildPalette = (mode) => {
  const isDark = mode === "dark";
  return {
    mode,
    primary: {
      main: isDark ? "#3AA0FF" : "#0F6CBD",
      contrastText: "#ffffff",
    },
    secondary: {
      main: isDark ? "#2BC3E8" : "#00BCF2",
      contrastText: "#ffffff",
    },
    background: {
      default: isDark ? "#0B0B0C" : "#F6F8FB",
      paper: isDark ? "#111214" : "#ffffff",
    },
    text: {
      primary: isDark ? "#F3F4F6" : "#1B1A19",
      secondary: isDark ? "#C7C9CC" : "#5E5A58",
    },
    error: {
      main: "#D83B01",
    },
    divider: isDark ? alpha("#FFFFFF", 0.12) : alpha("#1B1A19", 0.12),
  };
};

const buildShadows = (isDark) => [
  "none",
  "0 1px 2px rgba(0,0,0,0.03)",
  "0 1px 3px rgba(0,0,0,0.06)",
  "0 2px 6px rgba(0,0,0,0.06)",
  "0 4px 10px rgba(0,0,0,0.07)",
  "0 6px 14px rgba(0,0,0,0.08)",
  "0 8px 18px rgba(0,0,0,0.1)",
  "0 10px 24px rgba(0,0,0,0.12)",
  "0 12px 28px rgba(0,0,0,0.14)",
  ...Array(15).fill(
    isDark ? "0 12px 28px rgba(0,0,0,0.16)" : "0 12px 28px rgba(0,0,0,0.14)"
  ),
];

export default function buildTheme(mode = "light") {
  const palette = buildPalette(mode);
  const isDark = mode === "dark";

  let theme = createTheme({
    palette,
    shape: {
      borderRadius: 5,
    },
    typography: {
      fontFamily: [
        "Segoe UI",
        "Roboto",
        "Arial",
        "system-ui",
        "sans-serif",
      ].join(","),
      h1: { fontWeight: 700, letterSpacing: -0.5 },
      h2: { fontWeight: 700, letterSpacing: -0.25 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: "none" },
    },
    shadows: buildShadows(isDark),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": {
            colorScheme: mode,
          },
          body: {
            backgroundImage: isDark
              ? `radial-gradient(60% 80% at 0% 0%, ${alpha(
                  "#3AA0FF",
                  0.07
                )} 0, transparent 60%),
                 radial-gradient(60% 80% at 100% 0%, ${alpha(
                   "#2BC3E8",
                   0.07
                 )} 0, transparent 60%)`
              : `radial-gradient(60% 80% at 0% 0%, ${alpha(
                  "#0F6CBD",
                  0.06
                )} 0, transparent 60%),
                 radial-gradient(60% 80% at 100% 0%, ${alpha(
                   "#00BCF2",
                   0.06
                 )} 0, transparent 60%)`,
            backgroundAttachment: "fixed",
          },
          "*:focus-visible": {
            outline: `3px solid ${alpha(palette.primary.main, 0.5)}`,
            outlineOffset: 2,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: "saturate(120%) blur(6px)",
            backgroundImage: "none",
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: 64,
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 1,
        },
        styleOverrides: {
          root: {
            border: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          size: "medium",
        },
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 5,
          },
          containedPrimary: {
            boxShadow: "none",
            ":hover": {
              boxShadow: "none",
            },
          },
        },
      },
      MuiIconButton: {
        defaultProps: { size: "medium" },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
          variant: "outlined",
          fullWidth: true,
        },
      },
      MuiAutocomplete: {
        defaultProps: {
          size: "small",
          clearOnEscape: true,
          fullWidth: true,
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& th": {
              fontWeight: 700,
            },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: 5,
            border: 0,
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
}
