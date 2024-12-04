import React from "react";
import { Box, Typography } from "@mui/material";
import { useBoundStore } from "../../stores";

const CalculatorOutput = () => {
  const totalTokens = useBoundStore((state) => state.totalTokens);
  const totalCost = useBoundStore((state) => state.totalCost);
  const model = useBoundStore((state) => state.model);
  const images = useBoundStore((state) => state.images);

  return (
    <Box mt={2}>
      {images.map((image, index) =>
        image.resizedHeight ? (
          <Box key={index} sx={{ display: "flex" }} mb={2}>
            <Box sx={{ flex: "1 0 auto" }}>
              <Typography variant="h6" gutterBottom>
                Image {index + 1}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Resized Size
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {image.resizedHeight} x {image.resizedWidth}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Tiles (per image)
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {image.tilesHigh} x {image.tilesWide}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total tiles
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {image.totalTiles}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : null
      )}

      {totalTokens !== null && (
        <Box sx={{ display: "flex" }} mb={2}>
          <Box sx={{ flex: "1 0 auto" }}>
            <Typography variant="h6" gutterBottom>
              Result
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {model && (
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Base tokens
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {model.baseTokens}
                  </Typography>
                </Box>
              )}

              {model && (
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Tile tokens
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {model.tokensPerTile} x{" "}
                    {images
                      .map((image) => image.totalTiles ?? 0)
                      .reduce((acc, val) => acc + val, 0)}{" "}
                    = {totalTokens - model.baseTokens}
                  </Typography>
                </Box>
              )}

              {totalTokens !== null && (
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total tokens
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {totalTokens}
                  </Typography>
                </Box>
              )}

              {totalCost !== null && (
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total cost
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    ${totalCost}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CalculatorOutput;
