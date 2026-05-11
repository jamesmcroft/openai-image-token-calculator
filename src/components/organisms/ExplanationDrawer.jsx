import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useBoundStore } from "../../stores";

export default function ExplanationDrawer({ open, onClose }) {
  const model = useBoundStore((s) => s.model);
  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const comparisonResults = useBoundStore((s) => s.comparisonResults);
  const isPatch = model?.tokenizationType === "patch";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 420 }, p: 0 },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          How the Calculation Works
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close explanation">
          <Close />
        </IconButton>
      </Stack>

      <Box sx={{ px: 3, pb: 3 }}>
      {comparisonMode ? (
        comparisonResults.length > 0 ? (
          <Stack spacing={2}>
            <Typography variant="body2">
              Each selected model calculates tokens independently against the
              same set of images. Results are sorted by estimated cost
              (cheapest first).
            </Typography>
            <Typography variant="body2">
              <b>Tile-based models</b> (GPT-4o, GPT-5, o1/o3): Images are
              resized and divided into fixed-size tiles. Tokens = (tiles x
              tokens per tile) + base tokens.
            </Typography>
            <Typography variant="body2">
              <b>Patch-based models</b> (GPT-5.2+, GPT-5.4, o4-mini): Images
              are covered with patches and constrained by a patch budget.
              Tokens = patches x token multiplier.
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select models and add images to see calculation details.
          </Typography>
        )
      ) : model ? (
        isPatch ? (
          <Stack spacing={2} component="ol" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2">
              <b>Max Dimension Check</b>: If any side exceeds{" "}
              {model.maxImageDimension}px, the image is scaled down
              proportionally to fit.
            </Typography>
            <Typography component="li" variant="body2">
              <b>Counting Patches</b>: The image is covered with{" "}
              {model.patchSize}px &times; {model.patchSize}px patches.
              Patches = ceil(width/{model.patchSize}) &times;
              ceil(height/{model.patchSize}).
            </Typography>
            <Typography component="li" variant="body2">
              <b>Patch Budget</b>: If patches exceed {model.patchBudget}, the
              image is scaled down further to fit within the budget.
            </Typography>
            <Typography component="li" variant="body2">
              <b>Token Calculation</b>: Total tokens = patches &times;{" "}
              {model.tokenMultiplier} token multiplier.
            </Typography>
            <Typography component="li" variant="body2">
              <b>Price Calculation</b>: Total price = total tokens &times;
              price per 1M tokens (${model.costPerMillionTokens}).
            </Typography>
            {model.comment && (
              <Typography component="li" variant="body2">
                <b>IMPORTANT:</b> {model.comment}
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack spacing={2} component="ol" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2">
              <b>Resizing Images</b>: Ensure each image fits within
              {model.maxImageDimension}px max dimension and at least{" "}
              {model.imageMinSizeLength}px on its shortest side while
              maintaining aspect ratio.
            </Typography>
            <Typography component="li" variant="body2">
              <b>Calculating Tiles</b>: The resized image is divided into{" "}
              {model.tileSizeLength}px &times; {model.tileSizeLength}px tiles.
            </Typography>
            <Typography component="li" variant="body2">
              <b>Token Calculation</b>: Total tokens = (tiles &times;{" "}
              {model.tokensPerTile}) + {model.baseTokens} base tokens.
            </Typography>
            <Typography component="li" variant="body2">
              <b>Price Calculation</b>: Total price = total tokens &times; price per
              1M tokens (${model.costPerMillionTokens}).
            </Typography>
            {model.comment && (
              <Typography component="li" variant="body2">
                <b>IMPORTANT:</b> {model.comment}
              </Typography>
            )}
          </Stack>
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          Pick a model to see the calculation details.
        </Typography>
      )}
      </Box>
    </Drawer>
  );
}
