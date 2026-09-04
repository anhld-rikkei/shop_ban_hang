# SiteFooter Specification

## Overview
- **Target file:** `src/components/sites/j86store-com-95a496e4/root-8a5edab2/SiteFooter.tsx`
- **Screenshots:** `docs/design-references/j86store-com-95a496e4/root-8a5edab2/desktop-1440-full.png` (y 7044–7500), `mobile-footer.png`
- **Interaction model:** static; link hover color.

## DOM Structure
```
footer#colophon  (bg rgb(26,27,28); padding-top 15px; min-height 150px; font 14px/22.4px; total height 456.6px)
  div.footer-section
    div.container (max-width 1200px; padding 7px 15px 0; margin 0 auto)
      aside.widget-area (clearfix; height 309.6)
        div.footer-widget ×4  (float left; width 25%; padding 0 15px)
          section.widget (padding-bottom 42px)
            h2.widget-title "TITLE"
            div.textwidget
              col1: p > iframe (Facebook page plugin) 262.5×150
              col2/col3: p > a "link" (one p per link, margin-bottom 14px)
              col4: p > img 82×82 float left (viettel post logo)
      div.row (margin 0 -15px)
        div.col-md-12 (padding 0 15px) > center > ul#footer-social (margin-bottom 25px; height 45px; text-align center)
          li (inline-block 50×45; padding-top 5px) > a.facebook (inline-block 40×40; margin 0 5px; bg rgb(59,89,152); border-radius 24px; color white) > i.fa-facebook
      div.row (margin 0 -15px)
        div.footer-bottom-section (display flex; align-items center; border-top 1px solid rgb(255,255,255); height 55px)
          div.site-info (padding 15px; text-align center; font 15px/24px; color white; width 100%)
            p > a[href="/"] "Copyright 2020-2026 by J86 Store. All Rights Reserved."
```

## Computed Styles (exact)
### footer
- backgroundColor rgb(26,27,28); paddingTop 15px; minHeight 150px; fontSize 14px; lineHeight 22.4px; color rgb(255,255,255) for all text/links

### container
- maxWidth 1200px; marginLeft/Right auto; paddingTop 7px; paddingLeft 15px; paddingRight 15px

### footer-widget column
- width 25% (292.5px); paddingLeft 15px; paddingRight 15px; float left → use `grid grid-cols-4` or flex; the aside is 1170 wide

### section.widget
- paddingBottom 42px

### h2.widget-title
- fontFamily Oswald; fontSize 21px; fontWeight 500; lineHeight 29.4px; letterSpacing 3.8178px; textTransform uppercase; color rgb(255,255,255); marginTop 17.43px; marginBottom 21px
- Rendered uppercase: "KẾT NỐI VỚI CHÚNG TÔI", "VỀ J86 STORE", "HỖ TRỢ KHÁCH HÀNG", "ĐƠN VỊ VẬN CHUYỂN" (long first title wraps to 2 lines = 58.78px)

### textwidget p
- marginBottom 14px; fontSize 14px; lineHeight 22.4px; color rgb(255,255,255)

### links a
- color rgb(255,255,255); textDecoration none; **hover: color rgb(204,204,204)**; transition all (0s)

### iframe (col 1)
- width 100% (262.5px); height 150px; border 0; `src` = `facebookPage` from data (Facebook page plugin). Add `title="Facebook J86 Store"`, `loading="lazy"`, `allow="encrypted-media"`. It may be blocked by third-party cookies — leave as is (real content).

### img (col 4)
- width 82px; height 82px; float left; marginRight 21px; display block; alt "viettel post"

### footer-social ul
- textAlign center; marginBottom 25px; height 45px; list-style none; padding 0
- li: display inline-block; width 50px; height 45px; paddingTop 5px
- a.facebook: display inline-block; width 40px; height 40px; marginLeft 5px; marginRight 5px; backgroundColor rgb(59,89,152); borderRadius 24px; color rgb(255,255,255); textAlign center; lineHeight 40px; transition 0.3s ease-in-out; icon `Fa name="facebook"` fontSize 18px, vertically centered
- href https://facebook.com/j86store; `aria-label="Facebook"`

### footer-bottom-section
- display flex; alignItems center; borderTop 1px solid rgb(255,255,255); height 55px; margin 0 -15px (inside container) → spans 1200px
- .site-info: paddingTop 15px; paddingBottom 15px; paddingLeft 15px; paddingRight 15px; textAlign center; fontSize 15px; lineHeight 24px; color rgb(255,255,255); width 100%
- p margin 0; a color white (hover rgb(204,204,204))

## States & Behaviors
- Link hover: white → rgb(204,204,204), immediate.
- Facebook circle: `transition: 0.3s ease-in-out` (no measured property change; keep transition-all duration-300).

## Assets
- `footerColumns[3].image.src` → `/sites/j86store-com-95a496e4/root-8a5edab2/images/bietpo-….png` (200×200 source, rendered 82×82)
- FontAwesome facebook glyph via `Fa`.

## Text Content (verbatim)
- Col 1 title "Kết Nối Với Chúng Tôi" (Facebook page embed)
- Col 2 title "Về J86 Store": "Giới thiệu J86 Store" → /gioi-thieu-ve-j86-store/ ; "Liên hệ" → /lien-he/
- Col 3 title "Hỗ Trợ Khách Hàng": "Hướng dẫn đặt hàng" → /huong-dan-dat-hang/ ; "Chính sách đổi trả" → /chinh-sach-doi-tra/
- Col 4 title "Đơn Vị Vận Chuyển": image only
- Copyright: "Copyright 2020-2026 by J86 Store. All Rights Reserved." (link to "/")

## Responsive Behavior
- **Desktop (1440):** 4 columns of 292.5px; container 1200.
- **Tablet (768):** container 750 → 4 columns of 184.5px (`col-sm-3` applies at ≥768).
- **Mobile (390):** columns stack to full width (each 360px wide inside 15px padding); heights 283/181/181/210; social row and copyright unchanged (copyright wraps to 2 lines, row 66px).
- Breakpoint: `grid-cols-1 sm:grid-cols-4` (`sm` = 768px in this project).

## Props
```ts
interface SiteFooterProps { columns: FooterColumn[]; facebookHref: string; copyright: string; className?: string }
```
