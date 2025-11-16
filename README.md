# KTPM E-commerce Website (Trang web thương mại điện tử KTPM)

[![CI Pipeline](https://github.com/phucmanh1310/CNPM/actions/workflows/ci.yml/badge.svg)](https://github.com/phucmanh1310/CNPM/actions/workflows/ci.yml)
[![Deploy Backend](https://github.com/phucmanh1310/CNPM/actions/workflows/deploy-render.yml/badge.svg)](https://github.com/phucmanh1310/CNPM/actions/workflows/deploy-render.yml)
[![Deploy Frontend](https://github.com/phucmanh1310/CNPM/actions/workflows/deploy-vercel.yml/badge.svg)](https://github.com/phucmanh1310/CNPM/actions/workflows/deploy-vercel.yml)

## Thành viên của dự án

1.  Trần Nguyễn Phúc Mạnh | ID:3122411121
2.  Nguyễn Vũ Quang Minh | ID: 3122411126

## Mục lục

1.  [Mô tả dự án](#mô-tả-dự-án)
2.  [Yêu cầu tiên quyết](#yêu-cầu-tiên-quyết)
3.  [Thiết lập Backend](#thiết-lập-backend)
4.  [Thiết lập Frontend](#thiết-lập-frontend)
5.  [Chạy ứng dụng](#chạy-ứng-dụng)
6.  [Các điểm cuối API](#các-điểm-cuối-api)
7.  [Kiểm thử](#kiểm-thử)
8.  [CI/CD và Quy trình làm việc](#cicd-và-quy-trình-làm-việc)
9.  [Branch Protection](#branch-protection)
10. [Triển khai](#triển-khai)

## Mô tả dự án

Ứng dụng thương mại điện tử full-stack.

## Yêu cầu tiên quyết

- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 20.x trở lên) và [npm](https://www.npmjs.com/) hoặc [yarn](https://yarnpkg.com/).
- Đã cài đặt và chạy [MongoDB](https://www.mongodb.com/) (phiên bản 7.0 trở lên).
- [Git](https://git-scm.com/) để quản lý version control.
- [Docker](https://www.docker.com/) (tùy chọn, cho môi trường phát triển containerized).

## Thiết lập Backend

1.  Di chuyển đến thư mục `BackEnd`:

    ```bash
    cd BackEnd
    ```

2.  Cài đặt các dependencies (khuyến nghị dùng yarn):

    ```bash
    yarn install
    # hoặc
    npm install
    ```

3.  Cấu hình các biến môi trường:
    - Tạo file `.env` trong thư mục `BackEnd`.
    - Thêm các biến sau:

      ```env
      PORT=5000
      MONGO_URI=mongodb://admin:password@localhost:27017/ktpm?authSource=admin
      JWT_SECRET=your-secret-key-here
      CLOUDINARY_CLOUD_NAME=your-cloudinary-name
      CLOUDINARY_API_KEY=your-cloudinary-key
      CLOUDINARY_API_SECRET=your-cloudinary-secret
      EMAIL_USER=your-email@gmail.com
      EMAIL_PASS=your-app-password
      NODE_ENV=development
      ```

4.  Chạy backend server:

    ```bash
    yarn dev
    # hoặc
    npm run dev
    ```

    Production:

    ```bash
    yarn start
    # hoặc
    npm start
    ```

## Thiết lập Frontend

1.  Di chuyển đến thư mục `FrontEnd`:

    ```bash
    cd FrontEnd
    ```

2.  Cài đặt các dependencies:

    ```bash
    yarn install
    # hoặc
    npm install
    ```

3.  Cấu hình các biến môi trường:
    - Tạo file `.env` trong thư mục `FrontEnd`.
    - Thêm các biến sau:

      ```env
      VITE_API_BASE_URL=http://localhost:5000
      VITE_GEOAPIKEY=your-geoapify-api-key
      ```

4.  Chạy frontend server:

    ```bash
    yarn dev
    # hoặc
    npm run dev
    ```

    Build production:

    ```bash
    yarn build
    # hoặc
    npm run build
    ```

## Chạy ứng dụng

### Tạo Admin User đầu tiên

Trước khi chạy ứng dụng, bạn cần tạo tài khoản admin đầu tiên:

```bash
cd BackEnd
node scripts/createAdminUser.js
```

### Truy cập ứng dụng

Truy cập ứng dụng trên trình duyệt: `http://localhost:5173`

### Các tài khoản Demo

**Admin Account:**

- Email: `admin@gmail.com`
- Password: `admin`
- Truy cập: `http://localhost:5173/admin-login`

**User Accounts:**

- Email: `manhgamer1013@gmail.com` | Password: `123456`
- Email: `phucmanhtran08@gmail.com` | Password: `123456`
- Email: `test@gmail.com` | Password: `manhtran11`

## Các điểm cuối API

- `GET /api/items`: Lấy danh sách các sản phẩm.
- `POST /api/users/register`: Đăng ký người dùng mới.
- `POST /api/users/login`: Đăng nhập người dùng.
- `...`

## Kiểm thử

Dự án sử dụng Jest cho unit testing và integration testing.

### Backend Tests

```bash
cd BackEnd

# Chạy tất cả tests
yarn test

# Chạy tests với coverage
yarn test:coverage

# Chạy tests trong CI mode
yarn test:ci

# Chạy integration tests
yarn test:ci -- tests/integration
```

### Frontend Tests

```bash
cd FrontEnd

# Chạy tất cả tests
yarn test

# Chạy tests với coverage
yarn test:coverage

# Chạy tests trong CI mode
yarn test:ci
```

### Test từ root directory

```bash
# Chạy tất cả tests (backend + frontend)
npm test

# Chạy với coverage
npm run test:coverage
```

**Tài liệu chi tiết:**

- [Hướng dẫn Unit Testing](docs/2.UNIT_TESTING_GUIDE.md)
- [Hướng dẫn Integration Testing](docs/3.INTEGRATION_TESTING_GUIDE.md)
- [Test Cases - Blackbox](docs/BLACKBOX_TEST_CASES.md)
- [Test Cases - Whitebox](docs/WHITEBOX_TEST_CASES.md)

## CI/CD và Quy trình làm việc

Dự án sử dụng GitHub Actions cho CI/CD pipeline với trunk-based development workflow.

### CI Pipeline

Tự động chạy khi:

- Push code lên nhánh `main` hoặc `feature/**`
- Tạo Pull Request vào `main`

**Các bước CI:**

1. **Code Quality** - ESLint check và security audit
2. **Backend Tests** - Unit tests + Integration tests với MongoDB
3. **Frontend Tests** - Unit tests + Build verification
4. **Docker Build** - Build và push images lên GitHub Container Registry

### CD Pipeline

**Backend (Render):**

- Auto-deploy khi merge vào `main`
- URL: `https://your-backend.onrender.com`

**Frontend (Vercel):**

- Auto-deploy khi merge vào `main`
- URL: `https://your-frontend.vercel.app`

### Quy trình làm việc đề xuất

1. **Tạo nhánh feature mới:**

   ```bash
   git checkout -b feature/ten-tinh-nang
   ```

2. **Phát triển và commit:**

   ```bash
   git add .
   git commit -m "feat: mô tả tính năng"
   ```

   Commit message convention:
   - `feat:` - Tính năng mới
   - `fix:` - Sửa bug
   - `docs:` - Cập nhật tài liệu
   - `test:` - Thêm/sửa tests
   - `chore:` - Công việc bảo trì
   - `refactor:` - Refactor code

3. **Push nhánh feature:**

   ```bash
   git push origin feature/ten-tinh-nang
   ```

4. **Tạo Pull Request trên GitHub:**
   - CI sẽ tự động chạy
   - Đảm bảo tất cả checks pass (màu xanh ✅)
   - Request review từ team members

5. **Merge vào main:**
   - Sau khi được approve và CI pass
   - CD sẽ tự động deploy lên production

## Branch Protection

Nhánh `main` được bảo vệ với các quy tắc:

✅ **Không cho phép push trực tiếp** - Phải qua Pull Request

✅ **Bắt buộc CI pass** - Tất cả tests và checks phải pass

✅ **Require review** - Ít nhất 1 người review code

✅ **Branch phải up-to-date** - Phải rebase với main mới nhất

### Thiết lập Branch Protection

**Qua GitHub UI:**

1. Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. Bật các tùy chọn:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Chọn: `code-quality`, `backend-tests`, `frontend-tests`
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

**Qua GitHub CLI:**

```bash
gh api \
  -X PUT \
  "repos/phucmanh1310/CNPM/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f restrictions=null \
  -f required_status_checks='{"strict":true,"checks":[{"context":"code-quality"},{"context":"backend-tests"},{"context":"frontend-tests"}]}'
```

### Nếu bị reject khi push

```bash
# Lỗi: protected branch
remote: error: GH006: Protected branch update failed

# Giải pháp: Tạo nhánh feature và PR
git checkout -b feature/my-changes
git push origin feature/my-changes
# Sau đó tạo PR trên GitHub
```

## Triển khai

### Môi trường Production

**Backend:** Render

- URL: `https://your-backend.onrender.com`
- Auto-deploy từ `main` branch
- Health check: `/health`

**Frontend:** Vercel

- URL: `https://your-frontend.vercel.app`
- Auto-deploy từ `main` branch
- Preview deployments cho mọi PR

### Local Development với Docker

```bash
# Chạy toàn bộ stack (backend + frontend + mongodb)
docker-compose up --build

# Chỉ backend + mongodb
docker-compose up backend mongodb

# Chạy tests trong Docker
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

### Tài liệu triển khai

- [CI/CD Implementation Guide](docs/4.CI_CD_IMPLEMENTATION_GUIDE.md)
- [Deployment Guide](docs/5.DEPLOYMENT_GUIDE.md)
- [Lý thuyết CI/CD](docs/LythuyetCICD.md)
- [Vercel & Render Setup](docs/VERCEL_RENDER_SETUP.md)
- [CI/CD Demo Guide](docs/CI_CD_DEMO_GUIDE.md)

## Cấu trúc dự án

```
KTPM/
├── BackEnd/              # Node.js + Express API
│   ├── controllers/      # Request handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middlewares/      # Custom middlewares
│   ├── utils/            # Helper functions
│   ├── tests/            # Unit + Integration tests
│   └── scripts/          # Database scripts
├── FrontEnd/             # React + Vite
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── redux/        # State management
│   └── tests/            # Frontend tests
├── docs/                 # Documentation
├── .github/              # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml        # CI pipeline
│       ├── deploy-render.yml
│       └── deploy-vercel.yml
├── docker-compose.yml    # Docker setup
└── README.md
```

## Scripts hữu ích

### Root directory

```bash
# Development
npm run dev              # Chạy cả backend và frontend
npm run dev:backend      # Chỉ backend
npm run dev:frontend     # Chỉ frontend

# Testing
npm test                 # Chạy tất cả tests
npm run test:coverage    # Tests với coverage

# Linting
npm run lint             # Lint cả backend và frontend
npm run lint:fix         # Auto-fix lint issues

# Docker
npm run docker:dev       # Chạy với Docker
npm run docker:test      # Chạy tests trong Docker
```

## Xử lý sự cố

### MongoDB connection failed

```bash
# Kiểm tra MongoDB đang chạy
docker ps | grep mongo

# Hoặc start MongoDB
docker-compose up mongodb -d
```

### Port đã được sử dụng

```bash
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <process_id> /F
```

### Tests fail locally nhưng pass trên CI

```bash
# Clear cache và reinstall
rm -rf node_modules BackEnd/node_modules FrontEnd/node_modules
npm install
cd BackEnd && npm install
cd ../FrontEnd && npm install

# Clear test cache
cd BackEnd && npm test -- --clearCache
cd ../FrontEnd && npm test -- --clearCache
```

## Đóng góp

1. Fork repository
2. Tạo nhánh feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request
6. Đợi CI pass và được review
7. Merge vào main

## License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## Liên hệ

- Phúc Mạnh - phucmanhtran08@gmail.com
- Project Link: [https://github.com/phucmanh1310/CNPM](https://github.com/phucmanh1310/CNPM)
