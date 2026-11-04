# DindbOS source package

- Repository: https://github.com/Dindb-dong/dindbos
- Main source: `5f477cbdc513dd8fbd823f4411a24c8dda300632` (PRs #314 and #315 merged)
- Portfolio components retained from: `8f9d5d1e9abf18da67e13cad5572c76b74269356`
- Package: `dindbos@0.2.3` (portfolio integration build, not an npm release)
- Built on: 2026-11-04

This package combines main's NFC paths, terminal commands, adaptive Dock rendering
and customization tokens with the portfolio's existing mobile tab bar and searchable selector.
The checked-in tarball and lockfile integrity keep local and CI installs reproducible;
no sibling checkout or unpublished npm version is required.
The upstream MIT license and artwork provenance are included in the tarball.
The DindbOS project thumbnail remains from the previous portfolio revision.

To rebuild, check out the main source commit above in an isolated checkout, then run:

```sh
git apply /path/to/portfolio/vendor/dindbos-0.2.3-source.patch
npm ci
npm run build:sdk
npm pack
```

The source patch contains the retained portfolio components and package version,
relative to the main source commit above. It preserves their tests and documentation.
