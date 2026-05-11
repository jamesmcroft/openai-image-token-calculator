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
    success: {
      main: isDark ? "#34D399" : "#059669",
    },
    background: {
      default: isDark ? "#0A0A0B" : "#F5F7FA",
      paper: isDark ? "#151619" : "#ffffff",
      glass: isDark ? alpha("#151619", 0.85) : alpha("#ffffff", 0.7),
    },
    text: {
      primary: isDark ? "#F3F4F6" : "#1B1A19",
      secondary: isDark ? "#C7C9CC" : "#5E5A58",
    },
    error: {
      main: "#D83B01",
    },
    divider: isDark ? alpha("#FFFFFF", 0.14) : alpha("#1B1A19", 0.08),
  };
};

const buildShadows = (isDark) => [
  "none",
  isDark
    ? "0 1px 3px rgba(0,0,0,0.24)"
    : "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
  isDark
    ? "0 2px 6px rgba(0,0,0,0.28)"
    : "0 2px 4px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.06)",
  "0 4px 12px rgba(0,0,0,0.08)",
  "0 6px 16px rgba(0,0,0,0.1)",
  "0 8px 24px rgba(0,0,0,0.12)",
  "0 12px 32px rgba(0,0,0,0.14)",
  "0 16px 40px rgba(0,0,0,0.16)",
  "0 20px 48px rgba(0,0,0,0.18)",
  ...Array(15).fill(
    isDark ? "0 20px 48px rgba(0,0,0,0.24)" : "0 20px 48px rgba(0,0,0,0.16)",
  ),
];

export default function buildTheme(mode = "light") {
  const palette = buildPalette(mode);
  const isDark = mode === "dark";

  let theme = createTheme({
    palette,
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: [
        "Inter",
        "Segoe UI",
        "Roboto",
        "system-ui",
        "sans-serif",
      ].join(","),
      h1: { fontWeight: 700, letterSpacing: "-0.025em" },
      h2: { fontWeight: 700, letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, letterSpacing: "-0.015em" },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: "none" },
      metric: {
        fontWeight: 700,
        fontSize: "2rem",
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        fontFeatureSettings: '"tnum"',
      },
      metricLabel: {
        fontWeight: 500,
        fontSize: "0.75rem",
        lineHeight: 1.4,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
      },
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
              ? `radial-gradient(ellipse 80% 60% at 0% 0%, ${alpha("#3AA0FF", 0.08)} 0%, transparent 50%),
                 radial-gradient(ellipse 60% 60% at 100% 0%, ${alpha("#2BC3E8", 0.06)} 0%, transparent 50%)`
              : `radial-gradient(ellipse 80% 60% at 0% 0%, ${alpha("#0F6CBD", 0.06)} 0%, transparent 50%),
                 radial-gradient(ellipse 60% 60% at 100% 0%, ${alpha("#00BCF2", 0.05)} 0%, transparent 50%)`,
            backgroundAttachment: "fixed",
          },
          "*:focus-visible": {
            outline: `2px solid ${alpha(palette.primary.main, 0.5)}`,
            outlineOffset: 2,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: "saturate(140%) blur(12px)",
            backgroundImage: "none",
            backgroundColor: isDark
              ? alpha("#151619", 0.9)
              : alpha(palette.primary.main, 0.95),
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: 56,
            "@media (min-width: 600px)": {
              minHeight: 64,
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            border: `1px solid ${palette.divider}`,
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
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
            borderRadius: 8,
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
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 8,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& th": {
              fontWeight: 700,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: 0,
            "&::before": { display: "none" },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
}

export { alpha };
