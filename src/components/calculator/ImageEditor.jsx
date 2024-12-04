import React from "react";
import { TextField, IconButton, Grid2 as Grid, Button } from "@mui/material";
import { Add, Delete, FileCopy } from "@mui/icons-material";
import { useBoundStore } from "../../stores";

const ImageEditor = () => {
  const images = useBoundStore((state) => state.images);
  const addImage = useBoundStore((state) => state.addImage);
  const updateImage = useBoundStore((state) => state.updateImage);
  const removeImage = useBoundStore((state) => state.removeImage);

  const addNewImage = () => {
    addImage({ height: 0, width: 0, multiplier: 1 });
  };

  const cloneImage = (index) => {
    const image = images[index];
    addImage({
      height: image.height,
      width: image.width,
      multiplier: image.multiplier,
    });
  };

  return (
    <>
      {images.map((image, index) => (
        <Grid container spacing={1} alignItems="center" key={index}>
          <Grid size={{ sm: 4 }}>
            <TextField
              label="Image Height (px)"
              type="number"
              value={image.height}
              onChange={(e) => updateImage(index, "height", e.target.value)}
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
              onChange={(e) => updateImage(index, "width", e.target.value)}
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
              onChange={(e) => updateImage(index, "multiplier", e.target.value)}
              margin="normal"
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ sm: 1 }}>
            <IconButton onClick={() => cloneImage(index)} color="primary">
              <FileCopy />
            </IconButton>
          </Grid>
          <Grid size={{ sm: 1 }}>
            <IconButton onClick={() => removeImage(index)} color="secondary">
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
