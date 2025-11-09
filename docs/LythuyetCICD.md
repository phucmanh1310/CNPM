# Lý Thuyết CI/CD và Testing Methods - Chi Tiết

## 1. CI/CD (Continuous Integration/Continuous Deployment)

### 1.1 Lý thuyết CI/CD

CI/CD là quy trình tự động hóa việc tích hợp code (CI) và triển khai (CD).

- **CI**: Tự động build, test, và merge code khi có thay đổi
- **CD**: Tự động deploy code đã test thành công lên môi trường production

**Lợi ích**:

- Phát hiện lỗi sớm
- Tăng tốc độ phát triển
- Đảm bảo chất lượng code
- Tự động hóa quy trình triển khai

### 1.2 GitHub Actions Workflow (từ `.github/workflows/ci.yml`)

**Cấu trúc cơ bản của workflow**:

```yaml
name: CI Pipeline # Tên workflow

on: # Khi nào workflow chạy
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env: # Biến môi trường
  NODE_VERSION: "20"

jobs: # Các job cần thực hiện
  code-quality:
    runs-on: ubuntu-latest # Chạy trên máy Ubuntu
    steps:
      - name: Checkout code
        uses: actions/checkout@v4 # Action checkout code

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
```

**Các loại trigger**:

- `push`: Khi push code lên branch
- `pull_request`: Khi tạo PR
- `schedule`: Chạy theo lịch (cron)
- `workflow_dispatch`: Chạy thủ công

**Các action phổ biến**:

- `actions/checkout@v4`: Clone code từ repo
- `actions/setup-node@v4`: Cài đặt Node.js
- `docker/build-push-action@v5`: Build và push Docker image
- `codecov/codecov-action@v3`: Upload coverage report

### 1.3 Docker trong CI/CD (từ `BackEnd/Dockerfile` và `FrontEnd/Dockerfile`)

**Multi-stage build**:

```dockerfile
# Multi-stage build cho Node.js Backend
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Development stage
FROM base AS dev
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER nodejs
EXPOSE 5000
CMD ["node", "index.js"]
```

**Lý thuyết Multi-stage build**:

- Giảm kích thước image cuối cùng
- Tách biệt dependencies và source code
- Bảo mật tốt hơn (non-root user)

### 1.4 Docker Compose cho testing (từ `docker-compose.test.yml`)

```yaml
version: "3.8"

services:
  mongodb-test:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27018:27017"
    tmpfs: # Sử dụng RAM thay vì disk
      - /data/db

  backend-test:
    build:
      context: ./BackEnd
      target: test # Target trong Dockerfile
    environment:
      NODE_ENV: test
      MONGO_URI: mongodb://admin:password@mongodb-test:27017/ktpm_test
    depends_on:
      - mongodb-test
```

## 2. Testing Framework

### 2.1 Backend Testing với Jest

**Jest Configuration** (từ `BackEnd/jest.config.js`):

```javascript
export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.cjs"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "models/**/*.js",
    "utils/**/*.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 15,
      lines: 15,
      statements: 15,
    },
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
```

**Lý thuyết Jest**:

- **Test Environment**: Môi trường chạy test (node cho backend, jsdom cho frontend)
- **Setup Files**: File chạy trước mỗi test suite
- **Coverage**: Đo lường % code được test
- **Matchers**: expect().toBe(), expect().toHaveBeenCalled()

### 2.2 Test Setup với MongoDB Memory Server (từ `BackEnd/tests/setup.cjs`)

```javascript
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

**Lý thuyết Test Setup**:

- `beforeAll`: Chạy 1 lần trước tất cả test
- `afterAll`: Chạy 1 lần sau tất cả test
- `beforeEach/afterEach`: Chạy trước/sau mỗi test case
- MongoDB Memory Server: Database ảo trong RAM, không ảnh hưởng DB thật

### 2.3 Unit Test Example (từ `BackEnd/tests/controllers/auth.test.js`)

```javascript
import request from "supertest";
import app from "../../index.js";
import User from "../../models/user.model.js";

describe("Auth Controller", () => {
  describe("POST /api/auth/register", () => {
    test("should register user with valid data", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "SecurePass123!",
        name: "New User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("registered successfully");
    });
  });
});
```

**Lý thuyết Unit Test**:

- **describe**: Nhóm các test case liên quan
- **test/it**: Định nghĩa 1 test case
- **Supertest**: Test HTTP endpoints
- **Matchers**: expect(value).toBe(expected)

### 2.4 Integration Test Example (từ `BackEnd/tests/integration/cart.integration.test.js`)

```javascript
import request from "supertest";
import { setupTestDB, teardownTestDB, clearTestDB, app } from "./setup.js";
import User from "../../models/user.model.js";

describe("Cart API Integration", () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Tạo test user
    const user = await User.create({
      email: "testuser@example.com",
      password: await hashPassword("password123"),
      name: "Test User",
    });
    userId = user._id;
    userToken = generateToken(userId);
  });

  describe("GET /api/cart", () => {
    test("should return empty cart for new user", async () => {
      const response = await request(app)
        .get("/api/cart")
        .set("Cookie", [`token=${userToken}`])
        .expect(200);

      expect(response.body.items).toEqual([]);
    });
  });
});
```

**Lý thuyết Integration Test**:

- Test toàn bộ flow: API → Database → Response
- Sử dụng database thật (memory server)
- Test authentication, authorization
- Test relationships giữa các model

### 2.5 Frontend Testing với Vitest (từ `FrontEnd/src/tests/setup.js`)

```javascript
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch
globalThis.fetch = vi.fn();
```

**Lý thuyết Vitest**:

- Thay thế Jest cho frontend
- Tích hợp tốt với Vite
- Mock browser APIs (matchMedia, IntersectionObserver)
- jsdom environment để test DOM

### 2.6 Component Test Example (từ `FrontEnd/src/components/__tests__/LoginForm.test.jsx`)

```javascript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, expect, test, describe } from "vitest";
import LoginForm from "../LoginForm";

