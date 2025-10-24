# CI/CD Implementation Guide - Docker & GitHub Actions for Testing

## 1. CI/CD Pipeline Overview

### 1.1 Pipeline Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Code Push     │───▶│  GitHub Actions │───▶│   Test Results  │
│   (Git)         │    │   (CI Pipeline) │    │   (Reports)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Pull Request   │    │ Docker Build    │    │   Deployment    │
│  (Code Review)  │    │ (Containers)    │    │  (Staging/Prod) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 Workflow Stages
1. **Code Quality**: Linting, formatting, security checks
2. **Unit Testing**: Backend (Jest) + Frontend (Vitest)
3. **Integration Testing**: API endpoints, database operations
4. **Build**: Docker images for backend and frontend
5. **Deploy**: Staging environment deployment
6. **E2E Testing**: End-to-end user workflows (optional)

## 2. GitHub Actions Setup

### 2.1 Create Workflow Directory
```bash
# From project root
mkdir -p .github/workflows
```

### 2.2 Main CI Workflow
```bash
cat > .github/workflows/ci.yml << 'EOF'
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Code Quality Checks
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Backend Dependencies
        working-directory: ./BackEnd
        run: npm ci

      - name: Install Frontend Dependencies
        working-directory: ./FrontEnd
        run: npm ci

      - name: Backend Lint Check
        working-directory: ./BackEnd
        run: npm run lint

      - name: Frontend Lint Check
        working-directory: ./FrontEnd
        run: npm run lint

      - name: Backend Security Audit
        working-directory: ./BackEnd
        run: npm audit --audit-level=moderate

      - name: Frontend Security Audit
        working-directory: ./FrontEnd
        run: npm audit --audit-level=moderate

  # Backend Tests
  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7.0
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ismaster\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Dependencies
        working-directory: ./BackEnd
        run: npm ci

      - name: Run Unit Tests
        working-directory: ./BackEnd
        run: npm run test:ci
        env:
          NODE_ENV: test
          MONGO_URI: mongodb://admin:password@localhost:27017/test?authSource=admin
          JWT_SECRET: test-secret-key

      - name: Run Integration Tests
        working-directory: ./BackEnd
        run: npm run test:ci -- tests/integration
        env:
          NODE_ENV: test
          MONGO_URI: mongodb://admin:password@localhost:27017/test_integration?authSource=admin
          JWT_SECRET: test-secret-key

      - name: Upload Backend Coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./BackEnd/coverage/lcov.info
          flags: backend
          name: backend-coverage

  # Frontend Tests
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Dependencies
        working-directory: ./FrontEnd
        run: npm ci

      - name: Run Unit Tests
        working-directory: ./FrontEnd
        run: npm run test:ci

      - name: Run Integration Tests
        working-directory: ./FrontEnd
        run: npm run test:ci -- src/**/*.integration.test.jsx

      - name: Build Frontend
        working-directory: ./FrontEnd
        run: npm run build

      - name: Upload Frontend Coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./FrontEnd/coverage/lcov.info
          flags: frontend
          name: frontend-coverage

  # Docker Build
  build-images:
    needs: [code-quality, backend-tests, frontend-tests]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    strategy:
      matrix:
        service: [backend, frontend]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.service == 'backend' && 'BackEnd' || 'FrontEnd' }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          target: production
          cache-from: type=gha
          cache-to: type=gha,mode=max
EOF
```

### 2.3 Testing Workflow
```bash
cat > .github/workflows/test.yml << 'EOF'
name: Comprehensive Testing

on:
  schedule:
    - cron: '0 2 * * *'  # Run daily at 2 AM
  workflow_dispatch:

jobs:
  # Extended test suite
  extended-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7.0
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
        ports:
          - 27017:27017

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: |
          cd BackEnd && npm ci
          cd ../FrontEnd && npm ci

      - name: Run All Backend Tests
        working-directory: ./BackEnd
        run: |
          npm run test:coverage
          npm run test:ci -- tests/integration
        env:
          NODE_ENV: test
          MONGO_URI: mongodb://admin:password@localhost:27017/test?authSource=admin
          JWT_SECRET: test-secret-key

      - name: Run All Frontend Tests
        working-directory: ./FrontEnd
        run: npm run test:coverage

      - name: Generate Test Report
        run: |
          echo "# Test Report" > test-report.md
          echo "## Backend Coverage" >> test-report.md
          echo "$(cat BackEnd/coverage/coverage-summary.json)" >> test-report.md
          echo "## Frontend Coverage" >> test-report.md
          echo "$(cat FrontEnd/coverage/coverage-summary.json)" >> test-report.md

      - name: Upload Test Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: |
            BackEnd/coverage/
            FrontEnd/coverage/
            test-report.md
EOF
```

