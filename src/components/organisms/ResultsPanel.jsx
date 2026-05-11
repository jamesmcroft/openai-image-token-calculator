import {
  Box,
  Stack,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  Collapse,
  IconButton,
  Alert,
} from "@mui/material";
import {
  BarChartOutlined,
  CompareArrowsOutlined,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useBoundStore } from "../../stores";
import HeroMetric from "../molecules/HeroMetric";
import ActionBar from "../molecules/ActionBar";
import TokenBadge from "../atoms/TokenBadge";
import ModelComment from "../calculator/comparison/ModelComment";
import RetirementChip from "../calculator/comparison/RetirementChip";
import ComparisonRow from "../calculator/comparison/ComparisonRow";
import {
  formatResultsAsText,
  formatResultsAsTsv,
  formatComparisonAsText,
  formatComparisonAsTsv,
} from "../../utils/formatResults";
import { useState, useEffect } from "react";

const currencyFmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

export default function ResultsPanel({ onOpenExplanation }) {
  const totalTokens = useBoundStore((s) => s.totalTokens);
  const totalCost = useBoundStore((s) => s.totalCost);
  const model = useBoundStore((s) => s.model);
  const images = useBoundStore((s) => s.images);
  const imageResults = useBoundStore((s) => s.imageResults);
  const requestsPerDay = useBoundStore((s) => s.requestsPerDay);
  const setRequestsPerDay = useBoundStore((s) => s.setRequestsPerDay);
  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const comparisonResults = useBoundStore((s) => s.comparisonResults);
  const expandedModelName = useBoundStore((s) => s.expandedModelName);
  const setExpandedModel = useBoundStore((s) => s.setExpandedModel);
  const sortOrder = useBoundStore((s) => s.comparisonSortOrder);
  const toggleSort = useBoundStore((s) => s.toggleComparisonSortOrder);

  if (comparisonMode) {
    return (
      <ComparisonResults
        comparisonResults={comparisonResults}
        images={images}
        requestsPerDay={requestsPerDay}
        setRequestsPerDay={setRequestsPerDay}
        expandedModelName={expandedModelName}
        setExpandedModel={setExpandedModel}
        sortOrder={sortOrder}
        toggleSort={toggleSort}
        onOpenExplanation={onOpenExplanation}
      />
    );
  }

  return (
    <SingleResults
      totalTokens={totalTokens}
      totalCost={totalCost}
      model={model}
      images={images}
      imageResults={imageResults}
      requestsPerDay={requestsPerDay}
      setRequestsPerDay={setRequestsPerDay}
      onOpenExplanation={onOpenExplanation}
    />
  );
}

