# Artwork and capture provenance

- `../../public/brand/dindbos-mark.png` and `../../public/brand/dindbos-lockup.png`: copied unchanged from the DindbOS repository's `docs/assets/brand/` directory. The mark supplies the site favicon; the README uses the lockup in light appearance and the mark in dark appearance. Both retain the upstream PNG alpha channel. See [upstream provenance](https://github.com/Dindb-dong/dindbos/blob/main/docs/assets/README.md).
- `portfolio.jpg` and `projects.jpg`: actual local production-preview captures of this repository's portfolio overview and project archive on 2026-11-05, using the Codex in-app browser's desktop viewport. No UI was composited into them.
- `mobile.jpg` and `mobile-projects.jpg`: actual captures of the same build with a measured 390×844 CSS-pixel viewport. Browser viewport inspection is not physical-device validation. The capture bounds contain only the page viewport.

To visit the same build locally:

```sh
npm ci
npm run build
npm run preview -- --port 4185 --strictPort
```

Open the preview in a browser, capture the initial Portfolio overview, then choose Projects. For mobile captures, use a 390×844 CSS-pixel viewport and repeat those views. Local storage and the clock can change the appearance between captures.
