import { Box, Button, Typography, Stack } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export default function Footer() {
  return (
    <Box textAlign="center">
      <Typography variant="body2" color="text.secondary">
        Created by James Croft.
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        mt={2}
        justifyContent="center"
      >
        <Button
          startIcon={<GitHubIcon />}
          variant="outlined"
          href="https://github.com/jamesmcroft/openai-image-token-calculator"
          target="_blank"
        >
          Source on GitHub
        </Button>
        <Button
          startIcon={<LinkedInIcon />}
          variant="outlined"
          href="https://www.linkedin.com/in/jmcroft"
          target="_blank"
        >
          LinkedIn
        </Button>
      </Stack>
    </Box>
  );
}
