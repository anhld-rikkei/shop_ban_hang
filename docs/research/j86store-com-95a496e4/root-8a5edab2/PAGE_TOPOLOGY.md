# Page Topology — j86store.com home (desktop 1440×7500)

Body background `rgb(255,249,249)`, text `rgb(25,25,25)`, base font "Google Sans" 16px / 24px.
No smooth-scroll library, no scroll-snap, no sticky header (header is `position: relative`, `z-index: 9999`).
Bootstrap 3 grid: `.container` max-width 1200px (padding 0 15px) → inner 1170px.

| # | Section (working name) | y-range | Layout | Interaction model | Component |
|---|---|---|---|---|---|
| 1 | **TopBar** (`.mini-header`) | 0–33 | full-width white, 1200 container, contacts left (phone, email, address, hours) + Facebook icon right | static; hidden on xs (<768) | `TopBar.tsx` |
| 2 | **HeaderMain** (logo + search + wishlist/cart) | 33–250 | 1200 container, flex align-center: logo col 390px, search col 596px, cart col 154px | static; search select/input | `SiteHeader.tsx` |
| 3 | **MainNav** (`#sticky-nav` — NOT sticky despite the id) | 250–300 | white 50px bar, centered `<ul>` | hover-driven: blue bg on item hover; hover on "Product Categories" opens 242px dropdown | `MainNav.tsx` |
| — | header bottom border | 300 | `1px solid rgb(217,217,217)` on `<header>` | | |
| 4 | **Content wrapper** (`#content > .container.background`) | 320–7023 | max-width 1170, margin 20px auto, padding 0 15px; `.row` −15px | two columns: sidebar `col-md-4` 390px (33.33%) / main `col-sm-8` 780px (66.67%) | `page.tsx` |
| 5 | **Sidebar** (`#secondary`) | 340–1430 | 360px wide inside 390 col | static; link hover → blue; price slider is stateful | `Sidebar.tsx` (CategoryWidget + PriceFilterWidget) |
| 6 | **HeroSlider** (MetaSlider / FlexSlider) | 340–645 (+40 margin) | 750×305, radius 4px, dots 27px below | time-driven: fade every 5000ms, 300ms fade; arrows appear on hover | `HeroSlider.tsx` |
| 7 | **CategoryGrid** ("DANH MỤC SẢN PHẨM") | 685–2290 | h2 + `ul.products.columns-4`: 4×5 cards 165×235, gap 28.5px, row gap 47.87px | hover: image color-ring none, card static (shadow constant) | `CategoryGrid.tsx` |
| 8 | **SectionHeading** ("SẢN PHẨM MỚI NHẬP") | 2311–2438 | hr / h2 link / hr / empty p | static; link hover blue | `SectionHeading.tsx` |
| 9 | **ProductGrid** (new products, 12) | 2454–4156 | flex-wrap 3 cols, li 33.33% w/ 8px transparent side borders | hover: title → blue, image ring 3px `rgb(59,160,244)`, button text → blue | `ProductGrid.tsx` |
| 10 | SectionHeading ("THỰC PHẨM CHỨC NĂNG") | 4176–4304 | same as 8 | | |
| 11 | ProductGrid (functional foods, 12) | 4320–6003 | same as 9 | | |
| 12 | SectionHeading ("Mom And Baby") | 6023–6150 | wrapped in `wp-block-group` (same look) | | |
| 13 | ProductGrid (Mom and baby, 6) | 6166–7007 | same as 9 | | |
| 14 | **Footer** (`#colophon`) | 7044–7500 | bg `rgb(26,27,28)`, 1200 container, 4 × `col-md-3` widgets, centered FB circle, copyright row with top border | link hover → `rgb(204,204,204)` | `SiteFooter.tsx` |
| 15 | YITH quick-view modal (hidden) | — | fixed, only opens on product quick-view | out of scope (no trigger on home) | — |

## Z-index layers
- header 9999 (dropdown ul 99999)
- sidebar `aside` 9990 (WooCommerce widget quirk, no visual effect)
- slider container z 0; direction nav z 10; control nav z 2

## Responsive
- **≥1200**: as above.
- **992–1199 (md)**: container 970px; same columns.
- **768–991 (sm)**: container 750px; TopBar visible (wraps to 2 lines, 50px), logo 196px, search 336px, cart/wishlist to the right of search; sidebar 250px col (220 inner) / main 500px; category cards 2 per row (226px); product cards 3 per row (162px); footer 4 columns; nav menu still inline (toggle hidden).
- **<768 (xs)**: TopBar hidden; header stacks & centers: logo 310px, tagline 13px, search 300px, cart/wishlist centered, "Menu" toggle button (Arial 14px/800) opens vertical list (white, items 34px, 1px `#eee` separators, "Product Categories" hidden); sidebar full-width above main; slider 360×146; categories 2 per row (172.8px); products 1 per row (flex 1 0 100%); footer columns stack, each full-width.

## Fixed elements discovered after scrolling (all viewports)
| Element | Position | Notes | Component |
|---|---|---|---|
| `#scroll-cart.topcorner` | fixed; top 60%; right −2px; 36×148 (xs) / 36×164 (sm+) ; z 99999 | three white tiles: cart (+ badge "0"), wishlist, account | `FloatingWidgets.tsx` |
| `#scroll-btn.scroll-top` | fixed; right 10px; bottom 10px; 40×40; z 9999 | blue back-to-top button, fa-arrow-up | `FloatingWidgets.tsx` |

## Body line-height
`body { line-height: 18.4px }` below 768px, `24px` from 768px (affects price rows, add-to-cart button height 49 vs 55, footer copyright).
