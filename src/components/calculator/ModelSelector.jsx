import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import { CheckBoxOutlineBlank, CheckBox } from "@mui/icons-material";
import { useBoundStore } from "../../stores";

export default function ModelSelector({ modelName, setModelName }) {
  const models = useBoundStore((s) => s.models);
  const setModel = useBoundStore((s) => s.setModel);
  const runCalculation = useBoundStore((s) => s.runCalculation);
  const resetCalculation = useBoundStore((s) => s.resetCalculation);
  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const selectedModels = useBoundStore((s) => s.selectedModels);
  const toggleModelSelection = useBoundStore((s) => s.toggleModelSelection);
  const runComparison = useBoundStore((s) => s.runComparison);

  const flatModels = models.flatMap((g) =>
    g.items.map((m) => ({ label: m.name, group: g.name, raw: m }))
  );

  if (comparisonMode) {
    const selectedLabels = new Set(selectedModels.map((m) => m.name));
    const value = flatModels.filter((fm) => selectedLabels.has(fm.label));

    return (
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={flatModels}
        groupBy={(option) => option.group}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(o, v) => o.label === v.label}
        value={value}
        onChange={(_, newValue, reason) => {
          if (reason === "clear") {
            selectedModels.forEach((m) => toggleModelSelection(m));
            runComparison();
            return;
          }
          // Compute diff to figure out which model was toggled
          const newLabels = new Set(newValue.map((v) => v.label));
          const added = newValue.find((v) => !selectedLabels.has(v.label));
          const removed = [...selectedLabels].find((l) => !newLabels.has(l));
          if (added) toggleModelSelection(added.raw);
          if (removed) {
            const model = selectedModels.find((m) => m.name === removed);
            if (model) toggleModelSelection(model);
          }
          runComparison();
        }}
        renderOption={(props, option) => {
          const checked = selectedLabels.has(option.label);
          return (
            <Box
              component="li"
              {...props}
              key={option.label}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Checkbox
                icon={<CheckBoxOutlineBlank fontSize="small" />}
                checkedIcon={<CheckBox fontSize="small" />}
                checked={checked}
                sx={{ p: 0, mr: 0.5 }}
              />
              <Typography variant="body2" noWrap>
                {option.label}
              </Typography>
              {option.raw.retirementDate && (
                <Chip
                  label={`Retires ${option.raw.retirementDate}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ ml: "auto", flexShrink: 0 }}
                />
              )}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Models"
            placeholder={
              selectedModels.length === 0
                ? "Select models to compare..."
                : ""
            }
            helperText="Pick multiple Azure OpenAI models to compare token costs"
          />
        )}
        sx={{ mb: 2 }}
      />
    );
  }

  return (
    <Autocomplete
      options={flatModels}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(o, v) => o.label === v.label}
      onChange={(_, val) => {
        if (!val) {
          setModelName("");
          setModel(null);
          resetCalculation();
          return;
        }
        setModelName(val.label);
        setModel(val.raw);
        runCalculation();
      }}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={option.label}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Typography variant="body2" noWrap>
            {option.label}
          </Typography>
          {option.raw.retirementDate && (
            <Chip
              label={`Retires ${option.raw.retirementDate}`}
              size="small"
              color="warning"
              variant="outlined"
              sx={{ ml: "auto", flexShrink: 0 }}
            />
          )}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Model"
          placeholder="Search or choose a model..."
          required
          helperText="Pick the Azure OpenAI model variant to estimate tokens and cost"
        />
      )}
      value={flatModels.find((m) => m.label === modelName) || null}
      sx={{ mb: 2 }}
      clearOnEscape
    />
  );
}
