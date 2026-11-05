import { cp, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

const staticEntries = [
  // Keep published data/media URLs working; active files are the only source.
  ["public/portfolio/media", "dist/legacy/public/thumbnails"],
  ...["projectDetails", "introduce", "experiences", "eng_projectDetails", "eng_introduce", "eng_experiences"].map(name => [
    `public/portfolio/data/${name}.json`, `dist/legacy/public/${name}.json`,
  ]),
  ["assets", "dist/assets"],
  [".nojekyll", "dist/.nojekyll"],
  ["remote-browser.config.json", "dist/remote-browser.config.json"],
  ["resume.html", "dist/resume.html"],
  ["resume.pdf", "dist/resume.pdf"],
];

for (const [from, to] of staticEntries) {
  if (!existsSync(from)) continue;
  await mkdir(dirname(to), { recursive: true });
  if (from.endsWith(".json") || from.endsWith(".nojekyll") || from.endsWith(".html") || from.endsWith(".pdf")) {
    await copyFile(from, to);
  } else {
    await cp(from, to, { recursive: true });
  }
}
