import { createTheme } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    primary: {
      main: "#007FFF",
      light: "#33A1FD",
      dark: "#0059B2",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F25022",
      light: "#F57C57",
      dark: "#A83117",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#D83B01",
      light: "#E6603C",
      dark: "#9A2D01",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#FFB900",
      light: "#FFCC3D",
      dark: "#B38300",
      contrastText: "#000000",
    },
    info: {
      main: "#00BCF2",
      light: "#33C9F5",
      dark: "#008BB8",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#107C10",
      light: "#45A045",
      dark: "#085B08",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F3F2F1",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#323130",
      secondary: "#605E5C",
      disabled: "#A19F9D",
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

theme = {
  ...theme,
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: theme.palette.primary.main,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.secondary.main,
        },
      },
    },
  },
};

export default theme;
