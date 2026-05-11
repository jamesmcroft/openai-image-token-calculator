import {
  Stack,
  TextField,
  IconButton,
  Tooltip,
  Autocomplete,
  Typography,
  Collapse,
  Box,
} from "@mui/material";
import { Delete, FileCopy, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useState } from "react";

export default function ImageRow({
  image,
  index,
  presetOptions,
  allPresetOptions,
  onUpdate,
  onRemove,
  onDuplicate,
}) {
  const [inputValue, setInputValue] = useState("");
  const [expanded, setExpanded] = useState(true);

  const meta = `${image.multiplier || 1}x \u00b7 ${image.height || 0}\u00d7${image.width || 0}`;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        transition: "border-color 0.15s ease",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      {/* Header row - always visible */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{ px: 1.5, py: 0.75, minHeight: 40 }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ mr: 1, flexShrink: 0 }}
        >
          Image {index + 1}
        </Typography>
        {!expanded && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
            {meta}
          </Typography>
        )}
        {expanded && <Box sx={{ flex: 1 }} />}
        <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
          <Tooltip title="Duplicate">
            <IconButton
              size="small"
              onClick={() => onDuplicate(index)}
              aria-label={`Duplicate image ${index + 1}`}
            >
              <FileCopy fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(index)}
              aria-label={`Remove image ${index + 1}`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
          >
            {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
        </Stack>
      </Stack>

      {/* Editable fields */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ px: 1.5, pb: 1.5 }}
          alignItems={{ sm: "flex-start" }}
        >
          {/* Preset */}
          <Autocomplete
            options={allPresetOptions}
            groupBy={(o) => o.group || ""}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.label === v.label}
            value={
              allPresetOptions.find((p) => p.label === image.preset) ||
              (image.preset ? { label: image.preset } : null)
            }
            inputValue={inputValue}
            onInputChange={(_, v) => setInputValue(v)}
            onOpen={() => setInputValue("")}
            onChange={(_, val) => {
              setInputValue("");
              if (!val || val.label === "Custom") {
                onUpdate(index, "preset", "Custom");
                return;
              }
              onUpdate(index, "preset", val.label);
              onUpdate(index, "height", val.height);
              onUpdate(index, "width", val.width);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Preset" placeholder="Size preset" />
            )}
            sx={{ flex: 2, minWidth: 160 }}
          />

          {/* Height */}
          <TextField
            label="Height"
            type="number"
            value={image.height}
            slotProps={{ input: { inputProps: { min: 0, step: 1 }, endAdornment: <Typography variant="caption" color="text.secondary">px</Typography> } }}
            onChange={(e) => {
              const h = +e.target.value;
              const match = presetOptions.find((p) => p.height === h && p.width === image.width);
              onUpdate(index, "height", h);
              onUpdate(index, "preset", match ? match.label : "Custom");
            }}
            sx={{ flex: 1, minWidth: 90 }}
          />

          {/* Width */}
          <TextField
            label="Width"
            type="number"
            value={image.width}
            slotProps={{ input: { inputProps: { min: 0, step: 1 }, endAdornment: <Typography variant="caption" color="text.secondary">px</Typography> } }}
            onChange={(e) => {
              const w = +e.target.value;
              const match = presetOptions.find((p) => p.height === image.height && p.width === w);
              onUpdate(index, "width", w);
              onUpdate(index, "preset", match ? match.label : "Custom");
            }}
            sx={{ flex: 1, minWidth: 90 }}
          />

          {/* Quantity */}
          <TextField
            label="Qty"
            type="number"
            value={image.multiplier}
            slotProps={{ input: { inputProps: { min: 1, step: 1 } } }}
            onChange={(e) => onUpdate(index, "multiplier", +e.target.value)}
            sx={{ flex: 0.6, minWidth: 70 }}
          />
        </Stack>
      </Collapse>
    </Box>
  );
}
