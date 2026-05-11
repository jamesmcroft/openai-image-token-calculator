import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  Grid,
  InputAdornment,
  Collapse,
  IconButton,
  Link,
} from "@mui/material";
import { Search, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useBoundStore } from "../../stores";
import ModelCard from "../molecules/ModelCard";
import FilterChip from "../atoms/FilterChip";

const FILTERS = [
  { key: "latest", label: "Latest" },
  { key: "budget", label: "Budget" },
  { key: "premium", label: "Premium" },
  { key: "image-gen", label: "Image Gen" },
  { key: "retiring", label: "Retiring" },
];

function matchesFilter(model, group, filterKey) {
  switch (filterKey) {
    case "latest":
      return !model.retirementDate && group !== "Image Generation";
    case "budget":
      return model.costPerMillionTokens <= 1.0;
    case "premium":
      return model.costPerMillionTokens >= 5.0;
    case "image-gen":
      return group === "Image Generation";
    case "retiring":
      return !!model.retirementDate;
    default:
      return true;
  }
}

export default function ModelPicker({ modelName, setModelName }) {
  const models = useBoundStore((s) => s.models);
  const setModel = useBoundStore((s) => s.setModel);
  const runCalculation = useBoundStore((s) => s.runCalculation);
  const resetCalculation = useBoundStore((s) => s.resetCalculation);
  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const selectedModels = useBoundStore((s) => s.selectedModels);
  const toggleModelSelection = useBoundStore((s) => s.toggleModelSelection);
  const runComparison = useBoundStore((s) => s.runComparison);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(new Set(["latest"]));
  const [collapsed, setCollapsed] = useState(false);

  const flatModels = useMemo(
    () =>
      models.flatMap((g) =>
        g.items.map((m) => ({ ...m, group: g.name })),
      ),
    [models],
  );

  const filteredModels = useMemo(() => {
    let result = flatModels;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }
    if (activeFilters.size > 0) {
      result = result.filter((m) =>
        [...activeFilters].some((f) => matchesFilter(m, m.group, f)),
      );
    }
    return result;
  }, [flatModels, search, activeFilters]);

  const toggleFilter = (key) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectedNames = useMemo(
    () => new Set(selectedModels.map((m) => m.name)),
    [selectedModels],
  );

  // Scroll images section into view after model selection
  const scrollToImages = useCallback(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById("section-images");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleSingleSelect = (model) => {
    if (modelName === model.name) {
      setModelName("");
      setModel(null);
      resetCalculation();
      return;
    }
    setModelName(model.name);
    setModel(model);
    runCalculation();
    setCollapsed(true);
    scrollToImages();
  };

  const handleComparisonToggle = (model) => {
    toggleModelSelection(model);
    runComparison();
  };

  // Selected model objects for collapsed display
  const selectedModelObjects = useMemo(() => {
    if (comparisonMode) return selectedModels.map((m) => ({ ...m, group: "" }));
    const found = flatModels.find((m) => m.name === modelName);
    return found ? [found] : [];
  }, [comparisonMode, selectedModels, flatModels, modelName]);

  const hasSelection = selectedModelObjects.length > 0;

  return (
    <Box>
      {/* Collapsed state: show selected card(s) + change button */}
      {collapsed && hasSelection && (
        <Box>
          <Grid container spacing={1} sx={{ mb: 0.5 }}>
            {selectedModelObjects.map((m) => (
              <Grid key={m.name} size={{ xs: 6, sm: 4, md: 4, lg: 3 }}>
                <ModelCard model={m} selected />
              </Grid>
            ))}
          </Grid>
          <Link
            component="button"
            variant="caption"
            fontWeight={600}
            onClick={() => setCollapsed(false)}
            underline="hover"
          >
            Change model{comparisonMode ? "s" : ""}
          </Link>
        </Box>
      )}

      {/* Collapsed state: no selection */}
      {collapsed && !hasSelection && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          onClick={() => setCollapsed(false)}
          sx={{ cursor: "pointer", userSelect: "none" }}
        >
          <IconButton size="small" aria-expanded={false}>
            <ExpandMore fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            No model selected
          </Typography>
          <Typography variant="caption" color="primary" fontWeight={600} sx={{ ml: "auto" }}>
            Choose
          </Typography>
        </Stack>
      )}

      {/* Expanded collapse toggle (only when there is a selection to collapse back to) */}
      {!collapsed && hasSelection && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          onClick={() => setCollapsed(true)}
          sx={{ cursor: "pointer", userSelect: "none", mb: 1.5 }}
        >
          <IconButton size="small" aria-expanded={true}>
            <ExpandLess fontSize="small" />
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            Collapse
          </Typography>
        </Stack>
      )}

      <Collapse in={!collapsed} timeout="auto">
        {/* Search + filters */}
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {FILTERS.map((f) => (
              <FilterChip
                key={f.key}
                label={f.label}
                selected={activeFilters.has(f.key)}
                onClick={() => toggleFilter(f.key)}
              />
            ))}
          </Stack>
        </Stack>

        {/* Model card grid */}
        {filteredModels.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            No models match your filters
          </Typography>
        ) : (
          <Grid container spacing={1}>
            {filteredModels.map((m) => (
              <Grid key={m.name} size={{ xs: 6, sm: 4, md: 4, lg: 3 }}>
                <ModelCard
                  model={m}
                  selected={
                    comparisonMode
                      ? selectedNames.has(m.name)
                      : modelName === m.name
                  }
                  selectable={comparisonMode}
                  onSelect={
                    comparisonMode ? handleComparisonToggle : handleSingleSelect
                  }
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Collapse>
    </Box>
  );
}
