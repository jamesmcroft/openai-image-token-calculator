import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { useBoundStore } from "../../stores";

export default function CalculationExplanation() {
  const model = useBoundStore((s) => s.model);

  return (
    <Accordion expanded disableGutters elevation={0}>
      <AccordionSummary>
        <Typography variant="h6">How the Calculation Works</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {model ? (
          <Typography
            component="div"
            sx={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            <span>
              1. <b>Resizing Images</b>: Ensure each image is resized to fit
              within the maximum dimension {model.maxImageDimension}px and has
              at least {model.imageMinSizeLength}px on its shortest side while
              maintaining its aspect ratio.
            </span>
            <span>
              2. <b>Calculating Tiles</b>: The resized image is divided into
              tiles based on the model's tile size of {model.tileSizeLength}px ×{" "}
              {model.tileSizeLength}px.
            </span>
            <span>
              3. <b>Token Calculation</b>: Total tokens = (tiles ×
              {model.tokensPerTile}) + {model.baseTokens} base tokens.
            </span>
            <span>
              4. <b>Price Calculation</b>: Total price = total tokens × price
              per 1M tokens ($
              {model.costPerMillionTokens}).
            </span>
            {model.comment && (
              <span>
                <b>IMPORTANT:</b> {model.comment}
              </span>
            )}
          </Typography>
        ) : (
          <Typography>
            Please select a model to see the calculation explanation.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