const mockLogin = vi.fn();

describe("LoginForm Component", () => {
  beforeEach(() => {
    mockLogin.mockClear();
  });

  test("renders login form elements", () => {
    render(<LoginForm onLogin={mockLogin} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test("handles form submission with valid data", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });

    render(<LoginForm onLogin={mockLogin} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
```

**Lý thuyết Component Testing**:

- **React Testing Library**: Test user behavior, không implementation details
- **userEvent**: Simulate real user interactions
- **screen**: Query DOM elements
- **waitFor**: Wait for async operations
- **Mock functions**: Isolate component from dependencies

## 3. Các Pattern và Best Practices

### 3.1 Test Structure Pattern

```
tests/
├── unit/           # Unit tests (functions, utils)
├── integration/    # API integration tests
├── e2e/           # End-to-end tests
└── setup.js       # Global test setup
```

### 3.2 AAA Pattern (Arrange, Act, Assert)

```javascript
test("should do something", () => {
  // Arrange: Setup test data and mocks
  const input = "test input";
  const mockFn = vi.fn();

  // Act: Execute the code under test
  const result = functionUnderTest(input, mockFn);

  // Assert: Verify the result
  expect(result).toBe("expected output");
  expect(mockFn).toHaveBeenCalledWith(input);
});
```

### 3.3 Coverage Goals

- **Statements**: 80%+ (đã thực thi dòng code)
- **Branches**: 75%+ (đã test các nhánh điều kiện)
- **Functions**: 85%+ (đã gọi hàm)
- **Lines**: 80%+ (đã thực thi dòng code)

### 3.4 Mocking Strategies

- **API calls**: Mock với MSW hoặc vi.fn()
- **External services**: Mock modules
- **Browser APIs**: Mock trong setup file
- **Database**: Sử dụng memory database

## 4. Chạy Tests

### 4.1 Backend Tests

```bash
cd BackEnd
npm test                    # Chạy tất cả tests
npm run test:coverage      # Với coverage report
npm run test:ci           # Cho CI/CD
```

### 4.2 Frontend Tests

```bash
cd FrontEnd
npm test                   # Chạy tests
npm run test:ui           # Giao diện Vitest UI
npm run test:coverage     # Với coverage
```

### 4.3 CI/CD Tests

```bash
# Chạy local CI pipeline
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

## 5. Các Loại Testing

### 5.1 Unit Testing

- Test từng function/component riêng lẻ
- Mock tất cả dependencies
- Nhanh, isolated, dễ debug

### 5.2 Integration Testing

- Test sự tương tác giữa các modules
- Sử dụng database thật (memory)
- Test API endpoints, database operations

### 5.3 End-to-End Testing

- Test toàn bộ application flow
- Từ UI đến database
- Chậm nhất, nhưng cover most realistic scenarios

### 5.4 Performance Testing

- Load testing với Artillery
- Stress testing
- Memory leak detection

## 6. CI/CD Pipeline Stages

### 6.1 Code Quality Stage

```yaml
code-quality:
  steps:
    - name: Lint Check
      run: npm run lint
    - name: Security Audit
      run: npm audit --audit-level=moderate
    - name: Format Check
      run: npm run format:check
```

### 6.2 Testing Stage

```yaml
backend-tests:
  services:
    mongodb:
      image: mongo:7.0
  steps:
    - name: Run Unit Tests
      run: npm run test:ci
    - name: Run Integration Tests
      run: npm run test:integration
    - name: Upload Coverage
      uses: codecov/codecov-action@v3
```

### 6.3 Build Stage

```yaml
build-images:
  steps:
    - name: Build Docker Images
      uses: docker/build-push-action@v5
      with:
        context: ./BackEnd
        push: true
        tags: ghcr.io/${{ github.repository }}/backend:latest
```

### 6.4 Deploy Stage

```yaml
deploy:
  steps:
    - name: Deploy to Production
      run: |
        # Deploy logic here
        echo "Deploying to production..."
```

## 7. Environment Management

### 7.1 Environment Variables

```bash
# .env.test
NODE_ENV=test
MONGO_URI=mongodb://localhost:27017/test
JWT_SECRET=test-secret-key

# .env.production
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=production-secret-key
```

### 7.2 Secrets Management

- GitHub Secrets cho CI/CD
- AWS Secrets Manager cho production
- Environment-specific configuration

## 8. Monitoring và Alerting

### 8.1 Application Monitoring

- **Error Tracking**: Sentry
- **Performance**: New Relic, Datadog
- **Logs**: Winston + ELK Stack

### 8.2 Infrastructure Monitoring

- **Metrics**: Prometheus + Grafana
- **Alerts**: Slack notifications
- **Health Checks**: Automated endpoint monitoring

## 9. Best Practices

### 9.1 Code Quality

- ESLint + Prettier
- Pre-commit hooks với Husky
- Code review requirements
- Automated dependency updates

### 9.2 Security

- Dependency vulnerability scanning
- SAST (Static Application Security Testing)
- Container image scanning
- Secret scanning in commits

### 9.3 Performance

- Bundle size monitoring
- Lighthouse CI cho frontend
- Database query optimization
- Caching strategies

### 9.4 Documentation

- API documentation với Swagger
- Code documentation với JSDoc
- Deployment guides
- Troubleshooting guides

Với những kiến thức này, bạn có thể tự tạo và customize hệ thống CI/CD và testing cho dự án của mình. Các file trong dự án của bạn là ví dụ thực tế và hoạt động tốt.
