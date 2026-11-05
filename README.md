<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/dindbos-mark.png">
    <img src="public/brand/dindbos-lockup.png" alt="DindbOS" height="96">
  </picture>
</p>

<h1 align="center">Kim Dong Wook · Portfolio</h1>
<p align="center">Explore my work as a desktop. Open a project, an experience, or a file.</p>
<p align="center">Full-Stack AI &amp; SW Engineer · JavaScript + Vite · Powered by DindbOS</p>
<p align="center"><a href="https://dindb-dong.github.io/">Live portfolio</a> · <a href="https://github.com/Dindb-dong/dindbos">DindbOS SDK</a> · <a href="https://dindb-dong.github.io/resume.pdf">Resume</a> · <a href="#quick-start">Quick start</a></p>

<p align="center"><img src="docs/assets/portfolio.jpg" alt="Kim Dong Wook's portfolio overview running in a DindbOS desktop" width="1280"></p>

My personal portfolio, built as a working desktop with [DindbOS](https://github.com/Dindb-dong/dindbos). Browse software and AI projects, open dedicated experience apps, read my resume, or explore the same content through Files and Terminal.

This repository is the portfolio host. The desktop runtime is developed separately in the [DindbOS repository](https://github.com/Dindb-dong/dindbos); this site consumes a checked-in `dindbos@0.2.3` integration build. [Package source and provenance](vendor/README.md).

## Explore the portfolio

| Open | What you will find |
| --- | --- |
| **Portfolio** | Education, languages, development tools, career, and AI interests |
| **Projects** | Search by title, role, or technology; filter by category and tags; sort and inspect screenshots, videos, and source links |
| **Experience** | Independent apps for Leviosa-AI, Alus-Healthcare, NOI-LAB, SDP, YAI, and YCC |
| **Resume** | An in-app resume view and a downloadable PDF |
| **Files & Terminal** | Portfolio content exposed as virtual files inside the desktop |

The host includes Korean and English datasets and respects the saved language preference. Narrow windows use compact bottom navigation and a stacked project layout. Window management, the Dock, built-in apps, and browser storage come from DindbOS.

<details>
<summary>Project browser</summary>

![Searchable project archive in the portfolio app](docs/assets/projects.jpg)

</details>

### On mobile

<p align="center">
  <img src="docs/assets/mobile.jpg" alt="Portfolio overview at a 390 by 844 CSS-pixel viewport with bottom navigation" width="300">
  <img src="docs/assets/mobile-projects.jpg" alt="Project archive at a 390 by 844 CSS-pixel viewport" width="300">
</p>

These are actual browser captures of the local production build, including the desktop overview and project archive above. Mobile captures use a 390×844 CSS-pixel viewport; they are browser viewport checks, not real-device compatibility claims. [Capture and artwork provenance](docs/assets/README.md).

## Quick start

Use Node.js 22, matching the deployment workflow.

```sh
npm ci
npm run dev
```

Open [localhost:4173](http://127.0.0.1:4173/). The SDK tarball is included in `vendor/`; no sibling DindbOS checkout or unpublished npm release is required.

Build and preview the static site:

```sh
npm run build
npm run preview
```

### Optional remote browser

The portfolio itself runs as a static site. Browser.app can use a separate Chromium service for external websites:

```sh
npm run browser:install
npm run dev:full
```

That starts Vite and the local browser service. See [remote-browser/README.md](remote-browser/README.md) for service setup and `remote-browser.config.json` for endpoint configuration.

## Content and source

Change active content under `public/portfolio/`, keeping Korean and English IDs aligned. `legacy/` contains frozen earlier implementations.

| Location | Responsibility |
| --- | --- |
| `public/portfolio/data/` | Korean/English project, profile, and experience JSON |
| `public/portfolio/media/` | Project images, videos, and capture provenance |
| `public/brand/` | Transparent upstream DindbOS artwork; the mark is also the favicon |
| `assets/` | Profile images, organization icons, and presentation files |
| `src/main.js` | Desktop boot and SDK configuration |
| `src/portfolio-app.js` | App registration, portfolio navigation, and general views |
| `src/apps/projects.js` | Project browser, search, filters, and selection |
| `src/experience-content.js`, `src/experience-app.js` | Curated experience content and independent experience apps |
| `src/portfolio-data.js` | Locale loading, project normalization, and runtime state |
| `src/portfolio-filesystem.js` | Portfolio virtual files and Markdown serialization |
| `src/view-lifecycle.js`, `src/utils/` | View cleanup and shared helpers |
| `remote-browser/` | Optional remote Chromium service |
| `vendor/` | Reproducible SDK tarball and upstream source notes |

`src/portfolio-data.js` maps project media; `src/experience-content.js` selects and captions experience media. Content checks validate referenced IDs and files. Preserve JSON schemas, app IDs, DOM classes, saved language keys, and virtual file paths when changing the host.

## Checks

```sh
npm run test:unit
npm run test:e2e
npm run qa
```

`qa` runs unit/content checks, builds, and runs the browser suite against a fresh production preview on port 4183. The development browser suite uses port 4173. Use `PLAYWRIGHT_CHANNEL=chrome` with an installed Chrome, or install the Playwright browser matching the lockfile. To check an existing production build, run `npm run test:preview`.

The screenshots document the captured browser views. Safari, Firefox, and physical mobile devices were not checked for this documentation update.

## Deployment

[GitHub Actions](.github/workflows/deploy.yml) installs dependencies with Node.js 22, runs unit/content checks, builds, and deploys `dist/` to GitHub Pages on pushes to `main` or a manual workflow run.

The build preserves previously published `/legacy/public/{*.json,thumbnails/*}` URLs by copying active data and media into compatibility paths. It does not deploy the archived apps.

## Credits

The transparent mark and lockup are reused from [DindbOS brand assets](https://github.com/Dindb-dong/dindbos/tree/main/docs/assets/brand), including the original alpha transparency. The upstream SDK is MIT-licensed; its license and artwork provenance are included in the vendored package. Linked projects and third-party materials retain their own licenses.
