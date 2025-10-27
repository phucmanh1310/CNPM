# Environment Setup Guide - Testing & CI/CD

## 1. Prerequisites Installation

### 1.1 Install Node.js và npm

```bash
# Download và install Node.js từ https://nodejs.org/
# Hoặc sử dụng Node Version Manager (nvm)

# Windows
# Download installer từ nodejs.org
# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 8.x.x or higher
```

### 1.2 Install Git

```bash
# Windows
# Download từ https://git-scm.com/download/win

# Verify installation
git --version
```

### 1.3 Install Docker

```bash
# Windows
# Download Docker Desktop từ https://www.docker.com/products/docker-desktop

# Add user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version
```

## 2. Project Setup

### 2.1 Create development branch

```bash
##Giúp bảo vệ code chính
git checkout -b feature/testing-setup
```

### 2.2 Install Dependencies

#### Backend Dependencies

```bash
cd BackEnd

# Install production dependencies
npm install

# Install additional testing dependencies
npm install --save-dev tslib
++++++++++
npm install --save-dev \
  jest \
  supertest \
  mongodb-memory-server \
  @types/jest \
  jest-environment-node

# Update package.json scripts
```

#### Frontend Dependencies

```bash
cd ../FrontEnd

# Install production dependencies
npm install

# Install additional testing dependencies
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  vitest \
  jsdom \
  @vitest/ui \
  @vitest/coverage-c8

# Update package.json scripts
```

## 3. Database Setup

### 3.1 MongoDB với Docker

```bash
# Start MongoDB container
docker run -d --name ktpm-mongodb-test -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password -e MONGO_INITDB_DATABASE=ktpm_test mongo:7.0

# Verify MongoDB is running
docker ps
docker logs ktpm-mongodb-test
```

### 3.2 MongoDB Memory Server (cho Unit Tests)

```bash
# Đã cài đặt ở bước trước
# Sẽ tự động start/stop trong test files
```

## 4. Testing Framework Setup

### 4.1 Jest Configuration (Backend)

```bash
# Create jest.config.js in BackEnd directory
$configContent = @"
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/**/__tests__/**/*.js'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    'middlewares/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
"@

$configContent | Out-File -FilePath BackEnd/jest.config.js -Encoding UTF8
```

### 4.2 Vitest Configuration (Frontend)

```bash
# Update vite.config.js in FrontEnd directory
$viteConfigContent = @"
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
      ]
    }
  },
})
"@

$viteConfigContent | Out-File -FilePath FrontEnd/vite.config.js -Encoding UTF8
```

### 4.3 Test Setup Files

#### Backend Test Setup

```bash
# Create tests directory and setup file
mkdir -p BackEnd/tests
$setupContent = @"
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
"@

$setupContent | Out-File -FilePath BackEnd/tests/setup.js -Encoding UTF8
```

#### Frontend Test Setup

```bash
# Create test setup file
mkdir -p FrontEnd/src/tests
$setupFrontendContent = @"
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
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
"@

$setupFrontendContent | Out-File -FilePath FrontEnd/src/tests/setup.js -Encoding UTF8
```

## 5. GitHub Setup

### 5.1 Create GitHub Repository

```bash
# If not already created
# Go to GitHub.com
# Click "New repository"
# Name: KTPM
# Make it public or private
# Don't initialize with README (since you already have code)

# Add remote origin
git remote add origin https://github.com/your-username/KTPM.git
git branch -M main
git push -u origin main
```

### 5.2 GitHub Secrets Setup

```bash
# Go to your GitHub repository
# Settings > Secrets and variables > Actions
# Add following secrets:

# MONGO_URI - MongoDB connection string for CI
# JWT_SECRET - JWT secret for testing
# CLOUDINARY_CLOUD_NAME - Cloudinary config
# CLOUDINARY_API_KEY - Cloudinary config
# CLOUDINARY_API_SECRET - Cloudinary config
# EMAIL_USER - Email for testing
# EMAIL_PASS - Email password
```

## 6. Docker Development Environment

### 6.1 Start Development Environment

```bash
# From project root directory
docker-compose up -d

# Check all services are running
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 6.2 Development Workflow

```bash
# Start development servers
cd BackEnd && npm run dev &
cd FrontEnd && npm run dev &

# Or use Docker
docker-compose up

# Run tests
cd BackEnd && npm test
cd FrontEnd && npm test

# Run tests in watch mode
cd BackEnd && npm run test:watch
cd FrontEnd && npm run test:ui
```

#### bước runtest sẽ để ta chạy các file test có trong app , ta sẽ setup file test

## 7. IDE Configuration

### 7.1 VS Code Settings

```json
// Create .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.autoFixOnSave": true,
  "jest.runMode": "watch",
  "jest.showCoverageOnLoad": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/coverage": true,
    "**/.git": true
  }
}
```

### 7.2 VS Code Launch Configuration

```json
// Create .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/BackEnd/index.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/BackEnd/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 8. Verification Steps

### 8.1 Environment Verification

```bash
# Check all tools are installed
node --version
npm --version
git --version
docker --version
docker-compose --version

# Check project setup
Get-ChildItem -Force # Should see BackEnd, FrontEnd, docker-compose.yml

# Check environment variables
cd BackEnd && cat .env
cd ../FrontEnd && cat .env
```

### 8.2 Application Verification

```bash
# Start services
docker-compose up -d

# Check health endpoints
curl http://localhost:5000/health
curl http://localhost:5173

# Check database connection
docker exec ktpm-mongodb mongosh --eval "db.adminCommand('ismaster')"
```

### 8.3 Testing Verification

```bash
# Run backend tests
cd BackEnd
npm test

# Run frontend tests
cd ../FrontEnd
npm test

# Check coverage reports
cd BackEnd && npm run test:coverage
cd ../FrontEnd && npm run test:coverage
```

## 9. Troubleshooting

### 9.1 Common Issues

#### Port Already in Use

```bash
# Kill processes on ports
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:27017 | xargs kill -9
```

#### Docker Issues

```bash
# Reset Docker
docker-compose down
docker system prune -a
docker-compose up --build
```

#### MongoDB Connection Issues

```bash
# Check MongoDB container
docker logs ktpm-mongodb-test

# Restart MongoDB
docker restart ktpm-mongodb-test
```

### 9.2 Getting Help

- Check logs: `docker-compose logs service-name`
- Verify environment variables
- Check network connectivity
- Review error messages carefully
- Search documentation and Stack Overflow
