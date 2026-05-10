import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
} from "@mui/material";
import { useBoundStore } from "../../stores";

export default function CalculationExplanation() {
  const model = useBoundStore((s) => s.model);
  const isPatch = model?.tokenizationType === "patch";

  return (
    <Accordion
      expanded
      disableGutters
      elevation={0}
      aria-label="Calculation explanation"
    >
      <AccordionSummary>
        <Typography variant="h6" fontWeight={700}>
          How the Calculation Works
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {model ? (
          isPatch ? (
            <Stack spacing={1.25} component="ol" sx={{ pl: 2 }}>
              <Typography component="li">
                <b>Max Dimension Check</b>: If any side exceeds{" "}
                {model.maxImageDimension}px, the image is scaled down
                proportionally to fit.
              </Typography>
              <Typography component="li">
                <b>Counting Patches</b>: The image is covered with{" "}
                {model.patchSize}px &times; {model.patchSize}px patches.
                Patches = ceil(width/{model.patchSize}) &times;
                ceil(height/{model.patchSize}).
              </Typography>
              <Typography component="li">
                <b>Patch Budget</b>: If patches exceed {model.patchBudget}, the
                image is scaled down further to fit within the budget.
              </Typography>
              <Typography component="li">
                <b>Token Calculation</b>: Total tokens = patches &times;{" "}
                {model.tokenMultiplier} token multiplier.
              </Typography>
              <Typography component="li">
                <b>Price Calculation</b>: Total price = total tokens &times;
                price per 1M tokens (${model.costPerMillionTokens}).
              </Typography>
              {model.comment && (
                <Typography component="li">
                  <b>IMPORTANT:</b> {model.comment}
                </Typography>
              )}
            </Stack>
          ) : (
            <Stack spacing={1.25} component="ol" sx={{ pl: 2 }}>
              <Typography component="li">
                <b>Resizing Images</b>: Ensure each image is resized to fit within
                the maximum dimension {model.maxImageDimension}px and has at least{" "}
                {model.imageMinSizeLength}px on its shortest side while
                maintaining its aspect ratio.
              </Typography>
              <Typography component="li">
                <b>Calculating Tiles</b>: The resized image is divided into tiles
                based on the model&apos;s tile size of {model.tileSizeLength}px &times;{" "}
                {model.tileSizeLength}px.
              </Typography>
              <Typography component="li">
                <b>Token Calculation</b>: Total tokens = (tiles &times;
                {model.tokensPerTile}) + {model.baseTokens} base tokens.
              </Typography>
              <Typography component="li">
                <b>Price Calculation</b>: Total price = total tokens &times; price per
                1M tokens (${model.costPerMillionTokens}).
              </Typography>
              {model.comment && (
                <Typography component="li">
                  <b>IMPORTANT:</b> {model.comment}
                </Typography>
              )}
            </Stack>
          )
        ) : (
          <Typography>Pick a model to see the calculation details.</Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
