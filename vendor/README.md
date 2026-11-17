# DindbOS snapshot

`dindbos-84abc14.tgz` is the SDK built from [DindbOS revision 84abc14](https://github.com/Dindb-dong/dindbos/tree/84abc14feb2f7f3738d5f4f09e23c19d985f9f2e). The portfolio installs the archive with `npm ci`. The upstream package metadata remains `0.2.0`.

SHA-256: `51e8ef73242c2e2edc330d4088fca712c94f22c4aca6072584b8dc1f58063af1`.

To refresh the snapshot, check out the target upstream revision, run `npm ci`, `npm run build:sdk`, and `npm pack`. Rename the archive for the new revision, update the dependency and lockfile, and set `DINDBOS_REVISION` in the Pages workflow to the same commit. The workflow builds the standalone showcase at [`/dindbos/`](https://dindb-dong.github.io/dindbos/), and publishes its source revision in `/dindbos/revision.txt`.

The archive retains the upstream MIT license and artwork provenance. The showcase includes the Doom engine's corresponding source and license. Players supply their own Doom game data.

The main portfolio desktop also uses the Doom and Nested DindbOS views from this revision. The views in `src/apps/showcase/` use the portfolio's app registration through `src/apps/showcase.js`. The root deployment serves the same Doom engine, license, and corresponding source from `public/vendor/doom/`.
