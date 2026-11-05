# Archived portfolio implementations

This directory is a frozen historical snapshot, not an input to the current site.

- `src/`, `public/`, and the package files preserve the previous React application.
- `shell/app.js` and `shell/styles.css` preserve the later standalone desktop shell. They have no active entry point; their original relative URLs are historical.

Edit current JSON in `../public/portfolio/data/` and current project media in
`../public/portfolio/media/` only. Archived copies are intentionally not synchronized.
The current site boots through `../src/main.js`. Production compatibility URLs
under `/legacy/public/` are generated from the active files by `scripts/copy-static.mjs`.
In development those old URLs may show the frozen archive; use `/portfolio/`.
