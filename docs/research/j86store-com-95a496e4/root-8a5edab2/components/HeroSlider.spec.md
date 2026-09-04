# HeroSlider Specification

## Overview
- **Target file:** `src/components/sites/j86store-com-95a496e4/root-8a5edab2/HeroSlider.tsx` (client component)
- **Screenshots:** `docs/design-references/j86store-com-95a496e4/root-8a5edab2/slider-slide-1.png`, `slider-slide-2.png`, `slider-hover.png` (arrows visible), `desktop-1440-viewport.png`
- **Interaction model:** time-driven (auto fade every 5000 ms) + click (dots, prev/next arrows). Arrows are hover-revealed.
- **Original:** MetaSlider 3.20.2 → FlexSlider, `{ slideshowSpeed: 5000, animation: "fade", animationSpeed: 300, controlNav: true, directionNav: true, pauseOnHover: false, slideshow: true }`

## DOM Structure
```
div.alignfull  (width 750 in the 750px main column; height = slider + 40px bottom margin)
  div#metaslider (position relative, z 0)
    div.flexslider (position relative, border-radius 4px, margin-bottom 40px)
      ul.slides  (each li absolute/stacked; active li z 2, others opacity 0)
        li > a[href] > img 1280×520 (rendered 750×304.69, width 100%, height auto, display block)
      ol.flex-control-nav (dots)  – position absolute, top: calc(100% + 16px) → measured 15.7px below slider bottom, width 100%, height 11px, text-align center, z 2
        li (inline-block, 23×11) > a (display block 11×11, margin 0 6px, border-radius 20px, text-indent -9999px, bg rgba(0,0,0,0.5); active rgba(0,0,0,0.9); hover rgba(0,0,0,0.7))
      ul.flex-direction-nav
        a.flex-prev  – display block 30×30, position absolute, top 50%, margin-top -20px, left -50px, opacity 0, z 10, overflow hidden, text-indent -9999px, background: url(sprite) no-repeat 0 0, transition 0.3s
        a.flex-next  – same, right -50px, background-position 100% 0
```

## Computed Styles (exact)
### Wrapper `.flexslider`
- width: 100% of parent (750px at 1440; 360px at 390 → height 146px, i.e. aspect ratio 1280/520 = 2.4615)
- borderRadius: 4px; overflow: hidden on the slides area (so the 4px radius clips the image)
- marginBottom: 40px (this reserves the space where the dots sit)

### Slide image
- display: block; width: 100%; height: auto; aspect 1280×520
- Each slide is a link (`<a href>`)

### Dots (`ol`)
- position: absolute; left 0; right 0; top: 100% + 16px (measured 661−645 = 16px below the image bottom)
- height: 11px; line-height: 11px; text-align: center
- `li`: display inline-block, width 23px, height 11px
- `a`: display block, width 11px, height 11px, margin 0 6px, borderRadius 20px, backgroundColor rgba(0,0,0,0.5), cursor pointer, text hidden (use `sr-only` text "1".."4")
- active `a`: backgroundColor rgba(0,0,0,0.9); hover: rgba(0,0,0,0.7)

### Arrows
- width 30px, height 30px, position absolute, top 50%, marginTop -20px, zIndex 10
- prev: left -50px (default) → **left 5px on slider hover**; next: right -50px → **right 5px on slider hover**
- opacity 0 → **0.8 on slider hover**; individual arrow hover → opacity 1
- transition: all 0.3s ease
- background-image: `/sites/j86store-com-95a496e4/root-8a5edab2/images/bg_direction_nav-f14a91.png` (sprite; check its pixel size with a tiny node script — FlexSlider convention: prev = `background-position: 0 0`, next = `background-position: 100% 0`; if the sprite is 30px wide, use the same image and mirror the next arrow with `scale-x-[-1]`)
- text hidden (`sr-only` "Previous" / "Next")

## States & Behaviors
### Autoplay fade
- **Trigger:** every 5000 ms (setInterval / setTimeout in useEffect; clean up on unmount). Does NOT pause on hover.
- **State A:** slide n opacity 1, z 2. **State B:** slide n+1 opacity 1, previous fades to 0.
- **Transition:** `transition: opacity 300ms ease-in-out` on each `li`. Stack slides with `position: absolute inset-0` inside a wrapper that has `aspect-ratio: 1280/520` (first slide can be static in flow to give height; simplest: wrapper `relative aspect-[1280/520]`, every slide absolute).
- Clicking a dot sets the index and restarts the timer. Arrows go ±1 (wrap around).
### Arrow reveal
- Use `group` on the slider root; arrows `opacity-0 group-hover:opacity-80 hover:!opacity-100`, `-left-[50px] group-hover:left-[5px]`, `-right-[50px] group-hover:right-[5px]`, `transition-all duration-300`. Root must NOT be `overflow-hidden` (arrows sit outside). Put `overflow-hidden rounded-[4px]` on the inner slides wrapper only.
- Note the arrows must remain inside the 750px column visually when shown (5px inset) — see `slider-hover.png`.

## Assets
- Slides (in order), all 1280×520 PNG, from `slides` in `data.ts`:
  1. `uvsld-1280x520-b5707f.png` → `/product/kem-chong-nang-skin-aqua-tone-up-uv-essence-…`
  2. `vitamin-1280x520-ca9fa7.png` → `/product/vitamin-c-dhc-60-ngay/`
  3. `son-1-2f8444.png` → `/product/son-duong-tri-tham-moi-dhc/`
  4. `kids-1280x520-2d52b6.png` → `/product/thuoc-tri-cam-sot-cho-be-paburon-…`
- Arrow sprite: `sliderAssets.directionNav` in `data.ts`.

## Text Content (verbatim)
- Dots: "1", "2", "3", "4" (visually hidden). Arrows: "Previous", "Next" (visually hidden). Slide images have empty alt.

## Responsive Behavior
- **Desktop (1440):** 750×304.69, dots 16px below.
- **Tablet (768):** main column is 470px wide → 470×191; same structure.
- **Mobile (390):** 360×146; same structure (dots and arrows unchanged).
- Nothing else changes — the component is fluid width with fixed aspect ratio.

## Props
```ts
interface HeroSliderProps { slides: Slide[]; intervalMs?: number /* default 5000 */; className?: string }
```
Use `next/image` (`Image` with `width={1280} height={520}` and `className="block w-full h-auto"`, `priority` on the first slide).
