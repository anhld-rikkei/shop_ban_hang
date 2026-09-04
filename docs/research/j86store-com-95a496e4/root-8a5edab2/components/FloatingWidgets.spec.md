# FloatingWidgets Specification (`#scroll-cart` + `#scroll-btn`)

## Overview
- **Target file:** `src/components/sites/j86store-com-95a496e4/root-8a5edab2/FloatingWidgets.tsx` (client component)
- **Screenshots:** `mobile-floating-widgets.png`, `desktop-scrolltop-btn.png`, `mobile-products.png` (right edge)
- **Interaction model:** scroll-driven visibility (both hidden at scroll 0, `display: block` once the page is scrolled; threshold not exposed by the theme — 100px used), click on the arrow scrolls to top.

## `#scroll-cart.topcorner`
- position fixed; top 60% (540/900 desktop, 506/844 mobile); right −2px; width 36.25px; z-index 99999; text-align center; font 16px
- `ul` no margin/padding; each `li`: display block; margin-top 5px; padding 12px 5px; background rgb(255,255,255); border-radius 3px; box-shadow rgb(212,212,212) −1px 3px 5px 0
  1. cart: `a` → /cart/; icon fa-shopping-bag 16px color rgb(51,51,51); badge `span` absolute top −7px right 1px, bg rgb(59,160,244), white 13px/13px, padding 2px 4px, border-radius 24px, text "0"; li font 15px / 17.25px (mobile) / 24px (desktop)
  2. wishlist: `a` → /wishlist/; icon fa-heart 16px color rgb(232,32,22)
  3. account: `a` → /my-account; icon fa-user-circle 21px/21px black; li height 48px
- Rendered height 148px (mobile) / 164px (desktop, larger line-height)

## `#scroll-btn.scroll-top`
- position fixed; right 10px; bottom 10px; width 40px; height 40px; background rgb(50,124,219); border-radius 4px; color white; text-align center; z-index 9999
- icon fa-arrow-up 22px, line-height 40px

## Responsive
- Identical at 1440 / 768 / 390 (only body line-height differs: 18.4px on xs vs 24px from sm).

## Props
```ts
interface FloatingWidgetsProps { cartHref: string; wishlistHref: string; accountHref: string; cartCount?: number; threshold?: number; className?: string }
```
