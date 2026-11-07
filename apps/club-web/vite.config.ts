import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) =>
          id.includes("/node_modules/@supabase/")
            ? "supabase"
            : id.includes("/node_modules/qrcode/") ||
                id.includes("/node_modules/pngjs/") ||
                id.includes("/node_modules/dijkstrajs/")
              ? "qr"
              : undefined,
      },
    },
  },
  server: { port: 4173 },
});
