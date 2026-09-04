# Báo cáo tech stack: j86store.com  (ngày kiểm tra: 2026-09-04)

Phương pháp: chỉ GET/đọc bằng `curl` và Playwright (Chromium headless). Không đăng ký, không đăng nhập, không hoàn tất đơn. Dữ liệu thô: `audit/audit.json`, ảnh trong `docs/design-references/j86store-com-95a496e4/audit/`.

## 1. Kết luận nhanh
- **Nền tảng / CMS:** WordPress 6.1.1 + WooCommerce 4.2.2 (độ tin cậy: cao — `<meta name="generator" content="WordPress 6.1.1">`, `<meta name="generator" content="WooCommerce 4.2.2">`, 368 lần `wp-content`, `/wp-json/` trả 200, `/admin` → 302 `/wp-admin/` → `wp-login.php`).
- **Kiểu kiến trúc:** CMS tự host (WooCommerce), server-render PHP, giỏ hàng AJAX qua `?wc-ajax=add_to_cart`. Không phải SaaS (`/products.json`, `/cart.js`, `/collections.json` đều 404).
- **Ước lượng độ phức tạp clone:** trung bình — theme phổ thông "New York Business" (child: "ecommerce-storefront"), không biến thể sản phẩm, không cổng thanh toán online, không tracking; phần khó nhất là hệ thống giỏ hàng/tài khoản/admin của WooCommerce.

## 2. Frontend
- **Framework / thư viện:** jQuery (bundle WordPress qua c0.wp.com), Bootstrap 3.3.6 (`themes/new-york-business/css/bootstrap.css`), FlexSlider (MetaSlider 3.20.2), FontAwesome 4.7, Google Fonts (Oswald, Google Sans).
- **Theme / template:** `wp-content/themes/new-york-business` (7 asset) + `wp-content/themes/ecommerce-storefront` (2 asset, child theme). Giao diện template phổ thông, tuỳ biến nhẹ.
- **Render:** server-rendered PHP, không `__NEXT_DATA__`/`__NUXT__`. Không SPA.
- **Tương tác giỏ hàng:** AJAX — trên listing `?wc-ajax=add_to_cart` không reload, hiện "Xem giỏ hàng"; trên trang sản phẩm submit form rồi `get_refreshed_fragments`, URL không đổi, hiện `.woocommerce-message`.
- **Plugin quan sát được (từ `wp-content/plugins/`):** contact-form-7, elementor, ml-slider, pwa-for-wp, sassy-social-share, sticky-add-to-cart-for-woocommerce, woocommerce, wp-image-zoooom, yith-woocommerce-compare, yith-woocommerce-quick-view, yith-woocommerce-wishlist; Jetpack (c0.wp.com, stats.wp.com); nextend-social-login (namespace trong `/wp-json/` nhưng không hiện nút social trên `/my-account/`).

## 3. Backend & hosting
- **Ngôn ngữ / framework:** PHP 7.2.34 (`X-Powered-By: PHP/7.2.34`), WordPress REST (`Link: <https://j86store.com/wp-json/>; rel="https://api.w.org/"`).
- **Server / CDN / hosting:** `Server: LiteSpeed`; không thấy Cloudflare (chỉ `dns-prefetch cdnjs.cloudflare.com`); asset core WordPress qua Jetpack CDN `c0.wp.com` (36 script), first-party 20 script.
- **API lộ ra:** `/wp-json/wp/v2/product` (200, công khai — dùng để lấy 120 sản phẩm), `/wp-json/wp/v2/pages|posts` (200), `/wp-sitemap.xml` (200), `/?wc-ajax=get_refreshed_fragments` (200 JSON), `/wc-api/v3/` → `woocommerce_api_disabled`, WooCommerce Store API `/wc/store/v1/*` → 404 (không bật), `/graphql`, `/api/` → 404.
- **Cookie sau khi load trang chủ:** không có cookie nào (WooCommerce chỉ set khi thêm giỏ).

