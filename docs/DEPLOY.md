# Triển khai: DB đăng nhập, TrueNAS, phiên bản và CI/CD tới linconnn.io.vn

## 1. Cơ sở dữ liệu cho đăng nhập và cách duy trì trên TrueNAS

### Hiện trạng
Đăng nhập (admin và khách hàng) đã hoạt động với DB **SQLite nhúng trong container** (schema + migration trong `src/lib/sqlite.ts`, xem `docs/ARCHITECTURE.md`):
- Admin: không lưu trong DB, cấu hình bằng `ADMIN_USER`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
- Khách hàng: bảng `customers` trong `lienstore.db` (mật khẩu băm scrypt). Đơn hàng (`orders`, `order_items`), sản phẩm, danh mục, trang, bài viết cũng nằm trong file này.

Vì vậy **không cần dựng thêm MySQL/Postgres** để chạy. Việc cần làm là **giữ file DB ngoài container** để dữ liệu không mất khi cập nhật image.

### Các bước trên TrueNAS SCALE (24.10 Electric Eel hoặc 25.04)
1. **Tạo dataset**: Datasets → Add → `apps/lienstore` (ví dụ `/mnt/<pool>/apps/lienstore`). Tạo thư mục con `data`. Mở Shell và cấp quyền cho user `node` (uid 1000) của image:
   ```sh
   sudo chown -R 1000:1000 /mnt/<pool>/apps/lienstore
   ```
2. **Tạo secrets**: đổi `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (chuỗi ngẫu nhiên ≥ 32 ký tự, ví dụ `openssl rand -base64 32`).
3. **Cài app**: Apps → Discover Apps → menu ⋮ → **Install via YAML** → dán `deploy/truenas-app.yaml` sau khi thay `<owner>`, `<pool>`, mật khẩu. Cổng LAN mặc định `30080`.
4. **Lần chạy đầu**: app thấy `/app/data/lienstore.db` chưa có sẽ tạo DB, chạy migration và nhập seed từ `/app/seed/seed.json` trong image. Ảnh admin tải lên và bill đơn hàng nằm ở `/app/data/uploads` — cùng dataset, nên snapshot dataset là đủ để backup cả DB lẫn file. Từ đó mọi đơn hàng, tài khoản, chỉnh sửa admin được ghi vào dataset này; image mới có migration mới sẽ tự nâng schema khi khởi động.
5. **Kiểm tra**: `http://<ip-truenas>:30080/api/health/` trả `{"ok":true,"db":{"engine":"sqlite","schemaVersion":1,...}}`; đăng nhập `/admin/login/`.
6. **Backup**: bật Periodic Snapshot cho dataset `apps/lienstore` (mỗi ngày, giữ 30 bản). Muốn khôi phục: Stop app, copy `lienstore.db` từ snapshot, Start.

> Chưa có image trên registry? Dùng **cách build ngay trên NAS** trong `deploy/README.md` (`push-source-to-truenas.ps1` + `truenas-build.sh` + `truenas-app.local.yaml`).

### Khi nào chuyển sang Postgres
Khi cần chạy nhiều instance song song hoặc full-text search lớn. Cách làm: cài app Postgres từ catalog TrueNAS, viết lại `src/lib/db.ts` (giữ nguyên các hàm export) dùng `pg`/Drizzle, nhập dữ liệu từ `npm run db:export -- --all backup.json`. Toàn bộ UI, actions không phải sửa vì chỉ gọi qua `src/lib/db.ts`. Với 1 instance, SQLite đủ dùng tới hàng chục nghìn đơn.

## 2. Đánh phiên bản (SemVer)
- Định dạng `MAJOR.MINOR.PATCH` trong `package.json` và tag git `vX.Y.Z`.
  - PATCH: sửa lỗi, chỉnh giao diện nhỏ. MINOR: tính năng mới không phá vỡ (ví dụ thêm quản lý danh mục). MAJOR: đổi cấu trúc DB hoặc URL.
- Quy trình phát hành từ máy dev:
  ```sh
  git checkout main && git pull
  npm run check                 # lint + typecheck + build
  npm version minor -m "release: v%s"   # tạo commit + tag v1.1.0
  git push --follow-tags
  ```
- Tag đẩy lên GitHub kích hoạt workflow **Release**: build image đa kiến trúc, đẩy `ghcr.io/<owner>/lienstore` với các tag `1.1.0`, `1.1`, `latest`, `sha-…`, tạo GitHub Release với ghi chú tự sinh, rồi (nếu có secrets) SSH vào TrueNAS để kéo image và redeploy.
- Xem phiên bản đang chạy: `GET /api/health` trả `version`.

## 3. CI/CD từ GitHub tới TrueNAS
### Chuẩn bị repo
1. Tạo repo mới trên GitHub (không push vào repo template gốc):
   ```sh
   git remote remove origin
   git remote add origin git@github.com:<owner>/lienstore.git
   git add -A && git commit -m "feat: lienstore clone" && git push -u origin main
   ```
2. Settings → Actions → General → Workflow permissions: **Read and write** (để push image lên GHCR).
3. Sau lần release đầu, vào Packages → `lienstore` → Package settings → đặt **Public** (hoặc cấu hình TrueNAS đăng nhập GHCR nếu để private).

### Pipeline
| Workflow | Kích hoạt | Việc làm |
|---|---|---|
| `ci.yml` | push `main`, pull request | `npm run lint`, `typecheck`, `build`; build image và gọi `/api/health` trong container |
| `release.yml` | tag `v*.*.*` | build + push GHCR, GitHub Release, job `deploy-truenas` (tuỳ chọn) |

