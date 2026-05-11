import { Box, Button, Typography, Stack } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LanguageIcon from "@mui/icons-material/Language";

export default function Footer() {
  return (
    <Box textAlign="center" sx={{ py: 4 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Created by James Croft
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        mt={1.5}
        justifyContent="center"
        flexWrap="wrap"
        useFlexGap
      >
        <Button
          startIcon={<LanguageIcon />}
          variant="outlined"
          href="https://www.jamescroft.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit jamescroft.co.uk"
          size="small"
        >
          jamescroft.co.uk
        </Button>
        <Button
          startIcon={<GitHubIcon />}
          variant="outlined"
          href="https://github.com/jamesmcroft/openai-image-token-calculator"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          size="small"
        >
          GitHub
        </Button>
        <Button
          startIcon={<LinkedInIcon />}
          variant="outlined"
          href="https://www.linkedin.com/in/jmcroft"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit LinkedIn profile"
          size="small"
        >
          LinkedIn
        </Button>
      </Stack>
    </Box>
  );
}
