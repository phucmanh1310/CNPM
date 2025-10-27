# CI/CD Pipeline (Trunk-based Lite)

Tài liệu này mô tả quy trình CI/CD tối giản nhưng chuyên nghiệp cho dự án solo dev.

## 1) Chiến lược Git

- Nhánh dài hạn: `main`
- Nhánh ngắn hạn:
  - `feature/<slug>`: phát triển tính năng (vd: `feature/auth-flow`)
  - `fix/<slug>`: sửa lỗi nhỏ
- Quy ước commit: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- Release: tạo tag `vX.Y.Z` (SemVer) trên `main`

## 2) Workflows hiện có

- CI: `.github/workflows/ci.yml`
  - Trigger: push vào `main`, `feature/**`; PR vào `main`
  - Jobs: code-quality, backend-tests, frontend-tests, build-images
- Staging (manual): `.github/workflows/deploy-staging.yml`
  - Trigger: `workflow_dispatch` (bấm chạy tay)
  - Deploy lên Railway theo secrets đã cấu hình
- Production: `.github/workflows/deploy-prod.yml`
  - Trigger: push tags `v*.*.*`
  - Deploy lên Railway environment `production`

## 3) Secrets cần có

Vào GitHub > Settings > Secrets and variables > Actions:

Bắt buộc

- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `MOMO_ACCESS_KEY`
- `MOMO_PARTNER_CODE`
- `MOMO_SECRET_KEY`
- `RAILWAY_TOKEN`

Tuỳ chọn (cho health checks)

- `STAGING_URL`
- `PROD_URL`

## 4) Quy trình làm việc hàng ngày

1. Tạo nhánh từ `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature
   ```
2. Code + commit (pre-commit sẽ format code):
   ```bash
   git add .
   git commit -m "feat: add feature"
   ```
3. Push để chạy CI:
   ```bash
   git push origin feature/your-feature
   ```
4. Mở PR vào `main` và kiểm tra tab Checks.
5. Merge khi CI green.

## 5) Deploy Staging (manual)

Vào Actions > `Deploy to Staging` > `Run workflow`.

- Input `service` (backend/frontend/both), mặc định `both`.
- Yêu cầu secret `RAILWAY_TOKEN`. Health check dùng `STAGING_URL` nếu có.

## 6) Release Production

1. Tạo tag:
   ```bash
   git checkout main
   git pull origin main
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. Workflow `Deploy to Production` sẽ tự chạy: deploy backend + frontend (`railway up --environment production`).
3. Health check dùng `PROD_URL` nếu có.

## 7) Best Practices

- Bật Branch Protection cho `main` (status checks bắt buộc).
- Mỗi thay đổi đi qua PR (kể cả solo dev) để có lịch sử review rõ ràng.
- Dùng `npm run docker:test` để test gần giống CI.
- Ghi chú release trong GitHub Releases (changelog ngắn).

## 8) Lệnh nhanh

```bash
# Dev
npm run dev
# Test & Coverage
npm test && npm run test:coverage
# Lint
npm run lint && npm run lint:fix
# Docker test
npm run docker:test
```
