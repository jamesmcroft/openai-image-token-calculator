import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { GitHub, LinkedIn } from "@mui/icons-material";

function Footer() {
  return (
    <Box mt={4} textAlign="center">
      <Typography variant="body2">Created by James Croft.</Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 2,
          gap: 1,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          color="dark"
          startIcon={<GitHub />}
          href="https://github.com/jamesmcroft/openai-image-token-calculator"
          target="_blank"
        >
          View Source on GitHub
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<LinkedIn />}
          href="https://www.linkedin.com/in/jmcroft"
          target="_blank"
        >
          View Profile on LinkedIn
        </Button>
      </Box>
    </Box>
  );
}

export default Footer;
