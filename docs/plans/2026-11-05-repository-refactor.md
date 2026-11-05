# Repository refactor — 2026-11-05

Requested review: GPT-6 Astra, high reasoning, read-only repository inspection.
The implementation follows these priorities from that review:

1. Promote active JSON/media out of the archived React application's public tree.
   Preserve the frozen originals and generate published URL compatibility from
   current files at build time.
2. Give mounted views a single `{content, render, dispose}` owner. Replace the
   previous disposer on every render, dispose only content actually replaced,
   and use the current disposer when closing a window.
3. Separate OS boot, app registration/navigation, the project browser, and VFS
   serialization. Preserve app IDs, selectors, saved locale keys, and VFS paths.
4. Share only demonstrated duplicates: HTML/attribute escaping, sorted unique
   values, and first-text selection. Add no dependency or general routing layer.
5. Run Vite in `dev:full`, remove the stale optional 0.1.0 SDK copy, wire unit and
   data checks into CI, and exercise built assets with a dedicated preview server.

The review identified a concrete lifecycle hazard: navigation from an inline
Projects view to a separately open Resume view could dispose the source controls
without replacing that source DOM. The regression suite covers that flow,
filter rerendering, subsequent navigation, and close/reopen behavior.

Deferred: CSS splitting, wholesale i18n/profile-schema changes, framework adoption,
and remote-browser redesign. None is necessary to establish these boundaries.
The current UI and content remain the compatibility target; this is nonvisual
maintenance and does not change the design board.

## Validation record

- `npm run test:unit`: 8/8 passed (filters, escaping, locale fallback/error
  paths, content/media/presentation references, VFS contracts, view disposal).
- `npm run build`: passed. The SDK-containing JS bundle still exceeds the
  existing 1,200 kB warning threshold; bundle splitting was not part of this change.
- `PLAYWRIGHT_CHANNEL=chrome npm run test:preview -- --workers=1 --reporter=list --global-timeout=240000`:
  57/57 passed in 1.8 minutes, exit status 0, against the production preview.
  This includes the 54 existing browser cases and 3 new structural regressions.
- Relative-import graph check: all 13 source modules resolve without cycles.
- `git diff --check`: passed.
- GPT-6 Astra post-implementation review: no blocking architectural or correctness
  findings in the inspected changes. The reviewer checked unchanged data/media
  copies and preservation of the archived shell before the active media README
  was updated to describe current behavior.

Local browser notes: the default Playwright Chromium executable was absent, so
checks used installed Chrome. A parallel run passed all 57 assertions but needed
interruption during worker shutdown. A two-minute serial attempt reached 52 tests
before its time limit; the final four-minute serial command completed normally.

Not exercised: Safari/Firefox, the optional remote-browser service end to end,
or a production deployment. `dev:full` was syntax-checked and now invokes the
existing Vite command; no backend dependencies were installed for this refactor.
No merge, push, or deployment was performed.
