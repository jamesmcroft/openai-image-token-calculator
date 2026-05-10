import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
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
  const sortOrder = useBoundStore((s) => s.comparisonSortOrder);
  const toggleSort = useBoundStore((s) => s.toggleComparisonSortOrder);

  if (comparisonResults.length === 0) return null;

  return (
    <Box id="results" sx={(theme) => ({ mt: 4, scrollMarginTop: `calc(${theme.spacing(10)})` })}>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h6">Comparison Results</Typography>
        <Typography variant="body2" color="text.secondary">
          Click the Estimated Cost header to toggle sort order. Click a row to
          see per-image details.
        </Typography>
      </Stack>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="model comparison results">
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell>Tokenization</TableCell>
              <TableCell align="right">Total Tokens</TableCell>
              <TableCell align="right" sortDirection={sortOrder}>
                <TableSortLabel
                  active
                  direction={sortOrder}
                  onClick={toggleSort}
                >
                  Estimated Cost
                </TableSortLabel>
              </TableCell>
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
