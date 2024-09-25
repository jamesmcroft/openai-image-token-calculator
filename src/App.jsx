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
} from "@mui/material";
import { Add, Delete, FileCopy } from "@mui/icons-material";
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

  const selectModel = (model) => {
    setModelName(model);

    const selectedModel = models.find((m) => m.name === model);
    if (selectedModel) {
      setModel(selectedModel);
    }
  };

  const addNewImage = () => {
    addImage({ height: "", width: "" });
  };

  const cloneImage = (index) => {
    const image = images[index];
    addImage({ height: image.height, width: image.width });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runCalculation();
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
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <TextField
                label="Image Height (pixels)"
                type="number"
                value={image.height}
                onChange={(e) => updateImage(index, "height", e.target.value)}
                margin="normal"
                required
                style={{ marginRight: "10px" }}
              />
              <TextField
                label="Image Width (pixels)"
                type="number"
                value={image.width}
                onChange={(e) => updateImage(index, "width", e.target.value)}
                margin="normal"
                required
                style={{ marginRight: "10px" }}
              />
              <IconButton onClick={() => cloneImage(index)} color="primary">
                <FileCopy />
              </IconButton>
              <IconButton onClick={() => removeImage(index)} color="secondary">
                <Delete />
              </IconButton>
            </div>
          ))}

          <Button
            onClick={addNewImage}
            variant="contained"
            color="primary"
            style={{ marginBottom: "20px" }}
          >
            <Add /> Add Image
          </Button>

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
            Estimated Cost: ${totalCost}
          </Typography>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
