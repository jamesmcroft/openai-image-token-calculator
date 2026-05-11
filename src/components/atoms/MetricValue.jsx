import { Typography, Box } from "@mui/material";

const numberFormat = new Intl.NumberFormat();
const currencyFormat = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

export default function MetricValue({ value, type = "number", sx }) {
  const formatted =
    type === "currency"
      ? currencyFormat.format(Number(value ?? 0))
      : numberFormat.format(value ?? 0);

  return (
    <Box sx={sx}>
      <Typography
        variant="metric"
        component="span"
        sx={{ fontFeatureSettings: '"tnum"' }}
      >
        {formatted}
      </Typography>
    </Box>
  );
}
