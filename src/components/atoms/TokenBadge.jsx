import { Chip } from "@mui/material";

export default function TokenBadge({ type, sx }) {
  const label = type === "patch" ? "Patch" : "Tile";
  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      color={type === "patch" ? "secondary" : "primary"}
      sx={{ fontWeight: 600, fontSize: "0.7rem", ...sx }}
    />
  );
}
