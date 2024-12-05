import { ThemeProvider } from "@mui/material/styles";
import theme from "./components/layout/Theme";
import Calculator from "./components/calculator/Calculator";
import CalculationExplanation from "./components/calculator/CalculationExplanation";
import Footer from "./components/layout/Footer";
import { Container, Typography, Grid2 as Grid } from "@mui/material";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Azure OpenAI Image Token Calculator
        </Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Calculator />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CalculationExplanation />
            <Footer />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
