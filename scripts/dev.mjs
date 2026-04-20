import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const processes = [];

if (!existsSync("remote-browser/node_modules")) {
  console.log("remote-browser dependencies are missing.");
  console.log("Run: npm run browser:install");
  process.exit(1);
}

processes.push(spawn("python3", ["-m", "http.server", "4173"], {
  stdio: "inherit",
}));

processes.push(spawn("npm", ["--prefix", "remote-browser", "start"], {
  stdio: "inherit",
}));

process.on("SIGINT", () => {
  processes.forEach((child) => child.kill("SIGINT"));
  process.exit(0);
});
