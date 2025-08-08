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
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  Add,
  Delete,
  FileCopy,
  ExpandLess,
  ExpandMore,
  UnfoldLess,
  UnfoldMore,
  Visibility,
} from "@mui/icons-material";
import { useBoundStore } from "../../stores";
import { useMemo, useState, useRef } from "react";

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

  const allPresetOptions = useMemo(
    () => [{ label: "Custom" }, ...presetOptions],
    [presetOptions]
  );

  const [inputValues, setInputValues] = useState({});
  // Track collapsed cards by index
  const [collapsedSet, setCollapsedSet] = useState(new Set());

  // Focus-on-results coordination
  const focusingRef = useRef(false);
  const pendingCloseSetRef = useRef(new Set());

  const toggleCollapsed = (i) =>
    setCollapsedSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const collapseAll = () => setCollapsedSet(new Set(images.map((_, i) => i)));
  const expandAll = () => setCollapsedSet(new Set());
  const focusOnResults = () => {
    // Determine which panels are currently expanded and will close
    const willClose = images
      .map((_, i) => i)
      .filter((i) => !collapsedSet.has(i));

    if (willClose.length === 0) {
      const el = document.getElementById("results");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    focusingRef.current = true;
    pendingCloseSetRef.current = new Set(willClose);
    collapseAll();
  };

  const syncCalculation = () => runCalculation();

  return (
    <Stack spacing={2}>
      {/* Top toolbar: Add Image (left) and utilities (right) */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Button
          size="small"
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            addImage({ height: 0, width: 0, multiplier: 1, preset: "Custom" });
            syncCalculation();
          }}
        >
          Add Image
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={focusOnResults}
          >
            Focus on results
          </Button>
          <Button size="small" startIcon={<UnfoldMore />} onClick={expandAll}>
            Expand all
          </Button>
        </Stack>
      </Stack>

      {images.map((image, idx) => {
        const isCollapsed = collapsedSet.has(idx);
        const contentId = `image-${idx}-content`;
        const meta = `${image.multiplier || 1}x · ${image.height || 0}×${
          image.width || 0
        }`;
        return (
          <Card key={idx} variant="outlined" sx={{ position: "relative" }}>
            <CardContent>
              <Grid container>
                <Grid size={{ xs: 12 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      minWidth={0}
                    >
                      <Typography variant="subtitle1" noWrap>
                        Image {idx + 1}
                      </Typography>
                      {isCollapsed && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          title={meta}
                        >
                          {meta}
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Tooltip title="Duplicate image">
                        <IconButton
                          color="primary"
                          aria-label={`Duplicate image ${idx + 1}`}
                          onClick={() => {
                            addImage({ ...image });
                            syncCalculation();
                          }}
                          size="small"
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove image">
                        <IconButton
                          color="error"
                          aria-label={`Remove image ${idx + 1}`}
                          onClick={() => {
                            removeImage(idx);
                            setCollapsedSet((prev) => {
                              const next = new Set();
                              Array.from(prev).forEach((i) => {
                                if (i < idx) next.add(i);
                                else if (i > idx) next.add(i - 1);
                              });
                              return next;
                            });
                            syncCalculation();
                          }}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isCollapsed ? "Expand" : "Collapse"}>
                        <IconButton
                          aria-label={`${
                            isCollapsed ? "Expand" : "Collapse"
                          } image ${idx + 1}`}
                          aria-expanded={!isCollapsed}
                          aria-controls={contentId}
                          onClick={() => toggleCollapsed(idx)}
                          size="small"
                        >
                          {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12 }} id={contentId}>
                  <Collapse
                    in={!isCollapsed}
                    timeout="auto"
                    unmountOnExit
                    onExited={() => {
                      if (
                        focusingRef.current &&
                        pendingCloseSetRef.current.has(idx)
                      ) {
                        pendingCloseSetRef.current.delete(idx);
                        if (pendingCloseSetRef.current.size === 0) {
                          focusingRef.current = false;
                          requestAnimationFrame(() => {
                            const el = document.getElementById("results");
                            if (el)
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          });
                        }
                      }
                    }}
                  >
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                      <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                        {/* Preset */}
                        <Autocomplete
                          options={allPresetOptions}
                          groupBy={(o) => o.group || ""}
                          getOptionLabel={(o) => o.label}
                          isOptionEqualToValue={(o, v) => o.label === v.label}
                          value={
                            allPresetOptions.find(
                              (p) => p.label === image.preset
                            ) || (image.preset ? { label: image.preset } : null)
                          }
                          inputValue={inputValues[idx] ?? ""}
                          onInputChange={(_, newInput) =>
                            setInputValues((s) => ({ ...s, [idx]: newInput }))
                          }
                          onOpen={() =>
                            setInputValues((s) => ({ ...s, [idx]: "" }))
                          }
                          onChange={(_, val) => {
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
                            <TextField
                              {...params}
                              label="Preset"
                              required
                              placeholder="Select a preset or choose Custom"
                              helperText="Common print and web sizes"
                            />
                          )}
                        />
                      </Grid>

                      <Grid size={{ xs: 6, md: 3 }}>
                        {/* Height */}
                        <TextField
                          label="Height (px)"
                          type="number"
                          value={image.height}
                          slotProps={{
                            input: {
                              inputProps: {
                                min: 0,
                                step: 1,
                              },
                            },
                          }}
                          onChange={(e) => {
                            const newHeight = +e.target.value;
                            const newWidth = image.width;
                            const match = presetOptions.find(
                              (p) =>
                                p.height === newHeight && p.width === newWidth
                            );
                            updateImage(idx, "height", newHeight);
                            updateImage(
                              idx,
                              "preset",
                              match ? match.label : "Custom"
                            );
                            syncCalculation();
                          }}
                          fullWidth
                        />
                      </Grid>

                      <Grid size={{ xs: 6, md: 3 }}>
                        {/* Width */}
                        <TextField
                          label="Width (px)"
                          type="number"
                          value={image.width}
                          slotProps={{
                            input: {
                              inputProps: {
                                min: 0,
                                step: 1,
                              },
                            },
                          }}
                          onChange={(e) => {
                            const newWidth = +e.target.value;
                            const newHeight = image.height;
                            const match = presetOptions.find(
                              (p) =>
                                p.height === newHeight && p.width === newWidth
                            );
                            updateImage(idx, "width", newWidth);
                            updateImage(
                              idx,
                              "preset",
                              match ? match.label : "Custom"
                            );
                            syncCalculation();
                          }}
                          fullWidth
                        />
                      </Grid>

                      <Grid size={{ xs: 6, md: 3 }}>
                        {/* Count */}
                        <TextField
                          label="Quantity"
                          type="number"
                          value={image.multiplier}
                          slotProps={{
                            input: {
                              inputProps: {
                                min: 1,
                                step: 1,
                              },
                            },
                          }}
                          onChange={(e) => {
                            updateImage(idx, "multiplier", +e.target.value);
                            syncCalculation();
                          }}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Collapse>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
