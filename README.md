# Billiards Visualisations

Tom Goertzen and Maxwell Liu

Interactive visualisations for the corrected Billiards conjecture, tilting
characters and three-row symmetric-group decomposition numbers.

## Website

The intended public address, once GitHub Pages is enabled, is:

https://tomgoertzen.github.io/DecompositionNumbersFromBilliards/

To enable publishing, open this repository's **Settings > Pages**, choose
**Deploy from a branch**, select **main** and **/(root)**, and save.
Subsequent pushes to `main` update the website automatically. The `.nojekyll`
file makes this a plain static site; no build or dependency installation is
required. If Pages is unavailable for a private repository, check the
repository owner's GitHub plan before changing repository visibility.

## Files

- `index.html`: page text, controls and references.
- `assets/css/styles.css`: styling.
- `assets/js/range.js`: interactive visualisations and browser calculations.
- `assets/fonts/` and `assets/vendor/`: bundled fonts and KaTeX, including licences.
- `data/billiards_base_characters.js`: precomputed base characters.
- `documents/maxwell-liu-honours-thesis.pdf`: the unmodified honours thesis linked from the page.
- `THIRD_PARTY_NOTICES.txt`: attribution, asset sources and permission notes.

All required website assets are local. Open `index.html` directly, or run
`python3 -m http.server 8765` and visit `http://127.0.0.1:8765/`.
No Magma or GAP installation is required by the browser.

The previous GAP helper remains recoverable from the repository's Git history.