## 3. Docker Configuration for CI/CD

### 3.1 Multi-stage Dockerfile Optimization
```bash
# Update BackEnd/Dockerfile for CI/CD
cat > BackEnd/Dockerfile << 'EOF'
# Multi-stage build for Node.js Backend
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS dev
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Test stage
FROM base AS test
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=test
RUN npm run test:ci

# Build stage
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run lint

# Production stage
FROM base AS production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "index.js"]
EOF
```

### 3.2 Docker Compose for CI Testing
```bash
cat > docker-compose.test.yml << 'EOF'
version: '3.8'

services:
  # Test Database
  mongodb-test:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: ktpm_test
    ports:
      - "27018:27017"
    tmpfs:
      - /data/db  # Use tmpfs for faster test database

  # Backend Tests
  backend-test:
    build:
      context: ./BackEnd
      target: test
    environment:
      NODE_ENV: test
      MONGO_URI: mongodb://admin:password@mongodb-test:27017/ktpm_test?authSource=admin
      JWT_SECRET: test-secret-key
    depends_on:
      - mongodb-test
    volumes:
      - ./BackEnd/coverage:/app/coverage

  # Frontend Tests
  frontend-test:
    build:
      context: ./FrontEnd
      target: test
    environment:
      VITE_API_BASE_URL: http://backend-test:5000
      VITE_ENVIRONMENT: test
    volumes:
      - ./FrontEnd/coverage:/app/coverage

networks:
  default:
    name: ktpm-test-network
EOF
```

## 4. GitHub Repository Setup

### 4.1 Repository Secrets Configuration
```bash
# Go to GitHub repository > Settings > Secrets and variables > Actions
# Add the following secrets:

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ktpm_production

# Authentication
JWT_SECRET=your-super-secret-jwt-key-for-production

# External Services
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Container Registry
GHCR_TOKEN=${{ secrets.GITHUB_TOKEN }}  # Automatically available

# Deployment
STAGING_SERVER_HOST=your-staging-server.com
STAGING_SERVER_USER=deploy
STAGING_SSH_KEY=your-private-ssh-key
```

### 4.2 Branch Protection Rules
```bash
# Go to GitHub repository > Settings > Branches
# Add protection rule for 'main' branch:

# Required status checks:
- code-quality
- backend-tests
- frontend-tests
- build-images

# Additional settings:
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators in restrictions
```

## 5. Local Development Workflow

### 5.1 Pre-commit Hooks Setup
```bash
# Install husky for git hooks
npm install --save-dev husky lint-staged

# Setup husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run pre-commit"

# Add to package.json
npm pkg set scripts.pre-commit="lint-staged"

# Create lint-staged config
cat > .lintstagedrc.json << 'EOF'
{
  "BackEnd/**/*.js": [
    "eslint --fix",
    "prettier --write",
    "git add"
  ],
  "FrontEnd/**/*.{js,jsx}": [
    "eslint --fix",
    "prettier --write",
    "git add"
  ],
  "**/*.{json,md}": [
    "prettier --write",
    "git add"
  ]
}
EOF
```

