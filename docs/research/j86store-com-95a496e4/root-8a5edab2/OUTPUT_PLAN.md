# Output Plan — https://j86store.com/

| Item | Value |
|---|---|
| Target URL | `https://j86store.com/` (WordPress + WooCommerce, theme "New York Business" / "ecommerce-storefront", Elementor, MetaSlider) |
| `<app-root>` | `.` (repository root, untouched template at start) |
| `<site-key>` | `j86store-com-95a496e4` (origin slug + sha256("https://j86store.com")[:8]) |
| `<page-key>` | `root-8a5edab2` (sha256("/")[:8]) |
| Destination route | `/` → `src/app/page.tsx` (replaces the template scaffold; first single-URL clone) |
| Artifact root | `docs/research/j86store-com-95a496e4/root-8a5edab2/` |
| Screenshot root | `docs/design-references/j86store-com-95a496e4/root-8a5edab2/` |
| Component root | `src/components/sites/j86store-com-95a496e4/root-8a5edab2/` |
| Shared components | `src/components/sites/j86store-com-95a496e4/shared/` (icons) |
| Asset root | `public/sites/j86store-com-95a496e4/root-8a5edab2/images/` (150 files, 16.3 MB) |
| Shared assets | `public/sites/j86store-com-95a496e4/shared/fonts/` (Google Sans 400/500, Oswald 300/400/500, FontAwesome 4.7) |
| Downloader | `scripts/download-assets-j86store-com-95a496e4-root-8a5edab2.mjs` |
| Types | `src/types/j86store.ts` |

## Existing routes before this run
- `/` — template scaffold placeholder ("Clone target not yet built"). Replaced (allowed for first root clone).
- `/_not-found` — Next default.

## Shared foundation changes
- `src/app/globals.css`: fonts (@font-face), Bootstrap-3 breakpoints (sm 768 / md 992 / lg 1200), site palette on shadcn tokens, `--j86-*` tokens, range-slider utility.
- `src/app/layout.tsx`: `lang="vi"`, site title + favicons, Geist fonts removed (site uses Google Sans / Oswald).
- `src/app/favicon.ico` removed (replaced by metadata icons pointing at the downloaded favicons).

## Browser automation used
Playwright (Chromium) via the Python venv of the sibling `screenshot-to-code/backend` project — no Chrome MCP was available in this session.
