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
  IconButton,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Add, Delete, FileCopy, ExpandMore } from "@mui/icons-material";
import { useBoundStore } from "./stores";

function App() {
  const [modelName, setModelName] = useState("");

  const images = useBoundStore((state) => state.images);
  const models = useBoundStore((state) => state.models);
  const setModel = useBoundStore((state) => state.setModel);
  const addImage = useBoundStore((state) => state.addImage);
  const updateImage = useBoundStore((state) => state.updateImage);
  const removeImage = useBoundStore((state) => state.removeImage);
  const runCalculation = useBoundStore((state) => state.runCalculation);
  const totalTokens = useBoundStore((state) => state.totalTokens);
  const totalCost = useBoundStore((state) => state.totalCost);
  const model = useBoundStore((state) => state.model);

  const selectModel = (model) => {
    setModelName(model);

    const selectedModel = models.find((m) => m.name === model);
    if (selectedModel) {
      setModel(selectedModel);
    } else {
      setModel(null);
    }
  };

  const addNewImage = () => {
    addImage({ height: 0, width: 0, multiplier: 1 });
  };

  const cloneImage = (index) => {
    const image = images[index];
    addImage({
      height: image.height,
      width: image.width,
      multiplier: image.multiplier,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runCalculation();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          OpenAI Image Token Calculator
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="model-label">Model</InputLabel>
                <Select
                  labelId="model-label"
                  value={modelName}
                  onChange={(e) => selectModel(e.target.value)}
                  label="Model"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {models.map((model) => (
                    <MenuItem key={model.name} value={model.name}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {images.map((image, index) => (
                <Grid container spacing={1} alignItems="center" key={index}>
                  <Grid item sm={4}>
                    <TextField
                      label="Image Height (px)"
                      type="number"
                      value={image.height}
                      onChange={(e) =>
                        updateImage(index, "height", e.target.value)
                      }
                      margin="normal"
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item sm={4}>
                    <TextField
                      label="Image Width (px)"
                      type="number"
                      value={image.width}
                      onChange={(e) =>
                        updateImage(index, "width", e.target.value)
                      }
                      margin="normal"
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item sm={2}>
                    <TextField
                      label="Count"
                      type="number"
                      value={image.multiplier}
                      onChange={(e) =>
                        updateImage(index, "multiplier", e.target.value)
                      }
                      margin="normal"
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item sm={1}>
                    <IconButton
                      onClick={() => cloneImage(index)}
                      color="primary"
                    >
                      <FileCopy />
                    </IconButton>
                  </Grid>
                  <Grid item sm={1}>
                    <IconButton
                      onClick={() => removeImage(index)}
                      color="secondary"
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}

              <Button
                onClick={addNewImage}
                variant="contained"
                color="info"
                style={{ marginBottom: "20px" }}
                fullWidth
              >
                <Add /> Add Image
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Calculate
              </Button>
            </form>

            {totalTokens !== null && (
              <Typography gutterBottom>Total Tokens: {totalTokens}</Typography>
            )}
            {totalCost !== null && (
              <Typography gutterBottom>Estimated Cost: ${totalCost}</Typography>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Accordion expanded>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="calculation-explanation-content"
                id="calculation-explanation-header"
              >
                <Typography variant="h6">How the Calculation Works</Typography>
              </AccordionSummary>
              {model ? (
                <AccordionDetails>
                  <Typography paragraph>
                    The calculation involves several steps:
                  </Typography>
                  <Typography paragraph>
                    1. <b>Resizing Images</b>: Each image is resized to a
                    minimum size while maintaining its aspect ratio. The minimum
                    size is {model.imageMinSizeLength}px.
                  </Typography>
                  <Typography paragraph>
                    2. <b>Calculating Tiles</b>: The resized image is divided
                    into tiles based on the model's tile size of{" "}
                    {model.tileSizeLength}px by {model.tileSizeLength}px.
                  </Typography>
                  <Typography paragraph>
                    3. <b>Token Calculation</b>: The total number of tokens is
                    calculated by multiplying the number of tiles by the tokens
                    per tile ({model.tokensPerTile}) and adding an additional
                    buffer of {model.additionalBuffer} tokens.
                  </Typography>
                  <Typography paragraph>
                    4. <b>Cost Calculation</b>: The total cost is calculated
                    based on the total number of tokens and the cost per
                    thousand tokens (${model.costPerThousandTokens}).
                  </Typography>
                </AccordionDetails>
              ) : (
                <AccordionDetails>
                  <Typography paragraph>
                    Please select a model to see the calculation explanation.
                  </Typography>
                </AccordionDetails>
              )}
            </Accordion>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
