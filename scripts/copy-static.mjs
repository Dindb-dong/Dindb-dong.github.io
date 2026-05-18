import { cp, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const staticEntries = [
  ["legacy/public", "dist/legacy/public"],
  ["assets", "dist/assets"],
  [".nojekyll", "dist/.nojekyll"],
  ["remote-browser.config.json", "dist/remote-browser.config.json"],
];

for (const [from, to] of staticEntries) {
  if (!existsSync(from)) continue;
  await mkdir(dirname(to), { recursive: true });
  if (from.endsWith(".json") || from.endsWith(".nojekyll")) {
    await copyFile(from, to);
  } else {
    await cp(from, to, { recursive: true });
  }
}

await mkdir("dist/vendor", { recursive: true });
if (existsSync("vendor/dindbos-0.1.0.tgz")) {
  await copyFile("vendor/dindbos-0.1.0.tgz", join("dist/vendor", "dindbos-0.1.0.tgz"));
}
