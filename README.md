# Schools in Victoria

Data Visualisation 2 — Draft V2, by Yousif Gaggi.

**Public visualisation:** https://Yousif-ggi.github.io/Schools-in-Victoria/

Twelve visualisations explore school locations, sectors, school types, enrolment and residents aged 5–19. The geographic analysis combines official 2025 Department of Education and ABS data. A separate historical chart includes the latest 2026 school counts.

## Run locally

Serve this directory with any static web server, for example `python -m http.server 8000`, then visit `http://localhost:8000`. Opening index.html directly as a file does not support the required JSON fetches.

## Files

- `index.html`, `styles.css`, `app.js`: page, layout and chart loader.
- `specs/`: twelve readable Vega/Vega-Lite specifications.
- `data/`: derived official data and simplified boundaries.
- `vendor/`: pinned chart libraries and their licence notices.
- [Methodology](methodology.md): sources, processing, encodings, checks and limitations.

## GitHub Pages

Publish from branch `main`, folder `/ (root)`. No build step is required.

## Draft status

Prepared for studio critique on layout, chart choices, legibility and storytelling. It is not labelled as the final assessment submission. The hand-drawn A4 sketch is separate.

Source data retain their publishers' licences and attribution; the chart libraries retain their own licences.
