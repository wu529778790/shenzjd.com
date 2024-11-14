import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/urlMetaApi": {
        target: "https://api.urlmeta.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/urlMetaApi/, ""),
        timeout: 5000,
      },
    },
  },
});
