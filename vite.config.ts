import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      tanstackStart({
        server: { entry: "src/server.ts" },
      }),
      react(),
      tsConfigPaths(),
      tailwindcss(),
      mode === "production" && cloudflare(),
    ].filter(Boolean),
    optimizeDeps: {
      exclude: ["@met4citizen/talkinghead"],
    },
    server: {
      proxy: {
        "/api": "http://localhost:3001",
      },
    },
  };
});
