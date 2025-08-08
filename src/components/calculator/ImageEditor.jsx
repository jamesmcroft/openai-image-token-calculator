import {
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Stack,
} from "@mui/material";
import { Add, Delete, FileCopy } from "@mui/icons-material";
import { useBoundStore } from "../../stores";
import { useMemo, useState } from "react";

export default function ImageEditor() {
  const images = useBoundStore((s) => s.images);
  const presets = useBoundStore((s) => s.presets);
  const addImage = useBoundStore((s) => s.addImage);
  const updateImage = useBoundStore((s) => s.updateImage);
  const removeImage = useBoundStore((s) => s.removeImage);
  const runCalculation = useBoundStore((s) => s.runCalculation);

  const presetOptions = presets.flatMap((g) =>
    g.items.map((p) => ({
      label: `${p.name}  (${p.height} × ${p.width})`,
      group: g.name,
      ...p,
    }))
  );

  // Include the Custom option in both options and value lookup
  const allPresetOptions = useMemo(
    () => [{ label: "Custom" }, ...presetOptions],
    [presetOptions]
  );

  // Control the input text so selecting a value (like "Custom") doesn't filter out other options
  const [inputValues, setInputValues] = useState({});

  const syncCalculation = () => runCalculation();

  return (
    <Stack spacing={2}>
      {images.map((image, idx) => (
        <Card key={idx} variant="outlined" sx={{ position: "relative" }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Image {idx + 1}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                <Autocomplete
                  options={allPresetOptions}
                  groupBy={(o) => o.group || ""}
                  getOptionLabel={(o) => o.label}
                  isOptionEqualToValue={(o, v) => o.label === v.label}
                  value={
                    allPresetOptions.find((p) => p.label === image.preset) ||
                    (image.preset ? { label: image.preset } : null)
                  }
                  inputValue={inputValues[idx] ?? ""}
                  onInputChange={(_, newInput) =>
                    setInputValues((s) => ({ ...s, [idx]: newInput }))
                  }
                  onOpen={() => setInputValues((s) => ({ ...s, [idx]: "" }))}
                  onChange={(_, val) => {
                    // Clear the input text so the dropdown shows all options next time
                    setInputValues((s) => ({ ...s, [idx]: "" }));

                    if (!val || val.label === "Custom") {
                      updateImage(idx, "preset", "Custom");
                      syncCalculation();
                      return;
                    }
                    updateImage(idx, "preset", val.label);
                    updateImage(idx, "height", val.height);
                    updateImage(idx, "width", val.width);
                    syncCalculation();
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Preset" required />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Height (px)"
                  type="number"
                  fullWidth
                  value={image.height}
                  onChange={(e) => {
                    const newHeight = +e.target.value;
                    const newWidth = image.width;
                    const match = presetOptions.find(
                      (p) => p.height === newHeight && p.width === newWidth
                    );
                    updateImage(idx, "height", newHeight);
                    updateImage(idx, "preset", match ? match.label : "Custom");
                    syncCalculation();
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Width (px)"
                  type="number"
                  fullWidth
                  value={image.width}
                  onChange={(e) => {
                    const newWidth = +e.target.value;
                    const newHeight = image.height;
                    const match = presetOptions.find(
                      (p) => p.height === newHeight && p.width === newWidth
                    );
                    updateImage(idx, "width", newWidth);
                    updateImage(idx, "preset", match ? match.label : "Custom");
                    syncCalculation();
                  }}
                />
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Count"
                  type="number"
                  fullWidth
                  value={image.multiplier}
                  onChange={(e) => {
                    updateImage(idx, "multiplier", +e.target.value);
                    syncCalculation();
                  }}
                />
              </Grid>

              <Grid
                size={{ xs: 6, md: 3 }}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <IconButton
                  color="primary"
                  onClick={() => {
                    addImage({ ...image });
                    syncCalculation();
                  }}
                >
                  <FileCopy fontSize="small" />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => {
                    removeImage(idx);
                    syncCalculation();
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{ alignSelf: "flex-start" }}
        onClick={() => {
          addImage({ height: 0, width: 0, multiplier: 1, preset: "Custom" });
          syncCalculation();
        }}
      >
        Add Image
      </Button>
    </Stack>
  );
}
