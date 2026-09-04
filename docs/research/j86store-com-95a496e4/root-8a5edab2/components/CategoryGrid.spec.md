# CategoryGrid Specification

## Overview
- **Target file:** `src/components/sites/j86store-com-95a496e4/root-8a5edab2/CategoryGrid.tsx` — exports `CategoryGrid` and `CategoryCard`
- **Screenshots:** `docs/design-references/j86store-com-95a496e4/root-8a5edab2/category-card-default.png`, `desktop-1440-full.png` (y 685–2290), `mobile-categories.png`
- **Interaction model:** static (link cards). No measurable hover change (shadow constant).

## DOM Structure
```
div.wp-block-group (width 100% of the 750px main column; total height 1605px)
  h2.has-text-align-center "DANH MỤC SẢN PHẨM"
  div.woocommerce.columns-4
    ul.products.columns-4  (block; margin-bottom 16px; 5 rows × 4 cards)
      li.product-category ×20
        a[href]
          img 300×300 (rendered 165.375×165.375)
          h2.woocommerce-loop-category__title "NAME" + " " + mark.count "(N)"
  p (empty, margin-bottom 16px — trailing spacer; can be a 16px bottom margin on the group)
```

## Computed Styles (exact)
### Heading h2
- fontFamily Oswald; fontSize 26px; fontWeight 300; lineHeight 36.4px; color rgb(13,15,26); textAlign center; marginTop 21.58px; marginBottom 21.58px
- rendered box 750×36.39; text "DANH MỤC SẢN PHẨM"

### ul.products
- desktop: 4 per row. Cards 165.375px wide with marginRight 28.5px (every 4th has none) and marginBottom 47.872px. Equivalent grid: `grid grid-cols-4 gap-x-[28.5px] gap-y-[47.87px]`; marginBottom 16px; padding 0; list-style none
- rows start at y = 743, 1048, 1353, 1658, 1963 (card 234.77 + 47.87 gap ≈ 282.6 → actual 305 because the first-row cards with 2-line titles are taller; use `items-start`)

### li.product-category (card)
- position relative; textAlign center; paddingBottom 15px
- boxShadow rgb(207,207,207) 0px 2px 18px -4px (constant, also on hover)
- backgroundColor transparent (the page background shows through; the artwork images themselves have cream backgrounds)
- height 234.77px for 1-line title (165.375 img + 16 mb + 38.39 h2 + 15 pb)

### a
- display block (original inline but behaves like block); color rgb(101,100,100); textDecoration none

### img
- display block; width 100%; height auto (square 300×300 source); marginBottom 16px

### h2 title
- fontFamily Oswald; fontSize 16px; fontWeight 300; lineHeight 22.4px; color rgb(13,15,26); textAlign center; paddingTop 8px; paddingBottom 8px; margin 0
- `mark.count`: display inline; background transparent (reset default mark yellow!); color rgb(34,34,34); same font; preceded by a space — rendered "CHỐNG NẮNG ( UV ) (3)"

## States & Behaviors
- Hover: link text color would change to rgb(50,124,219) but the visible h2 has its own color rgb(13,15,26) → **no visible change**. Add `transition-none`.
- Whole card is clickable (a wraps image + title).

## Assets
Card images (300×300, under `/sites/j86store-com-95a496e4/root-8a5edab2/images/`, exact filenames come from `categoryCards[].image` in `data.ts`). Order (alphabetical as rendered):
1 CHỐNG NẮNG ( UV ) (3) uv-1 · 2 DƯỠNG THỂ ( BODY ) (5) body-1 · 3 GIẢM CÂN ( DIET ) (3) diet-1 · 4 GỐC CHỊ EM CHÚNG MÌNH ( WOMEN ) (3) women-1 · 5 KEM DƯỠNG DÀNH CHO MẶT ( FACE CREAM ) (7) face-cream-1 · 6 MẮT ( EYES ) (2) · 7 MẶT NẠ ( MASK ) (7) · 8 MOM AND BABY (14) · 9 NƯỚC HOA HỒNG ( LOTION ) (5) · 10 PHỤC HỒI TÓC TẠI NHÀ ( HAIR ) (2) · 11 SẢN PHẨM DÀNH CHO NAM ( MEN ) (4) · 12 SON MÔI ( LIPSTICK ) (3) · 13 SỮA RỬA MẶT (9) · 14 SỮA TẮM ( SHOWER GEL ) (4) · 15 TÂY TẾ BÀO CHẾT ( EXFOLIATE DEAD SKIN ) (4) · 16 TẨY TRANG ( CLEANSING ) (3) · 17 THỰC PHẨM CHỨC NĂNG ( FUNCTIONAL FOODS ) (38) · 18 TRỊ MỤN ( ACNE TREATRMENT ) (5) · 19 TRỊ NÁM - TÀN NHANG ( TREAT MELASMA FRECKLES ) (2) · 20 TỦ THUỐC GIA ĐÌNH ( FAMILY MEDICINE ) (11)

## Text Content (verbatim)
Heading: "DANH MỤC SẢN PHẨM". Card titles as listed above; `alt` = category name.

## Responsive Behavior
- **Desktop (≥992):** 4 columns, gap-x 28.5px, gap-y 47.87px.
- **Tablet (768) and Mobile (390):** 2 columns (WooCommerce `columns-4` collapses to 2 at ≤768). Measured card widths 226px (768) and 172.8px (390) with ≈3.8% horizontal gap (`gap-x-[3.8%]`), row gap stays 47.87px.
- Breakpoint: use `grid-cols-2 md:grid-cols-4` (`md` = 992px in this project).

## Props
```ts
interface CategoryGridProps { title: string; categories: CategoryCard[]; className?: string }
```
Use `next/image` with `width={300} height={300}` and `className="block w-full h-auto mb-4"`.
