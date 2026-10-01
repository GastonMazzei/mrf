# MARSUPIAL RF website

Bilingual English / Spanish static website. HTML, CSS and vanilla JavaScript; no build step or package installation required.

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

`CNAME` contains `marsupialrf.com`. A CNAME file alone does not enable hosting. At inspection on 2026-09-30, `Marsupial-RF/mrf` was a fork with GitHub Pages disabled, while its parent `GastonMazzei/mrf` had Pages enabled. Confirm the intended publishing repository and domain configuration before deployment. A pull request in this fork does not automatically update the live domain.
