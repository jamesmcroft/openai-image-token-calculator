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
  const imageResults = useBoundStore((s) => s.imageResults);

  if (totalTokens === null) return null;

  const isPatch = model?.tokenizationType === "patch";

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
        {model?.retirementDate && (
          <Chip
            size="small"
            label={`Retires ${model.retirementDate}`}
            color="warning"
            variant="outlined"
          />
        )}
      </Stack>

      {isPatch ? (
        <PatchSummary
          model={model}
          imageResults={imageResults}
          totalTokens={totalTokens}
          currency={currency}
        />
      ) : (
        <TileSummary
          model={model}
          imageResults={imageResults}
          totalTokens={totalTokens}
          currency={currency}
        />
      )}

      {imageResults.map((img, i) =>
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
                    <TableCell>
                      {isPatch ? "Patches (per image)" : "Tiles (per image)"}
                    </TableCell>
                    <TableCell>
                      {isPatch ? "Total patches" : "Total tiles"}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {img.resizedHeight} &times; {img.resizedWidth}
                    </TableCell>
                    <TableCell>
                      {isPatch
                        ? `${img.tokenization?.patchesHigh ?? 0} \u00d7 ${img.tokenization?.patchesWide ?? 0}`
                        : `${img.tokenization?.tilesHigh ?? 0} \u00d7 ${img.tokenization?.tilesWide ?? 0}`}
                    </TableCell>
                    <TableCell>
                      {isPatch
                        ? img.tokenization?.totalPatches ?? 0
                        : img.tokenization?.totalTiles ?? 0}
                    </TableCell>
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

function TileSummary({ model, imageResults, totalTokens, currency }) {
  const totalTileTokens = totalTokens - (model?.baseTokens || 0);
  const totalTiles = imageResults
    .map((img) => img.tokenization?.totalTiles ?? 0)
    .reduce((acc, val) => acc + val, 0);

  return (
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
              {model?.tokensPerTile} &times; {totalTiles} = {totalTileTokens}
            </TableCell>
            <TableCell>{totalTokens}</TableCell>
            <TableCell>{currency}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function PatchSummary({ model, imageResults, totalTokens, currency }) {
  const totalPatches = imageResults
    .map((img) => img.tokenization?.totalPatches ?? 0)
    .reduce((acc, val) => acc + val, 0);

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
      <Table size="small" aria-label="summary table">
        <TableHead>
          <TableRow>
            <TableCell>Total patches</TableCell>
            <TableCell>Token multiplier</TableCell>
            <TableCell>Total tokens</TableCell>
            <TableCell>Total price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{totalPatches}</TableCell>
            <TableCell>&times;{model?.tokenMultiplier}</TableCell>
            <TableCell>{totalTokens}</TableCell>
            <TableCell>{currency}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
