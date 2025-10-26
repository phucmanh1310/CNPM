# Unit Testing Guide - Step by Step Implementation

## 1. Backend Unit Testing Setup

### 1.1 Install Testing Dependencies

```bash
cd BackEnd

# Install Jest and related packages
npm install --save-dev jest supertest mongodb-memory-server @types/jest jest-environment-node

# Update package.json scripts
npm pkg set scripts.test="jest"
npm pkg set scripts.test:watch="jest --watch"
npm pkg set scripts.test:coverage="jest --coverage"
npm pkg set scripts.test:ci="jest --ci --coverage --watchAll=false"
```

### 1.2 Create Jest Configuration

```bash
# Create jest.config.js Lệnh này tạo file jest.config.js. Đây là file "luật chơi" cho Jest, nói cho nó biết:
$content = @'
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.mjs'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/**/__tests__/**/*.js'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    'middlewares/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  transform: {}
};
'@

Set-Content -Path jest.config.js -Value $content -Force
```

#### 1.2.1 Lưu ý cho dự án ESM (package.json có "type": "module")

Thêm các cấu hình sau vào jest.config.js để Jest chạy được ESM:

```js
// jest.config.js
export default {
  // ...các cấu hình khác
  transform: {},
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
};
```

#### 1.2.3 Nếu test file dùng import (ESM), cấu hình Babel cho Jest

Để Jest hiểu cú pháp import/export trong các file test (.js), cài đặt babel-jest và preset-env:

```bash
cd BackEnd
npm install --save-dev babel-jest @babel/preset-env @babel/core

# Tạo file babel.config.cjs tại BackEnd/
cat > babel.config.cjs << 'EOF'
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
      },
    ],
  ],
};
EOF

# Cập nhật jest.config.js để dùng babel-jest
# Thay transform: {}
# Bằng:
# transform: {
#   '^.+\\.[jt]sx?$': 'babel-jest',
# }
```

### 1.3 Create Test Setup File (ESM)

#### 1.2.2 Phương án thay thế nhanh (tránh lỗi ESM): dùng CommonJS cho setup

Nếu vẫn gặp lỗi ESM như "Cannot use import statement outside a module" hoặc lỗi validate config
của Jest, bạn có thể dùng file setup dạng CommonJS:

```bash
# Tạo tests/setup.cjs và cập nhật jest.config.js dùng file này
$content = @'
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.test" });

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
'@

Set-Content -Path tests/setup.cjs -Value $content -Force

# Cập nhật jest.config.js để dùng CJS setup
(Get-Content jest.config.js) -replace "setupFilesAfterEnv: \['<rootDir>/tests/setup.mjs'\]", "setupFilesAfterEnv: ['<rootDir>/tests/setup.cjs']" | Set-Content jest.config.js
```

```bash
# Đây là file tests/setup.mjs sẽ chạy trước mọi thứ (dùng đuôi .mjs để Jest hiểu là ESM).

# beforeAll: Chạy một lần duy nhất trước khi tất cả các test bắt đầu. Lệnh này khởi động MongoMemoryServer (DB ảo) và kết nối Mongoose vào đó.

# afterAll: Chạy một lần duy nhất sau khi tất cả các test kết thúc. Lệnh này dọn dẹp bằng cách xóa DB, ngắt kết nối Mongoose và tắt DB ảo.

# afterEach: Chạy sau mỗi bài test (mỗi test case). Lệnh này xóa sạch dữ liệu trong tất cả các collection. Điều này cực kỳ quan trọng để đảm bảo tính cô lập (isolation) – test A không bị ảnh hưởng bởi dữ liệu rác do test B tạo ra.
mkdir tests
$content = @'
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

let mongod;

// Setup before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

// Clean database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
'@

Set-Content -Path tests/setup.mjs -Value $content -Force
```

## 2. Writing Backend Unit Tests

### 2.1 Authentication Utils Tests

```bash
# Create tests/utils/auth.test.js
mkdir -p tests/utils
cat > tests/utils/auth.test.js << 'EOF'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../../utils/auth.js';

describe('Authentication Utils', () => {
  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(hashedPassword.startsWith('$2b$')).toBe(true);
    });

    test('should compare passwords correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      const isMatch = await comparePassword(password, hashedPassword);
      const isNotMatch = await comparePassword('wrongPassword', hashedPassword);

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('JWT Token Management', () => {
    test('should generate valid JWT token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const role = 'user';
      const token = generateToken(userId, role);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded.exp).toBeDefined();
    });

    test('should verify valid token', () => {
      const userId = 'testUserId';
      const token = generateToken(userId, 'user');
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
    });

    test('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });
  });
});
EOF
```

### 2.2 User Model Tests

```bash
# Create tests/models/user.test.js
mkdir -p tests/models
cat > tests/models/user.test.js << 'EOF'
import User from '../../models/user.model.js';

describe('User Model', () => {
  describe('User Creation', () => {
    test('should create user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: 'user'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe('user');
      expect(user._id).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    test('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'User One'
      };

      await User.create(userData);

      await expect(User.create(userData))
        .rejects.toThrow(/duplicate key error/);
    });

    test('should require email field', async () => {
      const userData = {
        password: 'password123',
        name: 'No Email User'
      };

      await expect(User.create(userData))
        .rejects.toThrow(/email.*required/);
    });
  });

  describe('User Queries', () => {
    test('should find user by email', async () => {
      const email = 'findme@example.com';
      await User.create({
        email,
        password: 'password123',
        name: 'Find Me'
      });

      const user = await User.findOne({ email });

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
    });

    test('should return null for non-existent user', async () => {
      const user = await User.findOne({ email: 'nonexistent@example.com' });

      expect(user).toBeNull();
    });
  });
});
EOF
```

### 2.3 Authentication Controller Tests

