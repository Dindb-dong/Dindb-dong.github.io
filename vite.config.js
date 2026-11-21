import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  build: {
    rollupOptions: { input: ["index.html", "resume.html"] },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 1200,
  },
});
