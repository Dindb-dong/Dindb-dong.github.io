import { defineConfig } from "@playwright/test";
import config from "./playwright.config.js";

export default defineConfig({
  ...config,
  use: { ...config.use, baseURL: "http://127.0.0.1:4183" },
  webServer: {
    command: "npm run preview -- --port 4183 --strictPort",
    url: "http://127.0.0.1:4183",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
