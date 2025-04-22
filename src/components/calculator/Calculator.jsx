import { useState } from "react";
import { useBoundStore } from "../../stores";
import ModelSelector from "./ModelSelector";
import ImageEditor from "./ImageEditor";
import CalculatorOutput from "./CalculatorOutput";
import { Box } from "@mui/material";

export default function Calculator() {
  const [modelName, setModelName] = useState("");
  const runCalculation = useBoundStore((s) => s.runCalculation);

  const handleSubmit = (e) => {
    e.preventDefault();
    runCalculation();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <ModelSelector modelName={modelName} setModelName={setModelName} />
      <ImageEditor />
      <CalculatorOutput />
    </Box>
  );
}
