import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { useBoundStore } from "../../stores";

export default function CalculatorOutput() {
  const totalTokens = useBoundStore((s) => s.totalTokens);
  const totalCost = useBoundStore((s) => s.totalCost);
  const model = useBoundStore((s) => s.model);
  const images = useBoundStore((s) => s.images);

  if (totalTokens === null) return null;

  const currency = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  }).format(Number(totalCost));

  return (
    <Box
      id="results"
      sx={(theme) => ({ mt: 4, scrollMarginTop: `calc(${theme.spacing(10)})` })}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h6">Result</Typography>
        {model?.name && <Chip size="small" label={model.name} />}
      </Stack>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small" aria-label="summary table">
          <TableHead>
            <TableRow>
              <TableCell>Base tokens</TableCell>
              <TableCell>Tile tokens</TableCell>
              <TableCell>Total tokens</TableCell>
              <TableCell>Total price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{model?.baseTokens}</TableCell>
              <TableCell>
                {model.tokensPerTile} ×{" "}
                {images
                  .map((image) => image.totalTiles ?? 0)
                  .reduce((acc, val) => acc + val, 0)}{" "}
                = {totalTokens - (model?.baseTokens || 0)}
              </TableCell>
              <TableCell>{totalTokens}</TableCell>
              <TableCell>{currency}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {images.map((img, i) =>
        img.resizedHeight ? (
          <Box key={i} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Image {i + 1}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" aria-label={`image ${i + 1} breakdown`}>
                <TableHead>
                  <TableRow>
                    <TableCell>Resized Size</TableCell>
                    <TableCell>Tiles (per image)</TableCell>
                    <TableCell>Total tiles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {img.resizedHeight} × {img.resizedWidth}
                    </TableCell>
                    <TableCell>
                      {img.tilesHigh} × {img.tilesWide}
                    </TableCell>
                    <TableCell>{img.totalTiles}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : null
      )}
    </Box>
  );
}
