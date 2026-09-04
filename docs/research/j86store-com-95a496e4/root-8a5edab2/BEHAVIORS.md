# Behaviors — j86store.com home

Sweep performed with Playwright at 1440 / 768 / 390. Values are `getComputedStyle()` output.

## Scroll sweep
- Header: `position: relative` at scroll 0 and 400 → **not sticky**. No class/bg/shadow change. (`#sticky-nav` id is misleading.)
- No IntersectionObserver reveal animations. `.animate.fadeInRight` classes exist on the two social `<ul>`s but no keyframe named fadeInRight is defined in loaded CSS → no visible animation.
- No scroll-snap, no Lenis/Locomotive.
- Images use WP lazy-load (`.lazyloaded`), i.e. they fade in on load only.

## Time-driven
- **HeroSlider** (`#metaslider_1018`, FlexSlider): `slideshowSpeed: 5000`, `animation: "fade"`, `animationSpeed: 300`, `controlNav: true`, `directionNav: true`, `pauseOnHover: false`, loops. Fade first slide: false. Active slide `z-index: 2`, others `opacity: 0`.

## Hover sweep
| Element | Property | Default → Hover | transition |
|---|---|---|---|
| Main menu `#top-menu > li > a` | color / background / radius | `rgb(34,34,34)` / transparent / 0 → `rgb(255,255,255)` / `rgb(50,124,219)` / `1px` | `all` (0s) |
| "Product Categories" `a` | already blue; radius `8px 8px 0 0` → `1px` on hover; opens child `ul` | display block, `box-shadow: rgba(0,0,0,0.2) 0 8px 12px`, border `1px solid rgb(221,221,221)`, bg white, width 242px, left aligned to item +7px | none |
| Dropdown items | (theme CSS) hover bg `rgb(50,124,219)`, color white | | |
| TopBar / footer Facebook `a` | `transition: 0.3s ease-in-out` (no visible property change measured) | | |
| Sidebar category `a` | color `rgb(101,100,100)` → `rgb(50,124,219)` | `all` |
| Footer links `a` | color `rgb(255,255,255)` → `rgb(204,204,204)` | `all` |
| Product card image `img` | `box-shadow: rgba(255,255,255,0.1) 0 0 0 3px` → `rgb(59,160,244) 0 0 0 3px` (3px blue ring) when hovering the card link | `all` |
| Product title | color `rgb(101,100,100)` → `rgb(50,124,219)` when hovering the card link | |
| Add-to-cart button | color `rgb(255,255,255)` → `rgb(50,124,219)`; bg stays `rgb(50,55,60)` | `all` |
| Category card | no change (shadow constant `rgb(207,207,207) 0 2px 18px -4px`); link color change only affects invisible text | |
| Search submit button | `transition: background 0.2s` (bg stays `rgb(50,124,219)`) | |
| Slider arrows `.flex-prev/.flex-next` | opacity 0 → 0.8; left −50px → 5px / right −50px → 5px; bg image `bg_direction_nav.png` (sprite, 30×30, next uses `background-position: -30px 0`) | `0.3s` |
| Slider dots `a` | 11×11 circle bg `rgba(0,0,0,0.5)`; active `rgba(0,0,0,0.9)`; hover `rgba(0,0,0,0.7)` (FlexSlider default) | |

## Click sweep
- Slider dots: jump to slide n (fade 300ms). Arrows: prev/next.
- Mobile `#main-menu-toggle` ("Menu"): toggles `.toggled-on` on `nav`; button text color/border → `rgb(50,124,219)` 1px solid, icon bars → close; list appears below (no animation measured; `transition: background-color 0.4s ease-in-out` on button).
- Search form submits to `/?s=<q>&post_type=product&product_cat=<slug>`.
- Add-to-cart links `?add-to-cart=<id>` (AJAX in WooCommerce). Clone: plain links.
- Price filter: two overlapping `<input type=range>` (min 59000, max 2590000) drive a gradient progress bar and two text inputs showing `59000VNĐ` / `2590000VNĐ`.

## Responsive sweep (breakpoints = Bootstrap 3: 768 / 992 / 1200)
- 1440: sidebar 390 / main 780; categories 4/row; products 3/row.
- 768: TopBar visible, wraps; sidebar 250 / main 500; categories 2/row (226px); products 3/row (162px); menu inline, no toggle.
- 390: TopBar hidden; header centered & stacked; "Menu" toggle; sidebar stacked above main; categories 2/row (172.8px); products 1/row; slider 360×146; footer stacked.

## Scroll-driven visibility (found in the second sweep)
- `#scroll-cart` and `#scroll-btn` are `display: none` at scroll 0 and `display: block` after scrolling (theme JS; threshold not exposed — clone uses 100px). Clicking `#scroll-btn` scrolls to top.