### 5.2 Development Scripts
```bash
# Add to root package.json
cat > package.json << 'EOF'
{
  "name": "ktpm-ecommerce",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd BackEnd && npm run dev",
    "dev:frontend": "cd FrontEnd && npm run dev",
    "test": "concurrently \"npm run test:backend\" \"npm run test:frontend\"",
    "test:backend": "cd BackEnd && npm test",
    "test:frontend": "cd FrontEnd && npm test",
    "test:coverage": "concurrently \"npm run test:coverage:backend\" \"npm run test:coverage:frontend\"",
    "test:coverage:backend": "cd BackEnd && npm run test:coverage",
    "test:coverage:frontend": "cd FrontEnd && npm run test:coverage",
    "lint": "concurrently \"npm run lint:backend\" \"npm run lint:frontend\"",
    "lint:backend": "cd BackEnd && npm run lint",
    "lint:frontend": "cd FrontEnd && npm run lint",
    "lint:fix": "concurrently \"npm run lint:fix:backend\" \"npm run lint:fix:frontend\"",
    "lint:fix:backend": "cd BackEnd && npm run lint:fix",
    "lint:fix:frontend": "cd FrontEnd && npm run lint:fix",
    "docker:dev": "docker-compose up --build",
    "docker:test": "docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit",
    "pre-commit": "lint-staged"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "husky": "^8.0.3",
    "lint-staged": "^13.2.0"
  }
}
EOF

npm install
```

## 6. Quality Gates and Metrics

### 6.1 Coverage Requirements
```bash
# Update jest.config.js in BackEnd
cat >> BackEnd/jest.config.js << 'EOF'

// Coverage thresholds
export default {
  // ... existing config
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './controllers/': {
      branches: 90,
      functions: 95,
      lines: 90,
      statements: 90
    },
    './utils/': {
      branches: 85,
      functions: 90,
      lines: 85,
      statements: 85
    }
  }
};
EOF
```

### 6.2 Performance Budgets
```bash
# Add to FrontEnd/vite.config.js
cat >> FrontEnd/vite.config.js << 'EOF'

export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
EOF
```

## 7. Monitoring and Notifications

### 7.1 Slack Integration
```bash
# Add to .github/workflows/ci.yml
cat >> .github/workflows/ci.yml << 'EOF'

  # Notification job
  notify:
    needs: [code-quality, backend-tests, frontend-tests, build-images]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#ci-cd'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
        if: always()
EOF
```

## 8. Deployment Pipeline

### 8.1 Staging Deployment
```bash
cat > .github/workflows/deploy-staging.yml << 'EOF'
name: Deploy to Staging

on:
  push:
    branches: [ develop ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Railway
        run: |
          curl -fsSL https://railway.app/install.sh | sh
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up --service backend
          railway up --service frontend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

      - name: Run Health Checks
        run: |
          sleep 30  # Wait for deployment
          curl -f ${{ secrets.STAGING_URL }}/health || exit 1

      - name: Run Smoke Tests
        run: |
          cd BackEnd
          npm ci
          npm run test:smoke
        env:
          API_BASE_URL: ${{ secrets.STAGING_URL }}
EOF
```

## 9. Troubleshooting Guide

### 9.1 Common CI/CD Issues

#### Build Failures
```bash
# Check logs in GitHub Actions
# Common fixes:
- Clear npm cache: npm ci --cache .npm --prefer-offline
- Update Node.js version in workflow
- Check environment variables

# Local debugging
docker-compose -f docker-compose.test.yml up --build
```

#### Test Failures
```bash
# Run tests locally first
npm run test:coverage

# Check test database connection
docker exec -it mongodb-test mongosh

# Debug specific test
npm test -- --testNamePattern="specific test name"
```

#### Docker Build Issues
```bash
# Build locally to debug
docker build -t test-image ./BackEnd

# Check Dockerfile syntax
docker build --no-cache -t test-image ./BackEnd

# Inspect layers
docker history test-image
```

### 9.2 Performance Optimization
- Use Docker layer caching
- Parallelize independent jobs
- Cache node_modules between runs
- Use smaller base images (alpine)
- Optimize test database with tmpfs

## 10. Next Steps

### 10.1 Advanced Features
- [ ] E2E testing with Playwright
- [ ] Performance testing with Artillery
- [ ] Security scanning with Snyk
- [ ] Dependency updates with Dependabot

### 10.2 Production Readiness
- [ ] Blue-green deployments
- [ ] Canary releases
- [ ] Rollback mechanisms
- [ ] Production monitoring integration
