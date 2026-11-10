# DindbOS snapshot

`dindbos-platform-preview.tgz` is a self-contained build of [DindbOS](https://github.com/Dindb-dong/dindbos) source commit `64bc34c`, based on `1c659c5`. It includes configurable platform shells, app interiors/icons, automatic visitor/rotation rules and the `ui.visitorOS` option used by portfolio query links.

The searchable selector and mobile tab bar from this portfolio's previous `0.2.3` source patch are retained in the SDK source and build. Existing project-picker behavior does not depend on an unpublished npm registry package. The archive retains the upstream source package's `0.2.0` metadata; this snapshot is not an npm release or a removal of the previous portfolio controls.

SHA-256: `31160e43a790567401422f80478f98474dea122d636d257b19a9df4ffe480021`.

`dindbos-platform-preview-source.patch` records the complete source delta from `1c659c5`, including those retained controls. To rebuild, check out that upstream commit, apply the patch, run `npm ci`, `npm run build:sdk` and `npm pack`, then rename the generated archive to `dindbos-platform-preview.tgz`. Repacking can change archive integrity; update the portfolio lockfile when replacing the archive.

The portfolio installs the checked-in archive with `npm ci`; it does not need a symlink, local SDK checkout or registry publication.

The upstream MIT license and artwork provenance remain in the archive. Legacy selector/tab-bar code retains the implementation previously integrated from source `8f9d5d1e9abf18da67e13cad5572c76b74269356`.
