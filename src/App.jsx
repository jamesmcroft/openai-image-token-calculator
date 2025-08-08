import {
  AppBar,
  Box,
  CssBaseline,
  Container,
  Grid,
  Toolbar,
  Typography,
  useMediaQuery,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import buildTheme from "./components/layout/Theme";
import Calculator from "./components/calculator/Calculator";
import CalculationExplanation from "./components/calculator/CalculationExplanation";
import Footer from "./components/layout/Footer";
import { useMemo, useState, useEffect } from "react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function App() {
  const [mode, setMode] = useState("light");
  useEffect(() => {
    const stored = localStorage.getItem("color-mode");
    if (stored === "light" || stored === "dark") {
      setMode(stored);
      return;
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    setMode(mql.matches ? "dark" : "light");
    const listener = (e) => setMode(e.matches ? "dark" : "light");
    mql.addEventListener?.("change", listener);
    return () => mql.removeEventListener?.("change", listener);
  }, []);
  useEffect(() => {
    localStorage.setItem("color-mode", mode);
  }, [mode]);
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="sticky" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: -0.2 }}
          >
            Azure OpenAI Image Token Calculator
          </Typography>
          <Tooltip
            title={
              mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <IconButton
              color="inherit"
              onClick={() => setMode((m) => (m === "light" ? "dark" : "light"))}
            >
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Grid container spacing={isMdUp ? 4 : 2} alignItems="stretch">
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={1}
              sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, height: "100%" }}
            >
              <Calculator />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={1}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                position: { md: "sticky" },
                top: { md: theme.spacing(4) },
              }}
            >
              <CalculationExplanation />
              <Box mt={4}>
                <Footer />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
