import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { useBoundStore } from "../../stores";

const CalculationExplanation = () => {
  const model = useBoundStore((state) => state.model);

  return (
    <Accordion expanded>
      <AccordionSummary
        aria-controls="calculation-explanation-content"
        id="calculation-explanation-header"
      >
        <Typography variant="h6">How the Calculation Works</Typography>
      </AccordionSummary>
      {model ? (
        <AccordionDetails>
          <Typography>The calculation involves several steps:</Typography>
          <Typography>
            1. <b>Resizing Images</b>: Ensure each image is resized to fit
            within the maximum dimension {model.maxImageDimension}px, and has at
            least {model.imageMinSizeLength}px on the shortest side, while
            maintaining its aspect ratio.
          </Typography>
          <Typography>
            2. <b>Calculating Tiles</b>: The resized image is divided into tiles
            based on the model's tile size of {model.tileSizeLength}px by{" "}
            {model.tileSizeLength}px.
          </Typography>
          <Typography>
            3. <b>Token Calculation</b>: The total number of tokens is
            calculated by multiplying the number of tiles by the tokens per tile
            ({model.tokensPerTile}) and adding {model.baseTokens} base tokens.
          </Typography>
          <Typography>
            4. <b>Cost Calculation</b>: The total cost is calculated based on
            the total number of tokens and the cost per thousand tokens ($
            {model.costPerThousandTokens}).
          </Typography>
        </AccordionDetails>
      ) : (
        <AccordionDetails>
          <Typography>
            Please select a model to see the calculation explanation.
          </Typography>
        </AccordionDetails>
      )}
    </Accordion>
  );
};

export default CalculationExplanation;
