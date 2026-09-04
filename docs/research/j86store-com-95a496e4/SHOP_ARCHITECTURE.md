# Shop architecture (added on top of the home-page clone)

## Data
- `data/db.json` — single JSON database seeded from the live site (120 products, 20 categories, 6 pages, 10 posts) by `scratch/seed_db.py` (scraper: `catalog/catalog-raw.json`, images: `scripts/download-catalog-j86store-com-95a496e4.mjs` → `public/sites/j86store-com-95a496e4/shared/products/`).
- `src/lib/db.ts` — server-only accessor: products (query with category / tag / search / orderby / pagination), categories, orders (create re-prices from catalogue and decrements stock), pages, posts, stats. Writes are atomic (tmp + rename) and serialised in-process. Set `J86_DB_PATH` to move the file.
- `src/types/shop.ts` — `CatalogProduct`, `ShopCategory`, `CartItem`, `Order`, …

## Client state
- `shop/CartProvider.tsx` — cart + wishlist in React context, persisted to `localStorage` (`j86store:cart`, `j86store:wishlist`), mounted in `src/app/layout.tsx`.
- `shop/AddToCartButton.tsx` (variants pill / square / sticky), `shop/WishlistButton.tsx`, `shop/CartBadge.tsx` (header + floating widget counts).

## Routes
| Route | Layout | Source |
|---|---|---|
| `/` | two-column | home clone |
| `/shop/`, `/shop/page/[n]/`, `/shop/?s=&product_cat=&orderby=` | full width | `ProductListing` |
| `/product-category/[slug]/` (+ `/page/[n]/`), `/product-tag/[slug]/` | full width | `ProductListing` |
| `/product/[slug]/` | full width | gallery, summary (qty + add to cart + wishlist), tabs, related, sticky bar |
| `/cart/`, `/checkout/`, `/checkout/order-received/[id]/` | two-column | client cart, server action `placeOrder` |
| `/wishlist/`, `/my-account/` (order lookup by number + phone) | full / two-column | |
| `/[slug]/` (WordPress pages & posts), `/category/goc-chia-se/` | two-column | `db.pages`, `db.posts` |
| `/admin/**` | admin shell | cookie session (`src/lib/auth.ts`), products CRUD, orders + status |

## Auth
`ADMIN_USER` / `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` in `.env.local` (see `.env.example`). Defaults `admin` / `admin123` are for local development only and trigger a warning in the admin UI.

## Known limitations
- Payments are not processed: "Chuyển khoản" and "COD" only record the chosen method.
- Coupons, reviews and product comparison are visual only.
- The JSON file store is single-instance; for production swap `src/lib/db.ts` for a real database.

## Status (2026-09-04, end of session)
All routes above are implemented. `npx tsc --noEmit`, `npx eslint src` and `npm run build` pass.
End-to-end browser QA (`scratchpad/qa_flow.py`, screenshots in `docs/design-references/j86store-com-95a496e4/qa-flow/`): 24/24 steps pass —
add to cart from home & product page (badge updates), cart quantity edit, checkout validation + order placement, order-received page clears the cart,
wishlist, order lookup on /my-account, admin login → orders list → status update, products list → edit → save, mobile product page has no horizontal overflow.
Two demo orders (#1001, #1002) created during QA remain in `data/db.json`; re-run `seed_db.py` to reset.

## Feature-parity pass (2026-09-04, after TECH_STACK_AUDIT.md)
Added: search modal (`shop/SearchModal.tsx`), Quick View (`shop/QuickView.tsx`), hover zoom (`shop/product/ProductGallery.tsx`),
add-to-cart notice + recently-viewed tracking (`shop/product/ProductPageNotice.tsx`, `shop/RecentlyViewedWidget.tsx`),
customer accounts (`src/lib/customer-auth.ts`, `db.customers`, `/my-account/` login/register/dashboard/orders/address/details, `/my-account/lost-password/`,
"Tạo tài khoản mới?" at checkout, orders linked via `customerId`), blog prev/next + comment form (`shop/PostCommentForm.tsx`),
`app/manifest.ts`, `app/robots.ts`, `app/sitemap.ts`, optional Facebook chat (`NEXT_PUBLIC_FB_PAGE_ID`).
QA: `qa_features.py` 27/27, `qa_flow.py` 24/24, tsc/eslint/build clean. Test customers/orders created during QA remain in `data/db.json`.
