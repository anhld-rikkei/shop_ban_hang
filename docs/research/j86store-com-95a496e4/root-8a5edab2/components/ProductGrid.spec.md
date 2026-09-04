# ProductGrid Specification (ProductGrid + ProductCard)

## Overview
- **Target file:** `src/components/sites/j86store-com-95a496e4/root-8a5edab2/ProductGrid.tsx` — exports `ProductGrid` and `ProductCard`
- **Screenshots:** `docs/design-references/j86store-com-95a496e4/root-8a5edab2/product-card-default.png`, `product-card-hover.png` (title + image ring blue), `product-card-btn-hover.png`, `desktop-1440-full.png` (y 2454–4156), `mobile-products.png`
- **Interaction model:** hover-driven (title color, image ring, button text color). Links.
- **Original:** WooCommerce block grid `wc-block-grid has-3-columns has-multiple-rows`

## DOM Structure
```
div.wc-block-grid  (width 750, text-align center)
  ul.wc-block-grid__products  (display flex; flex-wrap wrap; margin 0 -8px 16px; padding 0; list-style none) → 766px wide
    li.wc-block-grid__product ×N  (list-item; flex 1 0 33.333%; max-width 33.333%; position relative; text-align center;
                                    border-left 8px solid transparent; border-right 8px solid transparent; border-bottom 16px solid transparent)
      a.wc-block-grid__product-link[href]  (the "card link": wraps image + title)
        div.wc-block-grid__product-image (block; position relative; margin-bottom 12px)
          img 300×300 → rendered 239.33×239.33
        div.wc-block-grid__product-title "Title"
      div.wc-block-grid__product-price.price (margin-bottom 12px)
        span.amount "890.000" span.currencySymbol "VNĐ"
      div.wp-block-button (margin-bottom 12px)
        a.wp-block-button__link.add_to_cart_button[href="?add-to-cart=ID"] "Mua hàng"
```

## Computed Styles (exact)
### ul
- display flex; flexWrap wrap; marginLeft -8px; marginRight -8px; marginBottom 16px; textAlign center

### li (card)
- flex: 1 0 33.3333%; maxWidth 33.3333%; position relative; textAlign center
- borderLeft 8px solid transparent; borderRight 8px solid transparent; borderBottom 16px solid transparent (these act as gutters — implement with `border-x-8 border-b-16 border-transparent` or equivalent padding `px-2 pb-4`)
- rendered 255.33 × 439.94 (2-line title) / 420.73 (1-line title)

### a.card-link
- display inline (treat as block); color rgb(101,100,100); textDecoration none

### .product-image
- display block; position relative; marginBottom 12px; width 239.33px (100%)

### img
- display inline → use block; width 100%; height auto; maxWidth 100%
- boxShadow rgba(255,255,255,0.1) 0px 0px 0px 3px (invisible ring) → **hover (card link hovered): rgb(59,160,244) 0px 0px 0px 3px**
- transition: all (0s) — use `transition-none`

### .product-title
- display block; marginBottom 12px; fontFamily Google Sans; fontSize 16px; fontWeight 700; lineHeight 19.2px; color rgb(101,100,100); textAlign center
- **hover (card link hovered):** color rgb(50,124,219)

### .price
- display block; marginBottom 12px; fontSize 16px; fontWeight 400; lineHeight 24px; color rgb(25,25,25); textAlign center
- amount and currency are two inline spans with no space: "890.000" + "VNĐ"

### .wp-block-button wrapper
- display block; marginBottom 12px; height 55px; textAlign center

### a.add_to_cart_button ("Mua hàng")
- display inline-flex; flexDirection column; justifyContent center; alignItems center
- paddingTop 14.006px; paddingBottom 14.006px; paddingLeft 25.994px; paddingRight 25.994px (use `py-[14px] px-[26px]`) → 131.77 × 55
- fontFamily Google Sans; fontSize 18px; fontWeight 400; lineHeight 27px; color rgb(255,255,255); textDecoration none
- backgroundColor rgb(50,55,60); borderRadius 9999px; border none
- **hover:** color rgb(50,124,219); background unchanged
- transition: all (0s)

## States & Behaviors
- Card-link hover (`group` on the `<a>`): title → rgb(50,124,219); image ring → rgb(59,160,244) 3px. Both immediate (no transition).
- Button hover: text → rgb(50,124,219). Immediate.
- Add-to-cart is a plain link (`href` = product `addToCartHref`, e.g. `?add-to-cart=1769`); keep `rel="nofollow"`.

## Assets
- Product thumbnails 300×300 JPG/PNG/JPEG from `productSections[].products[].image` in `data.ts` (exact local filenames already resolved there).

## Text Content (verbatim)
From `productSections` in `data.ts` — three sections:
- key `new` (12 products): "Kem Dưỡng Trắng Da Transino Whitening Repair Cream EX" 890.000 VNĐ; "Tinh Chất Trị Nám – Sáng Da – Transino Whitening Essence Ex II 50g" 1.090.000; "NƯỚC NGHỆ GIẢI RƯỢU-BỔ GAN-ĐẸP DA TURMERIC DRINK" 220.000; "THUỐC TRỊ ĐAU DẠ DÀY KOWA" 490.000; "GEL ĐẶC TRỊ HÔI NÁCH KOBAYASHI" 210.000; "Canxi Hữu Cơ Nhật Bản Dear-Natura" 265.000; "Viên Uống Bổ Mắt Noguchi Lutein EX Hộp 60" 390.000; "THUỐC XỊT XOANG NAZAL NHẬT BẢN 30ml" 225.000; "TẢO VÀNG EX 2000 Viên" 1.700.000; "Trà Ổi Orihiro Nhật Bản 60 Gói Giảm Cân Thanh Lọc Cơ Thể" 210.000; "Tẩy tế bào chết Detclear Bright And Peel Nhật Bản 180ml" 280.000; "Gel Tẩy Tế Bào Chết Cure Natural Aqua Nhật Bản" 495.000
- key `functional` (12), key `momBaby` (6) — see data.ts.
- Button label: "Mua hàng" (`addToCartLabel`).

## Responsive Behavior
- **Desktop (1440) & Tablet (768):** 3 columns (`flex 1 0 33.333%`); at 768 cards are 162px wide.
- **Mobile (≤480):** 1 column (`flex: 1 0 100%`, max-width 100%) — measured at 390: card 376×529.
- Breakpoint: 480px (WooCommerce blocks). Use the arbitrary variant `min-[480px]:` since project breakpoints are 768/992/1200: `basis-full max-w-full min-[480px]:basis-1/3 min-[480px]:max-w-1/3`.

## Props
```ts
interface ProductGridProps { products: Product[]; addToCartLabel: string; className?: string }
interface ProductCardProps { product: Product; addToCartLabel: string }
```
Use `next/image` `width={300} height={300}`.

## QA amendments (2026-09-04)
- The `.wp-block-button` wrapper height is NOT fixed at 55px: it follows the button (55px from 768px, 49px on xs where body line-height is 18.4px → button line-height 20.7px). Price row line-height is 18.4px on xs / 24px from sm.
