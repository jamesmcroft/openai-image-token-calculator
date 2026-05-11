import { useState } from "react";
import { useBoundStore } from "../../stores";
import ModelSelector from "./ModelSelector";
import ImageEditor from "./ImageEditor";
import CalculatorOutput from "./CalculatorOutput";
import ComparisonTable from "./comparison/ComparisonTable";
import {
  Box,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Calculate, CompareArrows } from "@mui/icons-material";

export default function Calculator() {
  const [modelName, setModelName] = useState("");
  const runCalculation = useBoundStore((s) => s.runCalculation);
  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const setComparisonMode = useBoundStore((s) => s.setComparisonMode);

  const handleSubmit = (e) => {
    e.preventDefault();
    runCalculation();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      role="region"
      aria-label="Calculator"
    >
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mr: "auto" }}>
            Configure your calculation
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
                // modelName stays as-is for UI; the store carries it into selectedModels
                setModelName("");
              } else {
                // Read back the model the store picked when leaving comparison mode
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
            : "Select a model and add one or more images to estimate input tokens and cost for Azure OpenAI image processing."}
        </Typography>
      </Stack>
      <ModelSelector modelName={modelName} setModelName={setModelName} />
      <ImageEditor />
      {comparisonMode ? <ComparisonTable /> : <CalculatorOutput />}
    </Box>
  );
}
