import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  return defineConfig({
    plugins: [react()],
    // Use GitHub Pages base only for production builds
    base: "/openai-image-token-calculator/",
    publicDir: "public",
    test: {
      coverage: {
        provider: "v8",
        reporter: ["text", "cobertura"],
        include: ["src/**"],
      },
    },
    server: {
      host: true, // equivalent to 0.0.0.0
      port: 5173,
      strictPort: true,
      hmr: {
        // In local devcontainers, the forwarded port on localhost is typically the same
        clientPort: 5173,
      },
      watch: {
        // Ensure file changes are detected across container bind mounts
        usePolling: true,
        interval: 100,
      },
    },
  });
};