function SingleResults({
  totalTokens,
  totalCost,
  model,
  images,
  imageResults,
  requestsPerDay,
  setRequestsPerDay,
  onOpenExplanation,
}) {
  const copyFormats =
    totalTokens !== null
      ? {
          text: () =>
            formatResultsAsText({ model, images, imageResults, totalTokens, totalCost, requestsPerDay }),
          table: () =>
            formatResultsAsTsv({ model, images, imageResults, totalTokens, totalCost, requestsPerDay }),
        }
      : null;

  if (totalTokens === null) {
    return (
      <EmptyResults
        icon={<BarChartOutlined sx={{ fontSize: 48, color: "text.secondary" }} />}
        message="Select a model and add images to see results"
        onOpenExplanation={onOpenExplanation}
      />
    );
  }

  const isPatch = model?.tokenizationType === "patch";

  return (
    <Box id="results">
      {/* Hero metrics */}
      <Box
        sx={(theme) => ({
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, rgba(58,160,255,0.16) 0%, rgba(43,195,232,0.12) 100%)`
              : `linear-gradient(135deg, rgba(15,108,189,0.06) 0%, rgba(0,188,242,0.04) 100%)`,
          borderRadius: 1,
          p: 2.5,
          mb: 2,
        })}
      >
        <Stack direction="row" justifyContent="stretch" alignItems="flex-start" sx={{ width: "100%" }}>
          <HeroMetric value={totalTokens} label="Total Tokens" sx={{ flex: 1 }} />
          <HeroMetric value={totalCost} type="currency" label="Estimated Cost" sx={{ flex: 1 }} />
        </Stack>
        {model?.name && (
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
            <Chip size="small" label={model.name} />
            <TokenBadge type={model.tokenizationType ?? "tile"} />
            <ModelComment comment={model.comment} />
            <RetirementChip date={model.retirementDate} />
          </Stack>
        )}
      </Box>

      {/* Actions */}
      <ActionBar copyFormats={copyFormats} linkUrl={undefined} sx={{ mb: 2 }} />

      {/* Summary table */}
      {isPatch ? (
        <PatchSummary model={model} imageResults={imageResults} totalTokens={totalTokens} />
      ) : (
        <TileSummary model={model} imageResults={imageResults} totalTokens={totalTokens} />
      )}

      {/* Per-image breakdown */}
      <ImageBreakdownList imageResults={imageResults} isPatch={isPatch} />

      {/* Cost projection */}
      <Divider sx={{ my: 2 }} />
      <CostProjectionSection
        totalCost={totalCost}
        model={model}
        requestsPerDay={requestsPerDay}
        setRequestsPerDay={setRequestsPerDay}
      />

      {/* Explanation link */}
      {onOpenExplanation && (
        <Typography
          variant="caption"
          color="primary"
          onClick={onOpenExplanation}
          sx={{ cursor: "pointer", mt: 2, display: "block", textAlign: "center", "&:hover": { textDecoration: "underline" } }}
        >
          How does this calculation work?
        </Typography>
      )}
    </Box>
  );
}

function ComparisonResults({
  comparisonResults,
  images,
  requestsPerDay,
  setRequestsPerDay,
  expandedModelName,
  setExpandedModel,
  sortOrder,
  toggleSort,
  onOpenExplanation,
}) {
  const copyFormats =
    comparisonResults.length > 0
      ? {
          text: () => formatComparisonAsText({ images, comparisonResults, requestsPerDay }),
          table: () => formatComparisonAsTsv({ comparisonResults, requestsPerDay }),
        }
      : null;

  if (comparisonResults.length === 0) {
    return (
      <EmptyResults
        icon={<CompareArrowsOutlined sx={{ fontSize: 48, color: "text.secondary" }} />}
        message="Select models and add images to compare results"
        onOpenExplanation={onOpenExplanation}
      />
    );
  }

  const cheapest = comparisonResults.reduce((min, r) =>
    Number(r.totalCost) < Number(min.totalCost) ? r : min,
  );

  return (
    <Box id="results">
      {/* Hero: cheapest model */}
      <Box
        sx={(theme) => ({
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, rgba(58,160,255,0.16) 0%, rgba(43,195,232,0.12) 100%)`
              : `linear-gradient(135deg, rgba(15,108,189,0.06) 0%, rgba(0,188,242,0.04) 100%)`,
          borderRadius: 1,
          p: 2.5,
          mb: 2,
        })}
      >
        <Typography variant="metricLabel" color="text.secondary" sx={{ mb: 0.5, textAlign: "center", display: "block" }}>
          Lowest Cost
        </Typography>
        <Stack direction="row" justifyContent="stretch" alignItems="flex-start" sx={{ width: "100%" }}>
          <HeroMetric value={cheapest.totalTokens} label="Tokens" sx={{ flex: 1 }} />
          <HeroMetric value={cheapest.totalCost} type="currency" label="Cost" sx={{ flex: 1 }} />
        </Stack>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
          <Chip size="small" label={cheapest.model.name} color="success" variant="outlined" />
        </Stack>
      </Box>

      <ActionBar copyFormats={copyFormats} linkUrl={undefined} sx={{ mb: 2 }} />

      {/* Comparison table */}
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small" aria-label="model comparison results">
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Tokens</TableCell>
              <TableCell align="right" sortDirection={sortOrder}>
                <TableSortLabel active direction={sortOrder} onClick={toggleSort}>
                  Cost
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

      {/* Cost projection */}
      <Divider sx={{ my: 2 }} />
      <ComparisonProjectionSection
        comparisonResults={comparisonResults}
        requestsPerDay={requestsPerDay}
        setRequestsPerDay={setRequestsPerDay}
      />

      {onOpenExplanation && (
        <Typography
          variant="caption"
          color="primary"
          onClick={onOpenExplanation}
          sx={{ cursor: "pointer", mt: 2, display: "block", textAlign: "center", "&:hover": { textDecoration: "underline" } }}
        >
          How does this calculation work?
        </Typography>
      )}
    </Box>
  );
}

