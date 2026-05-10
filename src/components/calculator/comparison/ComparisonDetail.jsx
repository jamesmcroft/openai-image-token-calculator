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
} from "@mui/material";

export default function ComparisonDetail({ result }) {
  if (!result?.imageResults?.length) return null;

  const isPatch = result.model?.tokenizationType === "patch";

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Per-image breakdown for {result.model.name}
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="per-image breakdown">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Resized Size</TableCell>
              <TableCell>{isPatch ? "Patches" : "Tiles"}</TableCell>
              <TableCell>Tokens</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.imageResults.map((img, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  {img.resizedHeight} &times; {img.resizedWidth}
                </TableCell>
                <TableCell>
                  {isPatch
                    ? img.tokenization?.totalPatches ?? 0
                    : img.tokenization?.totalTiles ?? 0}
                </TableCell>
                <TableCell>{img.tokenization?.imageTokens ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
