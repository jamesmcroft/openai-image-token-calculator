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
} from "@mui/material";
import { useBoundStore } from "../../stores";

export default function CalculatorOutput() {
  const totalTokens = useBoundStore((s) => s.totalTokens);
  const totalCost = useBoundStore((s) => s.totalCost);
  const model = useBoundStore((s) => s.model);
  const images = useBoundStore((s) => s.images);

  if (totalTokens === null) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Result
      </Typography>
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
                {model.tokensPerTile} x{" "}
                {images
                  .map((image) => image.totalTiles ?? 0)
                  .reduce((acc, val) => acc + val, 0)}{" "}
                = {totalTokens - (model?.baseTokens || 0)}
              </TableCell>
              <TableCell>{totalTokens}</TableCell>
              <TableCell>$ {totalCost}</TableCell>
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
              <Table size="small">
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
