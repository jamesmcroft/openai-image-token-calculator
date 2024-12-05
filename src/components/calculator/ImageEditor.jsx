import React from "react";
import {
  TextField,
  IconButton,
  Grid2 as Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
} from "@mui/material";
import { Add, Delete, FileCopy } from "@mui/icons-material";
import { useBoundStore } from "../../stores";

const ImageEditor = () => {
  const images = useBoundStore((state) => state.images);
  const addImage = useBoundStore((state) => state.addImage);
  const updateImage = useBoundStore((state) => state.updateImage);
  const removeImage = useBoundStore((state) => state.removeImage);
  const presets = useBoundStore((state) => state.presets);
  const runCalculation = useBoundStore((state) => state.runCalculation);

  const selectPreset = (preset, index) => {
    updateImage(index, "preset", preset);

    const selectedPreset = presets
      .flatMap((presetGroup) =>
        presetGroup.items.find((p) => p.name === preset)
      )
      .filter(Boolean)[0];

    if (selectedPreset) {
      updateImage(index, "height", selectedPreset.height);
      updateImage(index, "width", selectedPreset.width);
    }

    runCalculation();
  };

  const addNewImage = () => {
    addImage({ height: 0, width: 0, multiplier: 1, preset: "Custom" });

    runCalculation();
  };

  const updateExistingImage = (index, field, value) => {
    updateImage(index, field, value);

    const image = images[index];

    const selectedPreset = presets
      .flatMap((presetGroup) =>
        presetGroup.items.find(
          (p) => p.height == image.height && p.width == image.width
        )
      )
      .filter(Boolean)[0];

    if (selectedPreset) {
      updateImage(index, "preset", selectedPreset.name);
    } else {
      updateImage(index, "preset", "Custom");
    }

    runCalculation();
  };

  const cloneExistingImage = (index) => {
    const image = images[index];
    addImage({
      height: image.height,
      width: image.width,
      multiplier: image.multiplier,
      preset: image.preset,
    });

    runCalculation();
  };

  const removeExistingImage = (index) => {
    removeImage(index);

    runCalculation();
  };

  return (
    <>
      {images.map((image, index) => (
        <Grid container spacing={1} alignItems="center" key={index}>
          <FormControl fullWidth margin="normal">
            <InputLabel id={`image-preset-${index}`}>Preset</InputLabel>
            <Select
              labelId={`image-preset-${index}`}
              value={image.preset}
              onChange={(e) => selectPreset(e.target.value, index)}
              label="Preset"
            >
              <MenuItem value="Custom">
                <em>Custom</em>
              </MenuItem>
              {presets.flatMap((presetGroup) => [
                <ListSubheader key={`subheader-${presetGroup.name}`}>
                  {presetGroup.name}
                </ListSubheader>,
                ...presetGroup.items.map((preset) => (
                  <MenuItem key={preset.name} value={preset.name}>
                    <Grid container spacing={1} alignItems="center">
                      {preset.name}
                      <div style={{ fontSize: "0.8em", fontStyle: "italic" }}>
                        ({preset.height} x {preset.width})
                      </div>
                    </Grid>
                  </MenuItem>
                )),
              ])}
            </Select>
          </FormControl>

          <Grid size={{ sm: 4 }}>
            <TextField
              label="Image Height (px)"
              type="number"
              value={image.height}
              onChange={(e) =>
                updateExistingImage(index, "height", e.target.value)
              }
              margin="normal"
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ sm: 4 }}>
            <TextField
              label="Image Width (px)"
              type="number"
              value={image.width}
              onChange={(e) =>
                updateExistingImage(index, "width", e.target.value)
              }
              margin="normal"
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ sm: 2 }}>
            <TextField
              label="Count"
              type="number"
              value={image.multiplier}
              onChange={(e) =>
                updateExistingImage(index, "multiplier", e.target.value)
              }
              margin="normal"
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ sm: 1 }}>
            <IconButton
              onClick={() => cloneExistingImage(index)}
              color="primary"
            >
              <FileCopy />
            </IconButton>
          </Grid>
          <Grid size={{ sm: 1 }}>
            <IconButton
              onClick={() => removeExistingImage(index)}
              color="secondary"
            >
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Button
        onClick={addNewImage}
        variant="contained"
        color="info"
        style={{ marginBottom: "20px" }}
        fullWidth
      >
        <Add /> Add Image
      </Button>
    </>
  );
};

export default ImageEditor;
