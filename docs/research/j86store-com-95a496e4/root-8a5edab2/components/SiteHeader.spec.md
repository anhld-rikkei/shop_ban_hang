# SiteHeader Specification (TopBar + HeaderMain + MainNav)

Built by the orchestrator (shared header touches three sub-components that share one `<header>`).

## Overview
- **Target files:**
  - `src/components/sites/j86store-com-95a496e4/root-8a5edab2/TopBar.tsx`
  - `src/components/sites/j86store-com-95a496e4/root-8a5edab2/SiteHeader.tsx` (header element = TopBar + logo/search/cart row + MainNav)
  - `src/components/sites/j86store-com-95a496e4/root-8a5edab2/MainNav.tsx` (client: mobile toggle)
- **Screenshots:** `crop`-free: `desktop-1440-viewport.png` (y 0–300), `nav-categories-dropdown.png`, `mobile-390-viewport.png`, `mobile-menu-open.png`, `tablet-768-viewport.png`
- **Interaction model:** static header (NOT sticky); hover-driven nav (blue background, dropdown); click-driven mobile toggle.

## `<header>`
- position relative; z-index 9999; background rgb(255,255,255); border-bottom 1px solid rgb(217,217,217); total height 300.48px at 1440 (33 + 217 + 50 + 1)

## TopBar (`.mini-header`, hidden <768)
- display block; position relative; padding 2px 0; border-bottom 1px solid rgb(238,238,238); font 15px/22.5px Google Sans; height 33px (wraps to 50px at 768)
- container: max-width 1200px; margin 0 auto; padding 0 15px; display flex; align-items center; min-height 28px
- contacts col: width 66.67%; padding 0 15px → `ul` inline, color rgb(18,18,18)
  - li inline; every li after the first has margin-left 7px
  - icon `Fa` 15px, line-height 15px, inline-block; first icon has margin-left 7px (`.contact-margin`), others none; text `span` margin-left 7px
  - items: phone "0975564644" (fa-phone), email link `mailto:` "j86store.japan@gmail.com" (fa-envelope), address "Phan Rí Cửa, Tuy Phong, Bình Thuận" (fa-map-marker), hours "8:00 - 22:00" (fa-clock-o)
- social col: width 33.33%; padding 0 15px → ul float right (`ml-auto`): a inline-block 28×28; margin 0 1px; border-radius 25px; color rgb(18,18,18); text-align center; transition 0.3s ease-in-out; icon fa-facebook 18px / line-height 26px; href https://facebook.com/j86store

## HeaderMain row
- container max-width 1200px, padding 0 15px, margin auto; inner `.vertical-center` display flex; align-items center; height 216.9px desktop
- **Branding col**: width 33.33% (390px); position relative; z 3; padding 5px 15px
  - logo link: inline-block; padding-right 5px; img `cropped-cropped-cropped-j86-2` 453×227 → rendered 354.98×177.89 (max-width 100%; height auto; vertical-align middle)
  - `.site-branding-text` inline-block: h1 is empty (hidden) → omit or `sr-only` site title; `p.site-description` "ĐẸP MỖI GIÂY – KHỎE MỖI NGÀY": font 14px/21px Google Sans, color rgb(114,114,114)
- **Right col** (66.67% = 780px; display flex; align-items center; padding 0 15px)
  - search wrapper: flex 1 (596px); padding 0 15px → `#search-category` padding 30px 0; overflow hidden
    - form: position relative; z 100; height 44px; background white; border 1px solid rgb(230,230,230); border-radius 24px; overflow hidden
    - select wrapper `.search-cat`: absolute left 0 top 0; width 150px; height 42px; font-weight 700; text-transform capitalize; background: url(down-arrow-13b45a.png 13×7) no-repeat right 20px center; border-right 1px solid rgb(230,230,230) (visible divider at x≈706)
      - `select`: absolute; z 9999; width 150px; height 42px; padding 0 35px 0 15px; font Arial 13px/42px; color rgb(51,51,51); appearance none; background transparent; border 0; options = `searchCategories` (21 entries starting with "All Categories"); name `product_cat`
    - `input[type=search]` name `s`: width 100%; height 42px; padding-left 160px; padding-right 55px; font Arial 14px/42px; color rgb(51,51,51); border 0; border-radius 3px; outline none; placeholder "Search Products..." italic grey
    - submit `button`: absolute right 0 top 0; width 56px; height 42px; background rgb(50,124,219); color white; text-align center; transition background 0.2s; icon fa-search 21px (relative top −1.3px); aria-label "Search"
    - form `action="/"`, hidden `post_type=product`
  - cart col: width 154px; position relative; z 3; padding 5px 15px → inner centered: wishlist (heart 16px rgb(232,32,22), padding 6.4px 6.4px 6.4px 0, href /wishlist/) + cart (bag 16px rgb(51,51,51), padding 6.4px 0 6.4px 6.4px, href /cart/) with badge "0": 18×18 circle bg rgb(50,124,219), white 12px, positioned top-right of the bag (offset ≈ left 14px / top −14px)

