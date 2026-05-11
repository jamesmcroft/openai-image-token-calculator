import { useMemo } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Add, DeleteSweep } from "@mui/icons-material";
import { useBoundStore } from "../../stores";
import ImageRow from "../molecules/ImageRow";

export default function ImageList() {
  const images = useBoundStore((s) => s.images);
  const presets = useBoundStore((s) => s.presets);
  const addImage = useBoundStore((s) => s.addImage);
  const updateImage = useBoundStore((s) => s.updateImage);
  const removeImage = useBoundStore((s) => s.removeImage);
  const clearImages = useBoundStore((s) => s.clearImages);
  const runCalculation = useBoundStore((s) => s.runCalculation);
  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const runComparison = useBoundStore((s) => s.runComparison);

  const presetOptions = useMemo(
    () =>
      presets.flatMap((g) =>
        g.items.map((p) => ({
          label: `${p.name}  (${p.height} \u00d7 ${p.width})`,
          group: g.name,
          ...p,
        })),
      ),
    [presets],
  );

  const allPresetOptions = useMemo(
    () => [{ label: "Custom" }, ...presetOptions],
    [presetOptions],
  );

  const sync = () => {
    if (comparisonMode) runComparison();
    else runCalculation();
  };

  const handleAdd = () => {
    addImage({ height: 0, width: 0, multiplier: 1, preset: "Custom" });
    sync();
  };

  const handleUpdate = (idx, field, value) => {
    updateImage(idx, field, value);
    sync();
  };

  const handleRemove = (idx) => {
    removeImage(idx);
    sync();
  };

  const handleDuplicate = (idx) => {
    addImage({ ...images[idx] });
    sync();
  };

  const handleClearAll = () => {
    clearImages();
    sync();
  };

  return (
    <Box>
      {/* Toolbar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Button
          size="small"
          startIcon={<Add />}
          variant="contained"
          onClick={handleAdd}
        >
          Add Image
        </Button>
        {images.length > 1 && (
          <Button
            size="small"
            startIcon={<DeleteSweep />}
            color="error"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        )}
      </Stack>

      {images.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4, opacity: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Add an image to start calculating tokens
          </Typography>
        </Box>
      )}

      {/* Image rows */}
      <Stack spacing={1}>
        {images.map((image, idx) => (
          <ImageRow
            key={idx}
            image={image}
            index={idx}
            presetOptions={presetOptions}
            allPresetOptions={allPresetOptions}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            onDuplicate={handleDuplicate}
          />
        ))}
      </Stack>
    </Box>
  );
}
