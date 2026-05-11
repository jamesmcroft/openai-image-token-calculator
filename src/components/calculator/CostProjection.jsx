import {
  Box,
  TextField,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useBoundStore } from "../../stores";

const currencyFormat = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

export default function CostProjection() {
  const totalCost = useBoundStore((s) => s.totalCost);
  const model = useBoundStore((s) => s.model);
  const requestsPerDay = useBoundStore((s) => s.requestsPerDay);
  const setRequestsPerDay = useBoundStore((s) => s.setRequestsPerDay);
  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const comparisonResults = useBoundStore((s) => s.comparisonResults);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Cost Projection
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
        Each request uses the full image set configured above.
      </Typography>

      <TextField
        label="Requests per day"
        type="number"
        size="small"
        value={requestsPerDay === 0 ? "" : requestsPerDay}
        onChange={(e) => setRequestsPerDay(e.target.value)}
        slotProps={{ htmlInput: { min: 0, step: 1 } }}
        sx={{ width: 180, mb: 2 }}
      />

      {comparisonMode ? (
        <ComparisonProjection
          comparisonResults={comparisonResults}
          requestsPerDay={requestsPerDay}
        />
      ) : (
        <SingleProjection
          totalCost={totalCost}
          model={model}
          requestsPerDay={requestsPerDay}
        />
      )}
    </Box>
  );
}

function SingleProjection({ totalCost, model, requestsPerDay }) {
  const unitCost = Number.parseFloat(totalCost ?? "0");
  const hasValidCost = Number.isFinite(unitCost) && unitCost > 0;

  if (requestsPerDay <= 0 || !hasValidCost) return null;

  const dailyCost = unitCost * requestsPerDay;
  const monthlyCost = dailyCost * 30;

  return (
    <>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small" aria-label="cost projection">
          <TableHead>
            <TableRow>
              <TableCell>Cost per request</TableCell>
              <TableCell align="right">Daily</TableCell>
              <TableCell align="right">Monthly (30 days)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{currencyFormat.format(unitCost)}</TableCell>
              <TableCell align="right">{currencyFormat.format(dailyCost)}</TableCell>
              <TableCell align="right">{currencyFormat.format(monthlyCost)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      {model?.comment && (
        <Alert severity="info" variant="outlined">
          This projection only covers the calculated token costs and may not
          reflect full API costs. {model.comment}
        </Alert>
      )}
    </>
  );
}

function ComparisonProjection({ comparisonResults, requestsPerDay }) {
  if (requestsPerDay <= 0 || !comparisonResults?.length) return null;

  const hasComments = comparisonResults.some((r) => r.model?.comment);

  return (
    <>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small" aria-label="cost projection comparison">
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell align="right">Cost per request</TableCell>
              <TableCell align="right">Daily</TableCell>
              <TableCell align="right">Monthly (30 days)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonResults.map((r) => {
              const unitCost = Number.parseFloat(r.totalCost ?? "0");
              const valid = Number.isFinite(unitCost);
              const daily = valid ? unitCost * requestsPerDay : 0;
              const monthly = daily * 30;

              return (
                <TableRow key={r.model?.name}>
                  <TableCell>{r.model?.name ?? "Unknown"}</TableCell>
                  <TableCell align="right">
                    {valid ? currencyFormat.format(unitCost) : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {valid ? currencyFormat.format(daily) : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {valid ? currencyFormat.format(monthly) : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {hasComments && (
        <Alert severity="info" variant="outlined">
          Some models in this comparison only cover calculated token costs and
          may not reflect full API costs.
        </Alert>
      )}
    </>
  );
}
