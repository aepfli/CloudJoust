import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [preact()],
  base: "/otel-control/",
  server: {
    proxy: {
      "/observability": "http://localhost:8080",
    },
  },
});
