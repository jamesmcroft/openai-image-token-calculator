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
                  options={[{ label: "Custom" }, ...presetOptions]}
                  groupBy={(o) => o.group || ""}
                  getOptionLabel={(o) => o.label}
                  isOptionEqualToValue={(o, v) => o.label === v.label}
                  value={
                    presetOptions.find((p) => p.label === image.preset) || null
                  }
                  onChange={(_, val) => {
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
                    updateImage(idx, "height", +e.target.value);
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
                    updateImage(idx, "width", +e.target.value);
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
