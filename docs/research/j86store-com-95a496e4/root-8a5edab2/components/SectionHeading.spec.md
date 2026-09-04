# SectionHeading Specification

## Overview
- **Target file:** `src/components/sites/j86store-com-95a496e4/root-8a5edab2/SectionHeading.tsx`
- **Screenshot:** `desktop-1440-full.png` (y 2311–2438: hr / "SẢN PHẨM MỚI NHẬP" / hr / spacer)
- **Interaction model:** static; heading link hover color.

## DOM Structure
```
hr                      (margin 20px 0; height 1px; background rgb(186,186,186); border-top 1px solid rgb(238,238,238) → 2px total)
h2.has-text-align-center (margin 21.58px 0; font Oswald 26px/36.4px weight 300; color rgb(13,15,26); text-align center)
  a[href] "TITLE"        (color rgb(101,100,100); hover rgb(50,124,219); no underline)
hr                      (same)
p (empty)               (height 24px; margin-bottom 16px) — spacer before the product grid
```
Occurrences: "SẢN PHẨM MỚI NHẬP" → /shop/ ; "THỰC PHẨM CHỨC NĂNG" → /product-category/thuc-pham-chuc-nang-functional-foods/ ; "Mom And Baby" → /product-category/mom-and-baby/ (this one is wrapped in a `wp-block-group`, identical rendering). When `href` is omitted the title renders as plain text in the h2 color.

## Responsive
- Fluid; no changes across 1440 / 768 / 390.

## Props
```ts
interface SectionHeadingProps { title: string; href?: string; rules?: boolean /* default true */; spacer?: boolean /* default true */; className?: string }
```