## 4. Tích hợp
- **Thanh toán (thấy ở checkout):** "Chuyển khoản ngân hàng" (bacs) và "Thanh toán khi nhận hàng" (cod). Không VNPay/MoMo/ZaloPay/OnePay/thẻ.
- **Vận chuyển:** không có dòng phí ship ở giỏ/checkout (`tr.shipping` không tồn tại); footer chỉ hiện logo Viettel Post (ảnh từ assets.parcelperform.com).
- **Tracking & ads:** không thấy GA4/GTM/Meta Pixel/TikTok (không có `G-`, `GTM-`, `fbevents.js`); chỉ Jetpack Stats (`stats.wp.com`).
- **Chat / CRM:** Facebook Customer Chat `fb-customerchat` với `page_id=100282411711448` (SDK `connect.facebook.net/.../xfbml.customerchat.js`); không Zalo/Subiz/Tawk.
- **Đăng nhập xã hội:** không thấy nút (plugin nextend-social-login có cài nhưng không render).
- **Khác:** PWA (`/pwa-manifest.json`, `pwa-register-sw.js`), Facebook Page Plugin iframe ở footer.

## 5. Tính năng người dùng đã quan sát
- Danh mục: 20 danh mục WooCommerce, trang danh mục full-width, tiêu đề uppercase + gạch xanh, sắp xếp (select `orderby` 5 lựa chọn), phân trang 32/trang (4 trang), không load-more; **không** bộ lọc ở trang shop (price filter chỉ ở sidebar trang chủ/giỏ/checkout).
- Sản phẩm: 120 sản phẩm **đều simple** (không biến thể), không giảm giá, hiện "còn N hàng"; gallery 1 ảnh (11 sản phẩm có nhiều ảnh) + zoom hover (WP Image Zoooom: lens 243×219, cửa sổ 400×360); tab "Mô tả"/"Đánh giá (0)" có form đánh giá (rating 1–5, nhận xét, tên, email); 4 "Sản phẩm tương tự"; nút "Mua hàng" + "Add to wishlist" + "Compare"; thanh sticky "Mua Hàng" khi cuộn; share Facebook (Sassy). Không flash sale/đếm ngược, không "Mua ngay" riêng.
- Thẻ sản phẩm: hover hiện "Quick View" (modal YITH), icon wishlist/compare góc trái.
- Tìm kiếm: icon trên menu mở modal `#myModal` (form GET `s=`), **không** live search; header còn ô tìm theo danh mục (`product_cat`).
- Giỏ hàng: trang riêng `/cart/` (không drawer), ô mã ưu đãi, cập nhật số lượng, không cross-sell; sidebar có "Sản phẩm vừa được xem".
- Checkout: 1 trang, cùng domain, **guest checkout** được; trường: Tên, Họ, Địa chỉ (nhập tay, không dropdown tỉnh/quận), SĐT, Email, "Tạo tài khoản mới?" + mật khẩu, Ghi chú; toggle đăng nhập và mã ưu đãi; không checkbox điều khoản.
- Tài khoản `/my-account/`: đăng nhập (username/email + mật khẩu, ghi nhớ), đăng ký (email + mật khẩu), quên mật khẩu; không social login.
- Blog "Góc Chia Sẻ": 10 bài, meta "Posted on … by J86 Store", form bình luận WordPress, điều hướng bài trước/sau, sidebar.
- Trang tĩnh: Liên hệ (chỉ text, không CF7 form dù plugin có cài), Giới thiệu, Hướng dẫn đặt hàng, Chính sách đổi trả, Privacy policy, Thêm ứng dụng J86 vào mobile.
- Khác: popup không có; widget nổi sau khi cuộn (cart/wishlist/account + nút lên đầu trang).

