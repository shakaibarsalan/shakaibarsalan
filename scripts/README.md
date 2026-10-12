# Profile images

Every image in the profile README is generated here, so text, spacing and colours stay consistent and can be changed in one place.

```bash
cd scripts
npm install
npm run assets   # header, stack, project logos and buttons, into ../assets
```

- `build-assets.mjs` has the header text and the project logos (`projectIcons`). The project names and one-line descriptions live in the README tables.
- `lib.mjs` has the colours for both themes and turns text into SVG shapes with the fonts in `assets/fonts`, so the images look the same on every device.
- `stats.mjs` draws the live stats card. `.github/workflows/stats.yml` runs it every day and puts the result on the `stats` branch, so main gets no daily commits. To run it locally: `GITHUB_TOKEN=... npm run stats` (writes into `../out`).

Fonts: Inter Tight and IBM Plex Mono, both under the SIL Open Font License (see `assets/fonts`).
