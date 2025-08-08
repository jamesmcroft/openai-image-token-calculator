import { useState } from "react";
import { useBoundStore } from "../../stores";
import ModelSelector from "./ModelSelector";
import ImageEditor from "./ImageEditor";
import CalculatorOutput from "./CalculatorOutput";
import { Box, Stack, Typography } from "@mui/material";

export default function Calculator() {
  const [modelName, setModelName] = useState("");
  const runCalculation = useBoundStore((s) => s.runCalculation);

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
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Configure your calculation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a model and add one or more images to estimate input tokens and
          cost for Azure OpenAI image processing.
        </Typography>
      </Stack>
      <ModelSelector modelName={modelName} setModelName={setModelName} />
      <ImageEditor />
      <CalculatorOutput />
    </Box>
  );
}
