# MARSUPIAL RF website

Static English / Spanish / Brazilian Portuguese website. HTML, CSS and vanilla JavaScript; no package installation required. The homepage separates products and services, with country selection independent of language and regional editions.

## Regional catalogue

Edit `data/families.json` for product and service descriptions, `data/markets.json` for regional ordering, and `data/pt-BR.json` for Portuguese translations. Run `python3 scripts/build_families.py` followed by `python3 scripts/build_regions.py` after changing those sources; commit the generated pages as well. The site serves `/es/`, `/en/`, and `/br/` editions for LATAM, US/Canada, Europe, Africa, Asia, and the global fallback.

`country.js` suggests a country using a client-side IP lookup, offers manual selection if it fails, and saves the visitor's choice. Location never prevents visiting another regional edition. The country dialog can be reviewed with `?choose-country=1`. `familias.html` contains the catalogue and three-level navigation; `portfolio.html` contains the case studies. `prototype.css` and `studio.css` define the current layout.

French, German, Italian and Russian translations, several requested service photos, and further catalogue refinements remain pending. Do not present placeholder diagrams or conceptual renders as manufactured hardware or measured results. Internal review galleries and source-document identifiers are excluded from publication.

## Preview locally

From this directory, run `python3 -m http.server 8000`, then open <http://localhost:8000>.

## Where to edit

| Content | File |
| --- | --- |
| Homepage, featured MRF projects, projects we follow | `index.html` |
| Product details and catalogue links | `products.html` |
| Research and collaborations | `technical.html` |
| Opportunities | `opportunities.html` |
| Company vision | `nuestra-vision/index.html` |
| Shared visual styles | `styles.css` |
| Language selection, translated alt text, footer year | `site.js` |
| Website photos | `assets/` |
| Product images and downloadable catalogues | `products/`, `documents/` |

## Updating featured projects

Edit the `featured-projects` section in `index.html`. Keep each card short: a real image, a title, one paragraph, and a link to the corresponding product or research section. Match technical claims to the product page. Give new images their real dimensions and descriptive EN/ES alt text.

The “Projects we follow” section credits independent projects. It does not imply a partnership, endorsement, or tested compatibility. Keep manufacturer links next to the descriptions; recheck their documentation before changing claims.

External references checked on 2026-09-30:

- [ESPARGOS One](https://espargos.net/espargos-one/): eight synchronized ESP32 receivers and Wi-Fi CSI.
- [ESP-SDR](https://espargos.net/espsdr/) and [firmware README](https://github.com/ESPARGOS/esp-sdr): undocumented receiver debug path; raw IQ is captured in bursts with gaps, not continuous full-rate streaming.
- [Scale RF / QuadRF](https://www.crowdsupply.com/scale-rf/quadrf): 4 RX / 4 TX MIMO platform with FPGA and Raspberry Pi 5. Avoid blanket open-hardware claims: the campaign distinguishes open software from a protected RF core.
- [KrakenSDR](https://www.krakenrf.com/about-krakensdr): five coherent receive channels, shared clock, calibration hardware.

## Language and layout checks

Maintain matching `.lang-en` and `.lang-es` text. Image descriptions use `data-alt-en` and `data-alt-es`. Check both language buttons, linked section anchors, keyboard focus, and mobile and desktop widths before merging. Project cards and their links are present in the HTML even with JavaScript disabled.

## Existing archives and compatibility

`old/`, `*.bkp.*`, `mrf_redesign_site.zip`, and `REDESIGN_NOTES.txt` are legacy material. The `productos/` image directory overlaps `products/`; older pages may depend on it. Audit incoming links before moving or deleting any of these files. Spanish redirect pages preserve existing URLs.

Keep original social-media footage in Drive, not in this website repository. Add optimized, approved exports only when a page uses them.

## Deployment

`CNAME` contains `marsupialrf.com`. On 2026-11-01, GitHub Pages for `GastonMazzei/mrf` publishes the root of `main` to that domain; Pages is not enabled on `Marsupial-RF/mrf`. A push to the organization fork alone does not update the live domain. Preserve the domain and use a fast-forward or reviewed merge into the publishing repository, then verify the served HTML and regional assets. `.nojekyll` keeps this a static deployment.