```bash
# Create tests/controllers/auth.test.js
mkdir -p tests/controllers
cat > tests/controllers/auth.test.js << 'EOF'
import request from 'supertest';
import app from '../../index.js';
import User from '../../models/user.model.js';
import { hashPassword } from '../../utils/auth.js';

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    test('should register user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
        phone: '0123456789'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered successfully');

      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
    });

    test('should reject duplicate email registration', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      };

      // Create user first
      await User.create({
        ...userData,
        password: await hashPassword(userData.password)
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        email: 'testuser@example.com',
        password: await hashPassword('correctPassword'),
        name: 'Test User'
      });
    });

    test('should login with correct credentials', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'correctPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('should reject incorrect password', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'wrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('should reject non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'anyPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
EOF
```

## 3. Frontend Unit Testing Setup

### 3.1 Install Testing Dependencies

```bash
cd ../FrontEnd

# Install Vitest and testing utilities
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom @vitest/ui @vitest/coverage-v8 msw

# Update package.json scripts
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:ui="vitest --ui"
npm pkg set scripts.test:coverage="vitest --coverage"
npm pkg set scripts.test:ci="vitest run --coverage"
```

### 3.2 Update Vite Configuration

```bash
# Update vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/setup.js',
        'src/main.jsx',
        'src/vite-env.d.ts'
      ]
    }
  },
})
EOF
```

### 3.3 Create Test Setup File

```bash
mkdir -p src/tests
cat > src/tests/setup.js << 'EOF'
import '@testing-library/jest-dom';
import { vi,global} from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();
EOF
```

## 4. Writing Frontend Unit Tests

### 4.1 Login Component Tests

```bash
# Create src/components/__tests__/LoginForm.test.jsx
mkdir -p src/components/__tests__
cat > src/components/__tests__/LoginForm.test.jsx << 'EOF'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect, test, describe, beforeEach } from 'vitest'
import LoginForm from '../LoginForm'

// Mock the login API call
const mockLogin = vi.fn()

describe('LoginForm Component', () => {
  beforeEach(() => {
    mockLogin.mockClear()
  })

  test('renders login form elements', () => {
    render(<LoginForm onLogin={mockLogin} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  test('handles form submission with valid data', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })

    render(<LoginForm onLogin={mockLogin} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  test('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()

    render(<LoginForm onLogin={mockLogin} />)

    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    expect(mockLogin).not.toHaveBeenCalled()
  })

  test('shows error message on login failure', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))

    render(<LoginForm onLogin={mockLogin} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  test('disables submit button during loading', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    render(<LoginForm onLogin={mockLogin} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /login/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/logging in/i)).toBeInTheDocument()
  })
})

EOF
```

### 4.2 Shop List Component Tests

```bash
# Create src/components/__tests__/ShopList.test.jsx
cat > src/components/__tests__/ShopList.test.jsx << 'EOF'
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, expect, test, describe } from 'vitest'
import ShopList from '../ShopList';

const mockShops = [
  {
    _id: '1',
    name: 'Pizza Palace',
    description: 'Best pizza in town',
    rating: 4.5,
    image: 'pizza-palace.jpg'
  },
  {
    _id: '2',
    name: 'Burger Barn',
    description: 'Juicy burgers',
    rating: 4.0,
    image: 'burger-barn.jpg'
  }
];

describe('ShopList Component', () => {
  test('renders shops when data is loaded', () => {
    render(<ShopList shops={mockShops} loading={false} />);

    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.getByText('Burger Barn')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<ShopList shops={[]} loading={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
  });

  test('shows empty state when no shops', () => {
    render(<ShopList shops={[]} loading={false} />);

    expect(screen.getByText(/no shops found/i)).toBeInTheDocument();
  });

  test('handles shop click', () => {
    const mockOnShopClick = vi.fn();

    render(
      <ShopList
        shops={mockShops}
        loading={false}
        onShopClick={mockOnShopClick}
      />
    );

    fireEvent.click(screen.getByText('Pizza Palace'));

    expect(mockOnShopClick).toHaveBeenCalledWith(mockShops[0]);
  });

  test('filters shops by search term', () => {
    render(<ShopList shops={mockShops} loading={false} searchTerm="pizza" />);

    expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    expect(screen.queryByText('Burger Barn')).not.toBeInTheDocument();
  });
});
EOF
```

## 5. Running Tests

### 5.1 Backend Tests

```bash
cd BackEnd

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should hash password"
```

### 5.2 Frontend Tests

```bash
cd FrontEnd

# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test LoginForm.test.jsx

# Run in watch mode (default)
npm test -- --watch
```

## 6. Test Coverage Analysis

### 6.1 Coverage Reports

```bash
# Backend coverage
cd BackEnd
npm run test:coverage
open coverage/lcov-report/index.html

# Frontend coverage
cd FrontEnd
npm run test:coverage
open coverage/index.html
```

### 6.2 Coverage Targets

- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 95%
- **Lines**: 90%

## 7. Best Practices

### 7.1 Test Structure

- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- One assertion per test when possible
- Use beforeEach/afterEach for setup/cleanup

### 7.2 Mocking Guidelines

- Mock external dependencies
- Use real implementations for unit under test
- Reset mocks between tests
- Verify mock calls when relevant

### 7.3 Common Patterns

```javascript
// Test async functions
test("should handle async operation", async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Test error handling
test("should throw error for invalid input", () => {
  expect(() => functionThatThrows()).toThrow("Expected error message");
});

// Test with mocks
test("should call dependency correctly", () => {
  const mockDependency = vi.fn().mockReturnValue("mocked result");
  const result = functionUnderTest(mockDependency);

  expect(mockDependency).toHaveBeenCalledWith(expectedArgs);
  expect(result).toBe("expected result");
});
```