## MainNav (`#sticky-nav`, white, height 49.6px desktop)
- container 1200/15px; row flex align-center; `.navigation-top` position relative z 3 (z 9999 on mobile); `nav` centered (`display table; margin auto` → `flex justify-center`)
- `ul#top-menu`: font Oswald 15px/22.5px; letter-spacing 1px; text-transform capitalize; text-align left; display flex (desktop)
  - **li "Product Categories"** (hidden <768): margin-right 10px; position relative; `a`: display block; padding 12px 11.25px; color white; background rgb(50,124,219); border-radius 8px 8px 0 0; icon fa-align-left before text (with space). Hover: border-radius 1px; child `ul` shown.
    - dropdown `ul`: position absolute; left 7px; top 100% (y 298 vs item bottom 299); width 242px; background white; border 1px solid rgb(221,221,221); box-shadow rgba(0,0,0,0.2) 0 8px 12px 0; z 99999; padding 0; text-transform none; letter-spacing normal
      - items `a`: display block; padding 11.25px 18.75px; font Oswald 15px/22.5px; color rgb(34,34,34); hover: background rgb(50,124,219), color white. 10 items (`categoriesDropdown`): CHỐNG NẮNG ( UV ); DƯỠNG THỂ ( BODY ); GIẢM CÂN ( DIET ); GỐC CHỊ EM CHÚNG MÌNH ( WOMEN ); KEM DƯỠNG DÀNH CHO MẶT ( FACE CREAM ); MẮT ( EYES ); MẶT NẠ ( MASK ); MOM AND BABY; NƯỚC HOA HỒNG ( LOTION ); PHỤC HỒI TÓC TẠI NHÀ ( HAIR )
  - **regular li** `a`: display block; padding 12px 11.25px; color rgb(34,34,34); background transparent; hover: color white, background rgb(50,124,219), border-radius 1px; no transition. Items: "Toàn Bộ Sản Phẩm" /shop/, "Góc Chia Sẻ" /category/goc-chia-se/, "LIÊN HỆ" /lien-he/, "My account" /my-account/ (rendered "My Account" by capitalize)
  - **search li**: `a` display block; padding 12.8px 12px; font-size 16px/24px; color rgb(238,238,238); icon fa-search 18px; hover bg blue/white; href "#search" (original opens a modal; the clone focuses the header search)
- **Mobile (<768)**: nav row height 38px; `button#main-menu-toggle`: display block; margin 1px auto 2px; padding 7px; font Arial 14px/21px weight 800; color rgb(53,50,50); border-radius 2px; border 1px solid transparent; transition background-color 0.4s ease-in-out; icon fa-bars 14px (relative top −2px; margin-right 7px) + "Menu". Open (`.toggled-on`): color + border rgb(50,124,219); icon fa-close.
  - open list `ul`: display block; background white; padding 12px 3.2px; font Oswald 16px/18.4px; letter-spacing 1px; text-align left; no capitalize
    - li: position relative; border-bottom 1px solid rgb(238,238,238) (search li: none); `a`: display block; padding 8px 4.8px; color rgb(34,34,34); height 34.4px
    - search li `a`: padding 15px; icon 18px color rgb(238,238,238); height 49px
  - "Product Categories" li hidden.

## Responsive
- **1440:** as above. **768:** TopBar visible (wraps), branding 246px (logo 196), right col 492: search 336px + cart to the right (cart box 66×37 at x 657); nav inline, toggle hidden. **390:** TopBar hidden; header stacks: branding full width centered (logo block padding 10px → img 310 wide; tagline 13px/14.95px centered; margin 10px 0 10px), search full width (form 300px inside 15px paddings), cart centered (margin 10px 0), then nav toggle row.
