import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Stack,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Calculate, CompareArrows } from "@mui/icons-material";
import buildTheme from "./components/layout/Theme";
import ThemeToggle from "./components/atoms/ThemeToggle";
import CalculatorLayout from "./components/templates/CalculatorLayout";
import ModelPicker from "./components/organisms/ModelPicker";
import ImageList from "./components/organisms/ImageList";
import ResultsPanel from "./components/organisms/ResultsPanel";
import ExplanationDrawer from "./components/organisms/ExplanationDrawer";
import Footer from "./components/layout/Footer";
import useUrlState from "./hooks/useUrlState";
import { useBoundStore } from "./stores";
import { useMemo, useState, useEffect } from "react";

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

  const [modelName, setModelName] = useState("");
  const [explanationOpen, setExplanationOpen] = useState(false);

  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const setComparisonMode = useBoundStore((s) => s.setComparisonMode);
  const runCalculation = useBoundStore((s) => s.runCalculation);

  const { warning, oversized } = useUrlState({ setModelName });

  const handleSubmit = (e) => {
    e.preventDefault();
    runCalculation();
  };

  const configPanel = (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      role="region"
      aria-label="Calculator"
    >
      {/* Mode toggle + heading */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mr: "auto" }}>
            {comparisonMode ? "Compare models" : "Calculate tokens"}
          </Typography>
          <ToggleButtonGroup
            value={comparisonMode ? "compare" : "single"}
            exclusive
            size="small"
            onChange={(_, val) => {
              if (val === null) return;
              const entering = val === "compare";
              setComparisonMode(entering);
              if (entering) {
                setModelName("");
              } else {
                const restored = useBoundStore.getState().model;
                setModelName(restored?.name ?? "");
              }
            }}
            aria-label="Calculator mode"
          >
            <ToggleButton value="single" aria-label="Single model">
              <Calculate fontSize="small" sx={{ mr: 0.5 }} />
              Single
            </ToggleButton>
            <ToggleButton value="compare" aria-label="Compare models">
              <CompareArrows fontSize="small" sx={{ mr: 0.5 }} />
              Compare
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {comparisonMode
            ? "Select multiple models and add images to compare token costs side by side."
            : "Select a model and add images to estimate input tokens and cost."}
        </Typography>
      </Stack>

      {/* Warnings from URL state restore */}
      {warning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {warning}
        </Alert>
      )}
      {oversized && (
        <Alert severity="info" sx={{ mb: 2 }}>
          The current configuration is too large to encode in the URL.
          The shareable link will not update until the configuration is simplified.
        </Alert>
      )}

      {/* Step 1: Model picker */}
      <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: "block" }}>
        1. Choose Model{comparisonMode ? "s" : ""}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <ModelPicker modelName={modelName} setModelName={setModelName} />
      </Box>

      {/* Step 2: Image configuration */}
      <Typography id="section-images" variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: "block", scrollMarginTop: 80 }}>
        2. Configure Images
      </Typography>
      <Box sx={{ mb: 3 }}>
        <ImageList />
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 6 }}>
        <Footer />
      </Box>
    </Box>
  );

  const resultsPanel = (
    <ResultsPanel onOpenExplanation={() => setExplanationOpen(true)} />
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="sticky" enableColorOnDark>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: "-0.01em", fontSize: { xs: "0.85rem", sm: "1.25rem" } }}
          >
            Azure OpenAI Image Token Calculator
          </Typography>
          <ThemeToggle
            mode={mode}
            onToggle={() => setMode((m) => (m === "light" ? "dark" : "light"))}
          />
        </Toolbar>
      </AppBar>

      <CalculatorLayout
        configPanel={configPanel}
        resultsPanel={resultsPanel}
      />

      <ExplanationDrawer
        open={explanationOpen}
        onClose={() => setExplanationOpen(false)}
      />
    </ThemeProvider>
  );
}
