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
import { CompareArrowsOutlined } from "@mui/icons-material";
import { useBoundStore } from "../../../stores";
import ComparisonRow from "./ComparisonRow";
import CopyResultsButton from "../CopyResultsButton";
import CostProjection from "../CostProjection";
import { formatComparisonAsText, formatComparisonAsTsv } from "../../../utils/formatResults";

export default function ComparisonTable() {
  const comparisonResults = useBoundStore((s) => s.comparisonResults);
  const images = useBoundStore((s) => s.images);
  const requestsPerDay = useBoundStore((s) => s.requestsPerDay);
  const expandedModelName = useBoundStore((s) => s.expandedModelName);
  const setExpandedModel = useBoundStore((s) => s.setExpandedModel);
  const sortOrder = useBoundStore((s) => s.comparisonSortOrder);
  const toggleSort = useBoundStore((s) => s.toggleComparisonSortOrder);

  const copyFormats = {
    text: () => formatComparisonAsText({ images, comparisonResults, requestsPerDay }),
    table: () => formatComparisonAsTsv({ comparisonResults, requestsPerDay }),
  };

  if (comparisonResults.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: "center", py: 6, opacity: 0.5 }}>
        <CompareArrowsOutlined sx={{ fontSize: 48, mb: 1, color: "text.secondary" }} />
        <Typography variant="body2" color="text.secondary">
          Select models and add images to compare results
        </Typography>
      </Box>
    );
  }

  return (
    <Box id="results" sx={(theme) => ({ mt: 4, scrollMarginTop: `calc(${theme.spacing(10)})` })}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>Comparison Results</Typography>
        <CopyResultsButton formats={copyFormats} />
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
        Click the Estimated Cost header to toggle sort order. Click a row to
        see per-image details.
      </Typography>
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
      <CostProjection />
    </Box>
  );
}