function EmptyResults({ icon, message, onOpenExplanation }) {
  return (
    <Box sx={{ textAlign: "center", py: 6, opacity: 0.5 }}>
      {icon}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {message}
      </Typography>
      {onOpenExplanation && (
        <Typography
          variant="caption"
          color="primary"
          onClick={onOpenExplanation}
          sx={{ cursor: "pointer", mt: 2, display: "block", "&:hover": { textDecoration: "underline" } }}
        >
          How does the calculation work?
        </Typography>
      )}
    </Box>
  );
}

// Summary tables (reused from original)
function TileSummary({ model, imageResults, totalTokens }) {
  const totalTileTokens = totalTokens - (model?.baseTokens || 0);
  const totalTiles = imageResults
    .map((img) => img.tokenization?.totalTiles ?? 0)
    .reduce((acc, val) => acc + val, 0);

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
      <Table size="small" aria-label="summary">
        <TableHead>
          <TableRow>
            <TableCell>Base tokens</TableCell>
            <TableCell>Tile tokens</TableCell>
            <TableCell>Total tokens</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{model?.baseTokens}</TableCell>
            <TableCell>{model?.tokensPerTile} &times; {totalTiles} = {totalTileTokens}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{totalTokens?.toLocaleString()}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function PatchSummary({ model, imageResults, totalTokens }) {
  const totalPatches = imageResults
    .map((img) => img.tokenization?.totalPatches ?? 0)
    .reduce((acc, val) => acc + val, 0);

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
      <Table size="small" aria-label="summary">
        <TableHead>
          <TableRow>
            <TableCell>Patches</TableCell>
            <TableCell>Multiplier</TableCell>
            <TableCell>Total tokens</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{totalPatches}</TableCell>
            <TableCell>&times;{model?.tokenMultiplier}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{totalTokens?.toLocaleString()}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ImageBreakdownList({ imageResults, isPatch }) {
  const validResults = imageResults
    .map((img, i) => ({ img, idx: i }))
    .filter(({ img }) => img.resizedHeight);

  const defaultCollapsed = validResults.length >= 3;
  const [collapsedSet, setCollapsedSet] = useState(() =>
    defaultCollapsed ? new Set(validResults.map(({ idx }) => idx)) : new Set(),
  );

  const validIndicesKey = validResults.map(({ idx }) => idx).join(",");
  useEffect(() => {
    const validIndices = validIndicesKey.split(",").filter(Boolean).map(Number);
    setCollapsedSet((prev) => {
      const validSet = new Set(validIndices);
      const pruned = new Set([...prev].filter((i) => validSet.has(i)));
      if (validIndices.length >= 3) {
        for (const idx of validIndices) {
          if (!pruned.has(idx) && !prev.has(idx)) pruned.add(idx);
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

  if (validResults.length === 0) return null;

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
        Per-image breakdown
      </Typography>
      {validResults.map(({ img, idx }) => {
        const isCollapsed = collapsedSet.has(idx);
        const meta = `${img.resizedHeight} \u00d7 ${img.resizedWidth} \u2022 ${img.tokenization?.imageTokens ?? 0} tokens`;

        return (
          <Box key={idx}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              onClick={() => toggle(idx)}
              sx={{ cursor: "pointer", userSelect: "none", py: 0.25 }}
            >
              <IconButton size="small" aria-expanded={!isCollapsed} sx={{ p: 0, width: 20, height: 20 }}>
                {isCollapsed ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
              </IconButton>
              <Typography variant="caption" fontWeight={600}>Image {idx + 1}</Typography>
              {isCollapsed && (
                <Typography variant="caption" color="text.secondary">{meta}</Typography>
              )}
            </Stack>
            <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 0.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Resized</TableCell>
                      <TableCell>{isPatch ? "Patches" : "Tiles"}</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{img.resizedHeight} &times; {img.resizedWidth}</TableCell>
                      <TableCell>
                        {isPatch
                          ? `${img.tokenization?.patchesHigh ?? 0} \u00d7 ${img.tokenization?.patchesWide ?? 0}`
                          : `${img.tokenization?.tilesHigh ?? 0} \u00d7 ${img.tokenization?.tilesWide ?? 0}`}
                      </TableCell>
                      <TableCell>
                        {isPatch ? img.tokenization?.totalPatches ?? 0 : img.tokenization?.totalTiles ?? 0}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}

// Cost projection sections
function CostProjectionSection({ totalCost, model, requestsPerDay, setRequestsPerDay }) {
  const unitCost = Number.parseFloat(totalCost ?? "0");
  const hasValidCost = Number.isFinite(unitCost) && unitCost > 0;

  return (
    <Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block" }}>
        Cost Projection
      </Typography>
      <TextField
        label="Requests per day"
        type="number"
        size="small"
        value={requestsPerDay === 0 ? "" : requestsPerDay}
        onChange={(e) => setRequestsPerDay(e.target.value)}
        slotProps={{ input: { inputProps: { min: 0, step: 1 } } }}
        sx={{ width: 160, mb: 1.5 }}
      />
      {requestsPerDay > 0 && hasValidCost && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label="cost projection">
            <TableHead>
              <TableRow>
                <TableCell>Per request</TableCell>
                <TableCell align="right">Daily</TableCell>
                <TableCell align="right">Monthly</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{currencyFmt.format(unitCost)}</TableCell>
                <TableCell align="right">{currencyFmt.format(unitCost * requestsPerDay)}</TableCell>
                <TableCell align="right">{currencyFmt.format(unitCost * requestsPerDay * 30)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {model?.comment && requestsPerDay > 0 && hasValidCost && (
        <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
          This projection only covers calculated token costs. {model.comment}
        </Alert>
      )}
    </Box>
  );
}

function ComparisonProjectionSection({ comparisonResults, requestsPerDay, setRequestsPerDay }) {
  return (
    <Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block" }}>
        Cost Projection
      </Typography>
      <TextField
        label="Requests per day"
        type="number"
        size="small"
        value={requestsPerDay === 0 ? "" : requestsPerDay}
        onChange={(e) => setRequestsPerDay(e.target.value)}
        slotProps={{ input: { inputProps: { min: 0, step: 1 } } }}
        sx={{ width: 160, mb: 1.5 }}
      />
      {requestsPerDay > 0 && comparisonResults.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label="cost projection comparison">
            <TableHead>
              <TableRow>
                <TableCell>Model</TableCell>
                <TableCell align="right">Daily</TableCell>
                <TableCell align="right">Monthly</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonResults.map((r, i) => {
                const uc = Number.parseFloat(r.totalCost ?? "0");
                const valid = Number.isFinite(uc) && uc > 0;
                return (
                  <TableRow key={`${r.model?.name ?? "u"}-${i}`}>
                    <TableCell>{r.model?.name ?? "Unknown"}</TableCell>
                    <TableCell align="right">{valid ? currencyFmt.format(uc * requestsPerDay) : "-"}</TableCell>
                    <TableCell align="right">{valid ? currencyFmt.format(uc * requestsPerDay * 30) : "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
