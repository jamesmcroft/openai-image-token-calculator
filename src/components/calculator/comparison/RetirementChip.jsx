import { Chip } from "@mui/material";

export default function RetirementChip({ date }) {
  if (!date) return null;
  return (
    <Chip
      label={`Retires ${date}`}
      size="small"
      color="warning"
      variant="outlined"
      sx={{ flexShrink: 0 }}
    />
  );
}
