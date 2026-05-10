import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
} from "@mui/material";
import { useBoundStore } from "../../../stores";
import ComparisonRow from "./ComparisonRow";

export default function ComparisonTable() {
  const comparisonResults = useBoundStore((s) => s.comparisonResults);
  const expandedModelName = useBoundStore((s) => s.expandedModelName);
  const setExpandedModel = useBoundStore((s) => s.setExpandedModel);

  if (comparisonResults.length === 0) return null;

  return (
    <Box id="results" sx={(theme) => ({ mt: 4, scrollMarginTop: `calc(${theme.spacing(10)})` })}>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6">Comparison Results</Typography>
        <Typography variant="body2" color="text.secondary">
          Sorted by estimated cost (cheapest first). Click a row to see
          per-image details.
        </Typography>
      </Stack>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="model comparison results">
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell>Tokenization</TableCell>
              <TableCell align="right">Total Tokens</TableCell>
              <TableCell align="right">Estimated Cost</TableCell>
              <TableCell>Retirement</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonResults.map((result) => (
              <ComparisonRow
                key={result.model.name}
                result={result}
                isExpanded={expandedModelName === result.model.name}
                onToggle={() => setExpandedModel(result.model.name)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
