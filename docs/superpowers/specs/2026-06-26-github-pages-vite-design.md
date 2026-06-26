# GitHub Pages Vite Design

## Goal

Convert the exported NEXTORY static publishing files into a GitHub Pages-ready static site built with Vite while preserving the current security corporate blue design concept.

## Design Constraints

- Keep the 12 existing user-facing HTML routes as separate pages.
- Preserve the visual direction from `docs/design/DESIGN-HANDOFF.md` and `docs/design/brand-spec.md`: white enterprise canvas, cool blue hero wash, strong solution grids, navy CTA/footer, restrained corporate security tone.
- Use only HTML, CSS, and JavaScript for site source code.
- Rename `css/site.css` to `src/index.css` and `js/site.js` to `src/index.js`.
- Reuse duplicated header and footer through source partials.
- Keep only image assets referenced by production pages.

## Architecture

- Source pages live in `src/pages`.
- Shared snippets live in `src/partials`.
- Production assets live in `src/assets`.
- `scripts/build-pages.js` resolves partial include comments into `.vite-pages`.
- Vite builds `.vite-pages` multi-page HTML entries into `dist`.
- Relative asset paths are used so GitHub Pages project pages work without repository-name-specific configuration.

## Verification

- `npm run build` must generate `dist`.
- Generated HTML must include `index.css` and `index.js` bundles.
- All referenced production image assets must resolve from the built output.
