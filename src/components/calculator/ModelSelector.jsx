import { Autocomplete, TextField, Stack, Chip } from "@mui/material";
import { useBoundStore } from "../../stores";

export default function ModelSelector({ modelName, setModelName }) {
  const models = useBoundStore((s) => s.models);
  const setModel = useBoundStore((s) => s.setModel);
  const runCalculation = useBoundStore((s) => s.runCalculation);
  const resetCalculation = useBoundStore((s) => s.resetCalculation);

  const flatModels = models.flatMap((g) =>
    g.items.map((m) => ({ label: m.name, group: g.name, raw: m }))
  );

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
      renderInput={(params) => <TextField {...params} label="Model" required />}
      value={flatModels.find((m) => m.label === modelName) || null}
      sx={{ mb: 2 }}
    />
  );
}
