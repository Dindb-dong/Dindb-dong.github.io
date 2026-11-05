# DindbOS portfolio

The current site is a Vite host for the checked-in DindbOS SDK. Start at
`index.html` → `src/main.js`; `legacy/` contains frozen previous implementations.

| Location | Responsibility |
| --- | --- |
| `public/portfolio/data/` | Active Korean/English project, profile, and experience JSON |
| `public/portfolio/media/` | Active project images/videos and capture provenance |
| `assets/` | Profile images, app icons, and presentation files |
| `src/main.js` | OS boot and SDK configuration |
| `src/portfolio-app.js` | App registration, portfolio navigation, general views |
| `src/apps/projects.js` | Project browser rendering, search, filters, selection |
| `src/experience-content.js`, `src/experience-app.js` | Curated experience content and independent experience apps |
| `src/view-lifecycle.js` | Render/dispose ownership per mounted view |
| `src/portfolio-data.js` | Locale loading, project normalization, runtime state |
| `src/portfolio-filesystem.js` | Portfolio VFS files and Markdown serialization |
| `src/utils/` | Shared HTML escaping and value helpers |
| `remote-browser/` | Active optional remote Chromium service |
| `vendor/` | Reproducible SDK tarball and upstream source notes |

## Development and checks

```sh
npm ci
npm run dev
npm run test:unit
npm run test:e2e
npm run qa
```

`qa` runs unit/content checks, builds, and runs the browser suite against a fresh
production preview at port 4183. The development browser suite uses port 4173.
Use `PLAYWRIGHT_CHANNEL=chrome` with an installed Chrome, or install the Playwright
browser matching the lockfile. `npm run build && npm run test:preview` checks an
existing production build without running the development server.

For the optional local browser service, first run `npm run browser:install`, then
`npm run dev:full`. That command starts Vite and the existing browser service.

Change content under `public/portfolio/`, not the archive. Keep Korean/English IDs
aligned. `src/portfolio-data.js` lists project media; `src/experience-content.js`
selects and captions experience media. Tests check referenced IDs and files.
Existing JSON schemas, app IDs, DOM classes, saved language keys, and VFS paths
remain stable. The build creates `/legacy/public/{*.json,thumbnails/*}` aliases
from active files for previously published URLs; it does not deploy the old apps.
