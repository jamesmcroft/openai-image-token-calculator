import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Stack,
  Checkbox,
} from "@mui/material";
import TokenBadge from "../atoms/TokenBadge";
import RetirementChip from "../calculator/comparison/RetirementChip";

export default function ModelCard({ model, selected, onSelect, selectable, sx }) {
  const tokenType = model.tokenizationType ?? "tile";
  const costLabel = `$${model.costPerMillionTokens}/1M`;

  const content = (
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {selectable && (
                <Checkbox
                  checked={selected}
                  size="small"
                  sx={{ p: 0 }}
                  tabIndex={-1}
                />
              )}
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
                sx={{ flex: 1, minWidth: 0 }}
              >
                {model.name}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <TokenBadge type={tokenType} />
              {model.retirementDate && (
                <RetirementChip date={model.retirementDate} />
              )}
            </Stack>
            <Typography
              variant="body2"
              fontWeight={700}
              color="primary"
              sx={{ fontFeatureSettings: '"tnum"', pt: 0.25 }}
            >
              {costLabel}
            </Typography>
          </Stack>
        </CardContent>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        transition: "all 0.15s ease",
        borderColor: selected ? "primary.main" : "divider",
        borderWidth: selected ? 2 : 1,
        bgcolor: selected ? (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(58, 160, 255, 0.08)"
            : "rgba(15, 108, 189, 0.04)"
        : "background.paper",
        ...sx,
      }}
    >
      {onSelect ? (
        <CardActionArea onClick={() => onSelect(model)} sx={{ height: "100%" }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
