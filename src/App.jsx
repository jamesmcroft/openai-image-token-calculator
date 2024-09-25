import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./components/layout/Theme";
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

function App() {
  const [model, setModel] = useState("");
  const [numImages, setNumImages] = useState("");
  const [imgHeight, setImgHeight] = useState("");
  const [imgWidth, setImgWidth] = useState("");
  const [totalTokens, setTotalTokens] = useState(null);
  const [totalCost, setTotalCost] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    var imgSize = getResizedImageSize(imgHeight, imgWidth);
    var imageTileCount = getImageTileCount(imgSize.height, imgSize.width);

    var totalTokens = 0;
    var tokensPerTile = 0;
    var additionalBuffer = 0;
    var costPerThousandTokens = 0;

    if (model === "GPT-4o") {
      tokensPerTile = 170;
      additionalBuffer = 85;
      costPerThousandTokens = 0.005;
    } else if (model === "GPT-4o mini") {
      tokensPerTile = 5667;
      additionalBuffer = 2833;
      costPerThousandTokens = 0.000165;
    }

    totalTokens = calculateImageTokens(
      imageTileCount.tilesHigh,
      imageTileCount.tilesWide,
      tokensPerTile,
      numImages,
      additionalBuffer
    );
    setTotalTokens(totalTokens);

    // Round cost to 2 decimal places
    var totalCost = (totalTokens / 1000) * costPerThousandTokens;
    totalCost = totalCost.toFixed(2);
    setTotalCost(totalCost);
  };

  const getResizedImageSize = (imgHeight, imgWidth) => {
    var resizedHeight = imgHeight;
    var resizedWidth = imgWidth;

    if (imgHeight > imgWidth) {
      resizedHeight = 768;
    } else {
      resizedHeight = (imgHeight / imgWidth) * 768;
    }

    if (imgHeight > imgWidth) {
      resizedWidth = (imgWidth / imgHeight) * 768;
    } else {
      resizedWidth = 768;
    }

    return { height: resizedHeight, width: resizedWidth };
  };

  const getImageTileCount = (imgHeight, imgWidth) => {
    var heightTiles = Math.ceil(imgHeight / 512);
    var widthTiles = Math.ceil(imgWidth / 512);
    return { tilesHigh: heightTiles, tilesWide: widthTiles };
  };

  const calculateImageTokens = (
    tilesHigh,
    tilesWide,
    tokensPerTile,
    totalImages,
    additionalBuffer
  ) => {
    return (
      tilesHigh * tilesWide * tokensPerTile * totalImages + additionalBuffer
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Typography variant="h4" gutterBottom>
          OpenAI Image Token Calculator
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="model-label">Model</InputLabel>
            <Select
              labelId="model-label"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              label="Model"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="GPT-4o">GPT-4o</MenuItem>
              <MenuItem value="GPT-4o mini">GPT-4o mini</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Number of Images"
            type="number"
            value={numImages}
            onChange={(e) => setNumImages(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Image Height (pixels)"
            type="number"
            value={imgHeight}
            onChange={(e) => setImgHeight(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Image Width (pixels)"
            type="number"
            value={imgWidth}
            onChange={(e) => setImgWidth(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Calculate
          </Button>
        </form>
        {totalTokens !== null && (
          <Typography variant="h6" gutterBottom>
            Total Tokens: {totalTokens}
          </Typography>
        )}
        {totalCost !== null && (
          <Typography variant="h6" gutterBottom>
            Total Cost: ${totalCost}
          </Typography>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
