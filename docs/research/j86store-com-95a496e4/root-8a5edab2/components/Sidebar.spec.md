# Sidebar Specification (CategoryWidget + PriceFilterWidget)

## Overview
- **Target file:** `src/components/sites/j86store-com-95a496e4/root-8a5edab2/Sidebar.tsx` — exports `Sidebar`, `CategoryWidget`, `PriceFilterWidget` (PriceFilterWidget is a client component with state; keep it in the same file or a sibling `PriceFilterWidget.tsx`).
- **Screenshots:** `docs/design-references/j86store-com-95a496e4/root-8a5edab2/sidebar.png`, `mobile-390-viewport.png` (bottom part)
- **Interaction model:** static list with link hover; price filter is stateful (two range thumbs + two text inputs).

## DOM Structure
```
aside#secondary.widget-area  (width 360 inside the 390px column which has 15px side padding; padding-bottom 28px; font 14px/22.4px; position relative)
  section.widget_product_categories (bg white; padding 0 25px 25px; margin-bottom 14px; border-radius 0 0 3px 3px)
    h2.widget-title "Danh mục sản phẩm"
    ul.product-categories
      li.cat-item ×20 > a "NAME" + " " + span.count "(N)"
  section.widget_block (bg white; padding 0 25px 25px; border-radius 0 0 3px 3px)
    div.price-filter
      h3 "Lọc theo giá"
      div.range-wrapper (track) > progress div + input[type=range] min + input[type=range] max
      div.controls (flex, space-between) > input.text min "59000VNĐ" / input.text max "2590000VNĐ"
```

## Computed Styles (exact)
### aside
- width 100%; paddingBottom 28px; fontSize 14px; lineHeight 22.4px; color rgb(25,25,25)

### Widget section (both)
- backgroundColor rgb(255,255,255); paddingTop 0; paddingRight 25px; paddingBottom 25px; paddingLeft 25px; borderRadius 0 0 3px 3px
- first widget marginBottom 14px; total rendered height 855px (title 44 + 20 rows)

### h2.widget-title
- display block; paddingTop 10px; paddingRight 15px; paddingBottom 10px; paddingLeft 15px; marginLeft -25px; marginRight -25px; marginBottom 10px
- fontFamily Oswald; fontSize 16px; fontWeight 500; lineHeight 22.4px; letterSpacing 2.9088px; textTransform uppercase; color rgb(24,24,24); textAlign left
- borderBottom 2px solid rgb(230,230,230); borderRadius 8px 8px 0 0
- Rendered text is uppercase "DANH MỤC SẢN PHẨM" (source text "Danh mục sản phẩm")

### ul.product-categories
- list-style none; margin 0; padding 0; width 310px (= 360 − 2×25)

### li.cat-item
- display list-item (block); paddingTop 7px; paddingBottom 7px; marginTop -1px (all but first — keep as-is, simple `[&+li]:-mt-px`)
- fontSize 14px; lineHeight 22.4px; height 36.39px for one-line items; wraps to 2 lines for long names (58.78px)

### li > a
- display inline; fontFamily Google Sans; fontSize 14px; fontWeight 400; lineHeight 22.4px; color rgb(101,100,100); textDecoration none
- **hover:** color rgb(50,124,219)

### li > span.count
- display inline; color rgb(25,25,25); fontSize 14px; preceded by a single space: `NAME (N)`

### h3 (price filter title)
- fontFamily Oswald; fontSize 22px; fontWeight 300; lineHeight 30.8px; color rgb(13,15,26); marginTop 22px; marginBottom 22px

### Range track wrapper
- position relative; height 9px; marginTop 15px; marginBottom 15px; backgroundColor rgb(225,225,225); boxShadow rgba(0,0,0,0.1) 0 0 0 1px inset; width 100% (310px)
- progress bar: position absolute; top 0; bottom 0; left `${minPct}%`; right `${100 − maxPct}%`; background rgb(168,115,157) (original uses a linear-gradient with the same solid color)
- two `<input type="range">` absolutely positioned over the track (top 50%, translate-y-1/2), width 100%, min input z 21, max input z 20; use the existing utility class `j86-range` from globals.css (transparent track, 20px white round thumbs with 1px rgb(215,215,215) border). Do not add global CSS.
- min 59000, max 2590000, step 1000. Prevent thumbs crossing (min ≤ max).

### Controls row
- display flex; justify-content space-between; marginBottom 20px (the section padding-bottom 25px comes after)
- each `<input type="text">`: width 99.375px (use `w-[100px] max-w-[100px]`); height 48.375px; padding 11.2px; fontFamily Arial; fontSize 16px; lineHeight 24px; color rgb(51,51,51); backgroundColor rgb(255,255,255); border 1px solid rgb(215,215,215); borderRadius 4px
- values displayed as `${value}VNĐ` with no thousands separator: "59000VNĐ" / "2590000VNĐ"; read-only is acceptable but they must reflect the slider state. `aria-label`s: "Giá thấp nhất" / "Giá cao nhất".

## States & Behaviors
- Category link hover: color rgb(101,100,100) → rgb(50,124,219), transition none (use `transition-colors duration-0` or none).
- Price filter: dragging a thumb updates progress bar + its text box live. No submit button on the original (WooCommerce block auto-applies). Keep purely visual.

## Assets
- None.

## Text Content (verbatim)
Title: "Danh mục sản phẩm". Items in this exact order (from `sidebarCategories` in `data.ts`):
GIẢM CÂN ( DIET ) (3); SỮA TẮM ( SHOWER GEL ) (4); SON MÔI ( LIPSTICK ) (3); PHỤC HỒI TÓC TẠI NHÀ ( HAIR ) (2); SỮA RỬA MẶT (9); GỐC CHỊ EM CHÚNG MÌNH ( WOMEN ) (3); NƯỚC HOA HỒNG ( LOTION ) (5); SẢN PHẨM DÀNH CHO NAM ( MEN ) (4); TẨY TRANG ( CLEANSING ) (3); MẮT ( EYES ) (2); KEM DƯỜNG DÀNH CHO MẶT ( FACE CREAM ) (7); TÂY TẾ BÀO CHẾT ( EXFOLIATE DEAD SKIN ) (4); CHỐNG NẮNG ( UV ) (3); TRỊ NÁM - TÀN NHANG ( TREAT MELASMA FRECKLES ) (2); DƯỠNG THỂ ( BODY ) (5); TRỊ MỤN ( ACNE TREATRMENT ) (5); MẶT NẠ ( MASK ) (7); TỦ THUỐC GIA ĐÌNH ( FAMILY MEDICINE ) (11); THỰC PHẨM CHỨC NĂNG ( FUNCTIONAL FOODS ) (38); MOM AND BABY (14)
Price title: "Lọc theo giá".

## Responsive Behavior
- **Desktop (1440):** aside 360px inside the 390px `col-md-4` (parent handles the column; component is width 100%).
- **Tablet (768):** column 250px → aside 220px; same styles, more items wrap to 2 lines.
- **Mobile (390):** column full width 390 → aside 360px; sits ABOVE the main column (handled by page layout).
- Breakpoint: none inside the component; it is fluid.

## Props
```ts
interface SidebarProps { title: string; categories: SidebarCategory[]; priceFilter: { title: string; min: number; max: number; currency: string }; className?: string }
```