### Tự động redeploy trên TrueNAS
Job `deploy-truenas` cần 3–4 secrets: `TRUENAS_HOST`, `TRUENAS_USER`, `TRUENAS_SSH_KEY`, `TRUENAS_APP_NAME` (mặc định `lienstore`).
- Tạo khoá: `ssh-keygen -t ed25519 -f truenas_deploy`; thêm public key vào Credentials → Users → truenas_admin → Authorized Keys; bật SSH service; cho user dùng `sudo` không mật khẩu với `midclt`.
- Job chạy `sudo midclt call -j app.pull_images lienstore '{"redeploy": true}'`. Nếu bản TrueNAS của bạn không có lệnh này, thay bằng `midclt call -job app.redeploy lienstore` sau khi đổi tag image trong app sang phiên bản mới, hoặc bấm **Update** trong giao diện Apps.
- Vì TrueNAS thường nằm sau NAT, đặt `TRUENAS_HOST` là địa chỉ **Tailscale** của NAS (app Tailscale đã có trong danh sách apps của bạn) và cài Tailscale trong runner bằng `tailscale/github-action`, hoặc dùng **self-hosted runner** chạy ngay trên TrueNAS. Nếu không muốn mở đường SSH, bỏ job này và cập nhật thủ công: Apps → lienstore → Update.

## 4. Đưa lên domain linconnn.io.vn
Khuyến nghị **Cloudflare Tunnel** vì không cần mở port trên router và có HTTPS sẵn.
1. Chuyển nameserver của `linconnn.io.vn` về Cloudflare (tại nhà đăng ký .vn), thêm site vào Cloudflare (gói Free).
2. Zero Trust → Networks → Tunnels → Create tunnel (Cloudflared) → lấy token.
3. Trên TrueNAS cài app **Cloudflared** (catalog community) với token đó, hoặc thêm service vào YAML:
   ```yaml
     cloudflared:
       image: cloudflare/cloudflared:latest
       command: tunnel --no-autoupdate run --token <TOKEN>
       restart: unless-stopped
   ```
4. Trong Tunnel → Public Hostname: `linconnn.io.vn` → Service `http://lienstore:3000` (cùng compose) hoặc `http://<ip-truenas>:30080`. Thêm `www.linconnn.io.vn` nếu cần.
5. Đặt `NEXT_PUBLIC_SITE_URL=https://linconnn.io.vn` trong YAML app rồi Update app (robots/sitemap dùng giá trị này). Cookie phiên đã bật `secure` khi `NODE_ENV=production`.
6. Cloudflare → SSL/TLS: Full; bật "Always Use HTTPS".

Phương án thay thế: mở port 443 trên router → app **Nginx Proxy Manager** trên TrueNAS → Proxy Host `linconnn.io.vn` → `http://<ip-truenas>:30080`, chứng chỉ Let's Encrypt; DNS A record trỏ về IP công cộng (dùng DDNS nếu IP động).

## 4b. Tự động cập nhật (pull-based, không mở port NAS)

GitHub không gọi vào được NAS ở nhà, nên NAS tự kéo image mới:

| Môi trường | App TrueNAS | Image theo dõi | Khi nào có bản mới |
| --- | --- | --- | --- |
| dev.linconnn.io.vn | `lienstore` (port 30080) | `ghcr.io/anhld-rikkei/lienstore:dev` | **mỗi commit lên `main`** (job `publish-dev` trong `ci.yml`, sau khi lint/test/smoke pass) |
| linconnn.io.vn | `lienstore-prod` (port 30081) | `ghcr.io/anhld-rikkei/lienstore:latest` | **mỗi tag `vX.Y.Z`** (`release.yml`) |

Thiết lập một lần trên TrueNAS:

1. Chép `deploy/truenas-autoupdate.sh` vào dataset, ví dụ `/mnt/apps-pool/lienstore/truenas-autoupdate.sh` (`chmod +x`).
2. **System → Advanced Settings → Cron Jobs → Add** (2 job, chạy bằng `root`, Schedule `*/5 * * * *`, tắt "Hide Standard Output"):
   - `sh /mnt/apps-pool/lienstore/truenas-autoupdate.sh lienstore-prod ghcr.io/anhld-rikkei/lienstore:latest`
   - `sh /mnt/apps-pool/lienstore/truenas-autoupdate.sh lienstore ghcr.io/anhld-rikkei/lienstore:dev`
3. Cài app bằng `deploy/truenas-app.yaml` (prod, tag `latest`) và `deploy/truenas-app.dev.yaml` (dev, tag `dev`).

Script chỉ redeploy khi image id thay đổi (không restart vô ích), gọi qua `midclt` để Apps UI của TrueNAS vẫn đúng trạng thái (không dùng Watchtower cạnh ix-apps), chờ `/api/health/` và ghi log ở `/var/log/lienstore-autoupdate.log`. Đặt `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` trong Cron Job để nhận thông báo. Migration schema và seed sync chạy tự động khi container mới khởi động; DB và uploads nằm trong dataset nên không mất. Muốn khoá prod ở một phiên bản cụ thể thì đổi image sang `:1.5.1` và tắt cron job của prod.

## 5. Checklist trước khi mở công khai
- [ ] Đổi `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
- [ ] Snapshot dataset `apps/lienstore` theo lịch.
- [ ] `data/seed.json` chỉ chứa catalogue (không có đơn/tài khoản test); sau khi sửa sản phẩm trong admin ở máy dev chạy `npm run db:export` để cập nhật seed trước khi build image.
- [ ] Xem lại nội dung trang tĩnh (Liên hệ, chính sách) và thông tin footer cho cửa hàng của bạn.
- [ ] (Tuỳ chọn) `NEXT_PUBLIC_FB_PAGE_ID` nếu muốn chat Messenger.
