import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/trpc": "http://localhost:4000",
      "/auth": "http://localhost:4000",
    },
  },
});
