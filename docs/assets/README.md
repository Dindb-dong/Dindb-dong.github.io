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

## Experience and language update

- `experience-ko-before.jpg` and `experience-en-before.jpg`: actual 390×844 CSS-pixel browser captures before the final mobile typography and English tab-label adjustment.
- `experience-ko-mobile.jpg` and `experience-en-mobile.jpg`: actual 390×844 captures of the final local production preview on 2026-11-05, showing the contribution bullets at 13px / 1.65, 15px section headings, and Impact / Media tabs in English.
- `language-experience.webm`: actual 390×844 Chrome recording of the existing `tests/language.spec.js` English URL-override test, including opening the experience app. Recorded against the final production build on 2026-11-05; no browser UI is composited.

These captures verify browser viewport behavior, not physical mobile hardware.
