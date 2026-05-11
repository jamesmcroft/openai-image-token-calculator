import { useState, useEffect } from "react";
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
  Collapse,
  IconButton,
} from "@mui/material";
import {
  BarChartOutlined,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useBoundStore } from "../../stores";
import ModelComment from "./comparison/ModelComment";
import CopyResultsButton from "./CopyResultsButton";
import { formatResultsAsText, formatResultsAsTsv } from "../../utils/formatResults";

export default function CalculatorOutput() {
  const totalTokens = useBoundStore((s) => s.totalTokens);
  const totalCost = useBoundStore((s) => s.totalCost);
  const model = useBoundStore((s) => s.model);
  const images = useBoundStore((s) => s.images);
  const imageResults = useBoundStore((s) => s.imageResults);

  const copyFormats = {
    text: () =>
      formatResultsAsText({ model, images, imageResults, totalTokens, totalCost }),
    table: () =>
      formatResultsAsTsv({ model, images, imageResults, totalTokens, totalCost }),
  };

  if (totalTokens === null) {
    return (
      <Box sx={{ mt: 4, textAlign: "center", py: 6, opacity: 0.5 }}>
        <BarChartOutlined sx={{ fontSize: 48, mb: 1, color: "text.secondary" }} />
        <Typography variant="body2" color="text.secondary">
          Select a model and add images to see results
        </Typography>
      </Box>
    );
  }

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
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, flexWrap: "wrap" }}>
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
          <ModelComment comment={model?.comment} />
        </Stack>
        <CopyResultsButton formats={copyFormats} />
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        Results update as you change inputs
      </Typography>

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

      <ImageBreakdownList imageResults={imageResults} isPatch={isPatch} />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Per-image breakdown with collapsible rows
// ---------------------------------------------------------------------------

function ImageBreakdownList({ imageResults, isPatch }) {
  const validResults = imageResults
    .map((img, i) => ({ img, idx: i }))
    .filter(({ img }) => img.resizedHeight);

  const defaultCollapsed = validResults.length >= 3;
  const [collapsedSet, setCollapsedSet] = useState(() =>
    defaultCollapsed ? new Set(validResults.map(({ idx }) => idx)) : new Set()
  );

  // Reconcile when the set of valid images changes
  const validIndicesKey = validResults.map(({ idx }) => idx).join(",");
  useEffect(() => {
    const validIndices = validIndicesKey.split(",").filter(Boolean).map(Number);
    setCollapsedSet((prev) => {
      const validSet = new Set(validIndices);
      // Remove indices that no longer exist
      const pruned = new Set([...prev].filter((i) => validSet.has(i)));
      // If we crossed the 3+ threshold, collapse any new entries
      if (validIndices.length >= 3) {
        for (const idx of validIndices) {
          if (!pruned.has(idx) && !prev.has(idx)) {
            pruned.add(idx);
          }
        }
      }
      return pruned;
    });
  }, [validIndicesKey]);

  const toggle = (i) =>
    setCollapsedSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return validResults.map(({ img, idx }) => {
    const isCollapsed = collapsedSet.has(idx);
    const meta = `${img.resizedHeight} \u00d7 ${img.resizedWidth} \u2022 ${img.tokenization?.imageTokens ?? 0} tokens`;

    return (
      <Box key={idx} sx={{ mb: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          onClick={() => toggle(idx)}
          sx={{ cursor: "pointer", userSelect: "none", py: 0.5 }}
        >
          <IconButton size="small" aria-expanded={!isCollapsed} aria-label={`Toggle image ${idx + 1} details`}>
            {isCollapsed ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
          </IconButton>
          <Typography variant="subtitle2">Image {idx + 1}</Typography>
          {isCollapsed && (
            <Typography variant="caption" color="text.secondary">
              {meta}
            </Typography>
          )}
        </Stack>
        <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small" aria-label={`image ${idx + 1} breakdown`}>
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
        </Collapse>
      </Box>
    );
  });
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
