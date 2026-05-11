import { Box, Typography } from "@mui/material";
import MetricValue from "../atoms/MetricValue";

export default function HeroMetric({ value, type = "number", label, badge, sx }) {
  return (
    <Box sx={{ textAlign: "center", ...sx }}>
      <MetricValue value={value} type={type} />
      <Typography variant="metricLabel" color="text.secondary" sx={{ mt: 0.25 }}>
        {label}
      </Typography>
      {badge && <Box sx={{ mt: 0.5 }}>{badge}</Box>}
    </Box>
  );
}
