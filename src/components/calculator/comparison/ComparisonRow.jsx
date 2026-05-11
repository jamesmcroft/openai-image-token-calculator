import { TableRow, TableCell, Collapse, Stack } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import RetirementChip from "./RetirementChip";
import ModelComment from "./ModelComment";
import ComparisonDetail from "./ComparisonDetail";

const currencyFmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

export default function ComparisonRow({ result, isExpanded, onToggle }) {
  const { model, totalTokens, totalCost } = result;
  const tokenizationType = model.tokenizationType === "patch" ? "Patch" : "Tile";

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <>
      <TableRow
        hover
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        sx={{ cursor: "pointer", "& > *": { borderBottom: isExpanded ? 0 : undefined } }}
        aria-expanded={isExpanded}
      >
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {isExpanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
            <span>{model.name}</span>
            <ModelComment comment={model.comment} />
          </Stack>
        </TableCell>
        <TableCell>{tokenizationType}</TableCell>
        <TableCell align="right">{totalTokens.toLocaleString()}</TableCell>
        <TableCell align="right">
          {currencyFmt.format(Number(totalCost))}
        </TableCell>
        <TableCell>
          <RetirementChip date={model.retirementDate} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} sx={{ py: 0, px: 0 }}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <ComparisonDetail result={result} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