## 6. Cấu trúc URL
- Sản phẩm: `/product/<slug>/` · Danh mục: `/product-category/<slug>/` (+ `/page/N/`) · Tag: `/product-tag/<slug>/` · Shop: `/shop/` (+ `/page/N/`) · Tìm kiếm: `/?s=<q>&post_type=product&product_cat=<slug>`
- Blog: `/category/goc-chia-se/`, bài viết: `/<slug>/` (root-level) · Trang tĩnh: `/<slug>/`
- Giỏ/Checkout/Tài khoản: `/cart/`, `/checkout/`, `/checkout/order-received/<id>/`, `/my-account/`, `/wishlist/`

## 7. Kết quả dò endpoint
| Path | Status | Redirect/final URL | Ghi chú |
|---|---|---|---|
| /robots.txt | 200 | | `Disallow: /wp-admin/`, `Sitemap: /wp-sitemap.xml` |
| /sitemap.xml | 302 | /wp-sitemap.xml | sitemap index WordPress |
| /products.json?limit=1 | 404 | | không phải Shopify/Haravan |
| /collections.json?limit=1 | 404 | | |
| /cart.js | 404 | | |
| /wp-json/ | 200 | | JSON, name "", description "ĐẸP MỖI GIÂY - KHỎE MỖI NGÀY" |
| /wp-login.php | 200 | | form đăng nhập WordPress |
| /admin | 302 | /wp-admin/ → /wp-login.php?redirect_to=… | |
| /account/login | 404 | | |
| /api/ | 404 | | |
| /graphql | 404 | | |
| /livewire/livewire.js | 404 | | không Laravel |
| /manifest.json | 404 | | PWA dùng `/pwa-manifest.json` (200) |
| /wc-api/v3/ | 404 | | `woocommerce_api_disabled` |
| /?wc-ajax=get_refreshed_fragments | 200 | | JSON fragments giỏ hàng |

## 8. Chưa chắc / cần kiểm tra thêm
- Nhà cung cấp hosting cụ thể (chỉ biết LiteSpeed, PHP 7.2) — cần tra DNS/ASN.
- Facebook Customer Chat có thực sự hiển thị cho khách (headless không render iframe chat).
- Đánh giá sản phẩm: mọi sản phẩm hiện 0 đánh giá; shop card có sao (`star-rating` 5.00) ở 3–4 sản phẩm — dữ liệu rating chưa scrape được vì listing chỉ hiện "Được xếp hạng 5.00 5 sao".
- Vận chuyển: có thể cấu hình "free shipping" ẩn — checkout không hiện dòng ship.

## Phụ lục — Đối chiếu với bản clone (sau khi bổ sung)
| Tính năng gốc | Trạng thái clone |
|---|---|
| WordPress/WooCommerce SSR | Next.js 16 SSR + JSON db (`src/lib/db.ts`) |
| AJAX add-to-cart + notice | có (`AddToCartButton`, `ProductPageNotice`) |
| Quick View, wishlist, compare | Quick View + wishlist có; Compare chỉ là link |
| Zoom ảnh sản phẩm | có (`ProductGallery`) |
| Modal tìm kiếm + tìm theo danh mục | có (`SearchModal`, header form → `/shop/`) |
| Sản phẩm vừa được xem | có (`RecentlyViewedWidget`) |
| Đăng nhập/đăng ký/quên mật khẩu/tạo tài khoản khi checkout | có (`customer-auth.ts`, `/my-account/`) |
| COD + chuyển khoản, không phí ship | có |
| Blog + bình luận + prev/next | có (bình luận chỉ hiển thị, không lưu) |
| PWA manifest, robots, sitemap | có (`app/manifest.ts`, `robots.ts`, `sitemap.ts`) |
| Facebook Customer Chat | tuỳ chọn qua `NEXT_PUBLIC_FB_PAGE_ID` |
| Đánh giá sản phẩm (lưu) , mã ưu đãi thật, email | **chưa** — chỉ giao diện |
