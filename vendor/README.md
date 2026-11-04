# DindbOS source package

- Repository: https://github.com/Dindb-dong/dindbos
- Commit: `8f9d5d1e9abf18da67e13cad5572c76b74269356`
- Package: `dindbos@0.2.2`
- Built on: 2026-11-04
- Build: `npm run build:sdk`, then `npm pack`

The upstream README documents APIs newer than the published npm 0.1.1 release.
The checked-in tarball keeps local and CI installs reproducible without a sibling checkout.
`npm ci` installs it through the relative file dependency and lockfile integrity.
The DindbOS project thumbnail comes from this revision's `docs/assets/desktop.png`.
The upstream MIT license and artwork provenance are included in the tarball.

0.2.1 adds the shared mobile liquid-glass tab bar used by the portfolio and career apps.

0.2.2 exports the shared searchable selector used by the project browser.
