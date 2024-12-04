import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useBoundStore } from "../../stores";

const ModelSelector = ({ modelName, setModelName }) => {
  const models = useBoundStore((state) => state.models);
  const setModel = useBoundStore((state) => state.setModel);
  const runCalculation = useBoundStore((state) => state.runCalculation);
  const resetCalculation = useBoundStore((state) => state.resetCalculation);

  const selectModel = (model) => {
    setModelName(model);

    const selectedModel = models.find((m) => m.name === model);
    if (selectedModel) {
      setModel(selectedModel);
      runCalculation();
    } else {
      setModel(null);
      resetCalculation();
    }
  };

  return (
    <FormControl fullWidth margin="normal" required>
      <InputLabel id="model-label">Model</InputLabel>
      <Select
        labelId="model-label"
        value={modelName}
        onChange={(e) => selectModel(e.target.value)}
        label="Model"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {models.map((model) => (
          <MenuItem key={model.name} value={model.name}>
            {model.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ModelSelector;
