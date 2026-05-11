import { useState, useCallback, useRef } from "react";
import {
  Box,
  Drawer,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Paper,
  Fab,
} from "@mui/material";
import { BarChartOutlined } from "@mui/icons-material";
import { useBoundStore } from "../../stores";

const MIN_RESULTS_WIDTH = 320;
const MAX_RESULTS_WIDTH = 700;
const DEFAULT_RESULTS_WIDTH = 400;

export default function CalculatorLayout({ configPanel, resultsPanel }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resultsWidth, setResultsWidth] = useState(DEFAULT_RESULTS_WIDTH);
  const dragging = useRef(false);

  const totalTokens = useBoundStore((s) => s.totalTokens);
  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const comparisonResults = useBoundStore((s) => s.comparisonResults);

  const hasResults =
    totalTokens !== null || (comparisonMode && comparisonResults.length > 0);

  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), []);

  // Drag-to-resize handler
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    const startX = e.clientX;
    const startWidth = resultsWidth;

    const handleMouseMove = (e) => {
      if (!dragging.current) return;
      const delta = startX - e.clientX;
      const newWidth = Math.min(MAX_RESULTS_WIDTH, Math.max(MIN_RESULTS_WIDTH, startWidth + delta));
      setResultsWidth(newWidth);
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [resultsWidth]);

  if (isDesktop) {
    return (
      <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Config panel */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: { md: 3, lg: 4 },
            minWidth: 0,
          }}
        >
          {configPanel}
        </Box>

        {/* Resize handle */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            width: 6,
            flexShrink: 0,
            cursor: "col-resize",
            bgcolor: "transparent",
            position: "relative",
            zIndex: 1,
            "&:hover": { bgcolor: "action.hover" },
            "&::after": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 2,
              height: 32,
              borderRadius: 1,
              bgcolor: "divider",
            },
          }}
        />

        {/* Results panel */}
        <Box
          sx={{
            width: resultsWidth,
            flexShrink: 0,
            borderLeft: 1,
            borderColor: "divider",
            position: "sticky",
            top: 64,
            height: "calc(100vh - 64px)",
            overflow: "auto",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ p: 2.5 }}>
            {resultsPanel}
          </Box>
        </Box>
      </Box>
    );
  }

  // Mobile/tablet: full-width config + bottom sheet for results
  return (
    <Box sx={{ pb: hasResults ? 12 : 0 }}>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        {configPanel}
      </Box>

      {/* Floating results bar */}
      {hasResults && (
        <Paper
          elevation={8}
          onClick={toggleMobile}
          sx={(t) => ({
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: t.zIndex.appBar - 1,
            px: 2.5,
            py: 2,
            cursor: "pointer",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            background:
              t.palette.mode === "dark"
                ? `linear-gradient(135deg, #0d2d4d 0%, #0a2a3d 100%)`
                : `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
            color: t.palette.mode === "dark" ? t.palette.text.primary : "#fff",
            borderTop: "none",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
          })}
        >
          <Box
            sx={{
              width: 36,
              height: 4,
              bgcolor: "rgba(255,255,255,0.4)",
              borderRadius: 2,
            }}
          />
          <Stack direction="row" alignItems="center" spacing={2}>
            <BarChartOutlined />
            <MiniResults />
          </Stack>
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ opacity: 0.8 }}
          >
            Tap to view full results
          </Typography>
        </Paper>
      )}

      {/* Results drawer */}
      <Drawer
        anchor="bottom"
        open={mobileOpen}
        onClose={toggleMobile}
        PaperProps={{
          sx: {
            maxHeight: "85vh",
            borderRadius: "16px 16px 0 0",
          },
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, overflow: "auto" }}>
          {/* Drag handle */}
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: "divider",
              borderRadius: 2,
              mx: "auto",
              mb: 2,
            }}
          />
          {resultsPanel}
        </Box>
      </Drawer>

      {/* FAB for results when no results yet but there are images */}
      {!hasResults && (
        <Fab
          color="primary"
          size="medium"
          onClick={toggleMobile}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            display: { lg: "none" },
          }}
          aria-label="View results"
        >
          <BarChartOutlined />
        </Fab>
      )}
    </Box>
  );
}

function MiniResults() {
  const totalTokens = useBoundStore((s) => s.totalTokens);
  const totalCost = useBoundStore((s) => s.totalCost);
  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const comparisonResults = useBoundStore((s) => s.comparisonResults);

  if (comparisonMode && comparisonResults.length > 0) {
    const cheapest = comparisonResults.reduce((min, r) =>
      Number(r.totalCost) < Number(min.totalCost) ? r : min,
    );
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body1" fontWeight={700} sx={{ fontFeatureSettings: '"tnum"' }}>
          {cheapest.totalTokens?.toLocaleString()} tokens
        </Typography>
        <Typography variant="body1" fontWeight={500} sx={{ fontFeatureSettings: '"tnum"', opacity: 0.85 }}>
          from ${Number(cheapest.totalCost).toFixed(5)}
        </Typography>
      </Stack>
    );
  }

  if (totalTokens !== null) {
    const currencyFmt = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    });
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body1" fontWeight={700} sx={{ fontFeatureSettings: '"tnum"' }}>
          {totalTokens.toLocaleString()} tokens
        </Typography>
        <Typography variant="body1" fontWeight={500} sx={{ fontFeatureSettings: '"tnum"', opacity: 0.85 }}>
          {currencyFmt.format(Number(totalCost))}
        </Typography>
      </Stack>
    );
  }

  return null;
}
