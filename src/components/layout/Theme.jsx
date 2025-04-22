import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0078D4",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00BCF2",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F3F2F1",
      paper: "#ffffff",
    },
    text: {
      primary: "#242424",
      secondary: "#605E5C",
    },
    error: {
      main: "#D83B01",
    },
  },
  typography: {
    fontFamily: ["Segoe UI", "Roboto", "Arial", "sans-serif"].join(","),
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
