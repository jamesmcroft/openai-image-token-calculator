import { Chip } from "@mui/material";

export default function FilterChip({ label, selected, onClick, sx }) {
  return (
    <Chip
      label={label}
      size="small"
      variant={selected ? "filled" : "outlined"}
      color={selected ? "primary" : "default"}
      onClick={onClick}
      clickable
      sx={{
        fontWeight: 500,
        transition: "all 0.15s ease",
        ...sx,
      }}
    />
  );
}
