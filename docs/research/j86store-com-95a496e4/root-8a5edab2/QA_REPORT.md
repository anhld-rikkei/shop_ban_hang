# QA Report — https://j86store.com/ → `/` (2026-09-04)

Comparison method: Playwright (Chromium) screenshots + `getBoundingClientRect()` of the same landmarks on the live site and on `http://localhost:3000/`.
Clone screenshots: `docs/design-references/j86store-com-95a496e4/root-8a5edab2/qa/`.

## Desktop 1440 (original page height 7500 → clone 7498)
| Landmark | Original | Clone |
|---|---|---|
| header | 0 / 300 tall | 0 / 300 |
| main nav bar | y 250, h 50 | y 250, h 50 |
| logo | 150,38 355×178 | 150,38 355×178 |
| search form | 555,119 566×44 | 555,119 566×44 |
| content container | 135,320 1170×6703 | 135,320 1170×6701 |
| slider | 540,340 750×305 | 540,340 750×305 |
| "DANH MỤC SẢN PHẨM" h2 | y 685 | y 685 |
| first "Mua hàng" button | 594,2792 132×55 | 594,2794 132×55 |
| footer | y 7044, h 457 | y 7042, h 457 |
| footer title | 150,7083 263×59 | 150,7081 263×59 |
Fonts verified via `document.fonts.check`: Google Sans, Oswald, FontAwesome all loaded. Console: 0 errors.

## Mobile 390 (original 21772 → clone 21863, +0.4%)
| Landmark | Original | Clone |
|---|---|---|
| header height | 422 | 420 |
| sidebar | y 462, h 1066 | y 470, h 1076 |
| product card (1 col) | 376×529 | 376×530 |
| "SẢN PHẨM MỚI NHẬP" h2 | y 4859 | y 4894 |
| "THỰC PHẨM CHỨC NĂNG" h2 | y 11244 | y 11294 |
| "Mom And Baby" h2 | y 17552 | y 17618 |
| footer | y 20773, h 998 | y 20854, h 1009 |
| floating cart tiles | 356,506 36×148 | 356,506 36×148 |
| back-to-top button | 340,794 | 340,794 |
| horizontal overflow | none | none (fixed with `overflow-x: clip` on `#content`) |

## Interaction checks
- Nav hover → blue background / white text; "Product Categories" dropdown (242px, 10 items) matches `nav-categories-dropdown.png`.
- Product card hover → title blue + 3px `rgb(59,160,244)` image ring; button hover → blue text.
- Slider autoplays (5s fade), dots + hover-revealed arrows work.
- Mobile "Menu" toggle opens the list, icon switches bars → close, button turns blue.
- Price filter thumbs move the progress bar and update both text boxes.
- Floating widgets appear after 100px of scroll; back-to-top scrolls smoothly.

## Fixes applied during QA
1. 8px top gap above the tagline (collapsed margin of the empty `h1.site-title`).
2. Category grid trailing row gap (`pb-[47.87px]`) + removed extra section padding.
3. Footer Facebook iframe rendered inline (adds the 6px baseline gap of the original).
4. Body line-height 18.4px on xs (theme uses 1.15 below 768px) → price row, button (49px), copyright.
5. Add-to-cart wrapper height follows the button instead of fixed 55px.
6. `#content { overflow-x: clip }` so the off-canvas slider arrows do not widen the mobile layout.
7. Added `FloatingWidgets` (fixed cart/wishlist/account tiles + back-to-top) discovered in a second scroll sweep.

## Known gaps / deviations
- 769–991px: category grid shows 2 columns (original WooCommerce switches to 4 at 769px inside a 500px column). Chosen for legibility; flip `md:grid-cols-4` to `sm:` to match exactly.
- Facebook page embed depends on third-party cookies; may render blank in some browsers (same as original).
- Search, add-to-cart, wishlist, cart and category links point at the original URL paths but no backend exists in the clone.
- Mobile total height +91px (0.4%) spread over section spacing; desktop within 2px.
- Builders worked directly on disjoint files in the main tree instead of git worktrees (node_modules is not available inside worktrees on this Windows setup).
