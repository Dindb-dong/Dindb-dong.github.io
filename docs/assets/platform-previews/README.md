# Portfolio runtime evidence

Captured from the actual portfolio on 2026-11-10 in installed Chrome, using the vendored SDK snapshot. These are browser viewport previews, not physical-device captures.

- Portrait viewport: 390 × 844; landscape: 844 × 390.
- `?device=ios&ln=en&intro=0`: Samsung-inspired Android in portrait, Windows in landscape.
- `?device=android&ln=en&intro=0`: iOS in portrait, macOS in landscape.
- Portrait screenshots show the initial Overview after boot and portrait-image loading. Landscape screenshots show Projects after searching and selecting DindbOS.
- The recording shows the iOS visitor flow: boot, select DindbOS in Projects, rotate to Windows, then return to the mobile view with the selection preserved.

Reproduce with the repository's existing runner:

```sh
PLAYWRIGHT_CHANNEL=chrome npx playwright test tests/platform-previews.spec.js --workers=2
```
