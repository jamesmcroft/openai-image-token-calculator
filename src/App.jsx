import {
  AppBar,
  Box,
  CssBaseline,
  Container,
  Grid,
  Toolbar,
  Typography,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./components/layout/Theme";
import Calculator from "./components/calculator/Calculator";
import CalculationExplanation from "./components/calculator/CalculationExplanation";
import Footer from "./components/layout/Footer";

export default function App() {
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            Azure OpenAI Image Token Calculator
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Grid container spacing={isMdUp ? 4 : 2} alignItems="stretch">
          <Grid item xs={12} md={8}>
            <Paper
              elevation={2}
              sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, height: "100%" }}
            >
              <Calculator />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                position: { md: "sticky" },
                top: { md: theme.spacing(4) },
              }}
            >
              <CalculationExplanation />
              <Box mt={4}>
                <Footer />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
