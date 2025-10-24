# Integration Testing Guide - API Endpoints & Database Integration

## 1. Integration Testing Overview

### 1.1 What is Integration Testing?
Integration testing verifies that different components work together correctly:
- API endpoints with database operations
- Authentication middleware with protected routes
- External service integrations (Cloudinary, Email)
- Frontend-Backend communication

### 1.2 Testing Strategy
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   API Routes    │───▶│   Database      │
│   (React)       │    │   (Express)     │    │   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Component Tests │    │ API Integration │    │ Database Tests  │
│   (Vitest)      │    │   (Supertest)   │    │  (Jest + Mongo) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 2. Backend API Integration Tests

### 2.1 Setup Integration Test Environment
```bash
cd BackEnd

# Create integration test setup
mkdir -p tests/integration
cat > tests/integration/setup.js << 'EOF'
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../index.js';

let mongod;
let server;

export const setupTestDB = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

export const teardownTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export { app };
EOF
```

### 2.2 Authentication API Integration Tests
```bash
cat > tests/integration/auth.integration.test.js << 'EOF'
import request from 'supertest';
import { setupTestDB, teardownTestDB, clearTestDB, app } from './setup.js';
import User from '../../models/user.model.js';
import { hashPassword } from '../../utils/auth.js';

describe('Authentication API Integration', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/auth/register', () => {
    test('should register new user and return success', async () => {
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

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('registered successfully')
      });

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });

    test('should prevent duplicate email registration', async () => {
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

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('already exists')
      });
    });

    test('should validate required fields', async () => {
      const incompleteData = {
        email: 'incomplete@example.com'
        // Missing password and name
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/required/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await User.create({
        email: 'testuser@example.com',
        password: await hashPassword('correctPassword'),
        name: 'Test User',
        role: 'user'
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

      expect(response.body).toMatchObject({
        success: true,
        user: {
          email: loginData.email,
          name: 'Test User',
          role: 'user'
        }
      });

      // Check that JWT cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('token='))).toBe(true);
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

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Invalid')
      });

      // Ensure no cookie is set
      expect(response.headers['set-cookie']).toBeUndefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout and clear cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('logged out')
      });

      // Check that cookie is cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('token=;'))).toBe(true);
    });
  });
});
EOF
```

### 2.3 Shop API Integration Tests
```bash
cat > tests/integration/shop.integration.test.js << 'EOF'
import request from 'supertest';
import { setupTestDB, teardownTestDB, clearTestDB, app } from './setup.js';
import User from '../../models/user.model.js';
import Shop from '../../models/shop.model.js';
import { hashPassword, generateToken } from '../../utils/auth.js';

describe('Shop API Integration', () => {
  let userToken;
  let shopOwnerToken;
  let adminToken;
  let testUser;
  let shopOwner;
  let testShop;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create test users
    testUser = await User.create({
      email: 'user@example.com',
      password: await hashPassword('password123'),
      name: 'Test User',
      role: 'user'
    });

    shopOwner = await User.create({
      email: 'owner@example.com',
      password: await hashPassword('password123'),
      name: 'Shop Owner',
      role: 'shopOwner'
    });

    const admin = await User.create({
      email: 'admin@example.com',
      password: await hashPassword('password123'),
      name: 'Admin User',
      role: 'admin'
    });

    // Generate tokens
    userToken = generateToken(testUser._id, testUser.role);
    shopOwnerToken = generateToken(shopOwner._id, shopOwner.role);
    adminToken = generateToken(admin._id, admin.role);

    // Create test shop
    testShop = await Shop.create({
      name: 'Test Shop',
      description: 'A test shop',
      ownerId: shopOwner._id,
      address: '123 Test Street',
      phone: '0123456789',
      isActive: true
    });
  });

  describe('GET /api/shop', () => {
    test('should return all active shops', async () => {
      // Create additional shops
      await Shop.create({
        name: 'Shop 2',
        description: 'Second shop',
        ownerId: shopOwner._id,
        address: '456 Test Avenue',
        isActive: true
      });

      await Shop.create({
        name: 'Inactive Shop',
        description: 'This shop is inactive',
        ownerId: shopOwner._id,
        address: '789 Test Road',
        isActive: false
      });

      const response = await request(app)
        .get('/api/shop')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.shops).toHaveLength(2); // Only active shops
      expect(response.body.shops[0].name).toBe('Test Shop');
      expect(response.body.shops[1].name).toBe('Shop 2');
    });

    test('should support pagination', async () => {
      // Create multiple shops
      for (let i = 1; i <= 15; i++) {
        await Shop.create({
          name: `Shop ${i}`,
          description: `Shop ${i} description`,
          ownerId: shopOwner._id,
          address: `${i} Test Street`,
          isActive: true
        });
      }

      const response = await request(app)
        .get('/api/shop?page=2&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.shops).toHaveLength(5);
      expect(response.body.pagination).toMatchObject({
        currentPage: 2,
        totalPages: expect.any(Number),
        totalShops: expect.any(Number)
      });
    });

    test('should support search functionality', async () => {
      await Shop.create({
        name: 'Pizza Palace',
        description: 'Best pizza in town',
        ownerId: shopOwner._id,
        address: '123 Pizza Street',
        isActive: true
      });

      const response = await request(app)
        .get('/api/shop?search=pizza')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.shops).toHaveLength(1);
      expect(response.body.shops[0].name).toBe('Pizza Palace');
    });
  });

  describe('GET /api/shop/:id', () => {
    test('should return shop details', async () => {
      const response = await request(app)
        .get(`/api/shop/${testShop._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.shop).toMatchObject({
        name: 'Test Shop',
        description: 'A test shop',
        address: '123 Test Street',
        phone: '0123456789'
      });
    });

    test('should return 404 for non-existent shop', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/shop/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should return 400 for invalid shop ID', async () => {
      const response = await request(app)
        .get('/api/shop/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });
  });

  describe('POST /api/shop', () => {
    test('should create shop for shop owner', async () => {
      const shopData = {
        name: 'New Shop',
        description: 'A brand new shop',
        address: '456 New Street',
        phone: '0987654321'
      };

      const response = await request(app)
        .post('/api/shop')
        .set('Cookie', `token=${shopOwnerToken}`)
        .send(shopData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.shop).toMatchObject(shopData);

      // Verify shop was created in database
      const shop = await Shop.findOne({ name: shopData.name });
      expect(shop).toBeTruthy();
      expect(shop.ownerId.toString()).toBe(shopOwner._id.toString());
    });

    test('should reject shop creation for regular user', async () => {
      const shopData = {
        name: 'Unauthorized Shop',
        description: 'This should not be created',
        address: '999 Forbidden Street'
      };

      const response = await request(app)
        .post('/api/shop')
        .set('Cookie', `token=${userToken}`)
        .send(shopData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('authorized');
    });

    test('should require authentication', async () => {
      const shopData = {
        name: 'Unauthenticated Shop',
        description: 'No token provided'
      };

      const response = await request(app)
        .post('/api/shop')
        .send(shopData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });
});
EOF
```

## 3. Frontend Integration Tests

### 3.1 API Service Integration Tests
```bash
cd ../FrontEnd

# Create API service tests
mkdir -p src/services/__tests__
cat > src/services/__tests__/authService.test.js << 'EOF'
import { vi } from 'vitest';
import { authService } from '../authService';

// Mock fetch
global.fetch = vi.fn();

describe('Auth Service Integration', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('login', () => {
    test('should make POST request to login endpoint', async () => {
      const mockResponse = {
        success: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User' }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authService.login(credentials);

      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      expect(result).toEqual(mockResponse);
    });

    test('should handle login failure', async () => {
      const mockError = {
        success: false,
        message: 'Invalid credentials'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockError
      });

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    test('should make POST request to register endpoint', async () => {
      const mockResponse = {
        success: true,
        message: 'User registered successfully'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
        phone: '0123456789'
      };

      const result = await authService.register(userData);

      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      expect(result).toEqual(mockResponse);
    });
  });
});
EOF
```

### 3.2 Component Integration Tests
```bash
cat > src/components/__tests__/LoginPage.integration.test.jsx << 'EOF'
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '../LoginPage';
import authReducer from '../../store/authSlice';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn()
  }
}));

import { authService } from '../../services/authService';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        user: null,
        isLoading: false,
        error: null,
        ...initialState.auth
      }
    }
  });
};

const renderWithProviders = (component, { initialState = {} } = {}) => {
  const store = createTestStore(initialState);
  
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginPage Integration', () => {
  beforeEach(() => {
    authService.login.mockClear();
  });

  test('should handle successful login flow', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    };

    authService.login.mockResolvedValue({
      success: true,
      user: mockUser
    });

    renderWithProviders(<LoginPage />);

    // Fill in login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Wait for API call
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    // Check success state
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });

  test('should handle login error', async () => {
    const user = userEvent.setup();

    authService.login.mockRejectedValue(new Error('Invalid credentials'));

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('should show loading state during login', async () => {
    const user = userEvent.setup();

    // Mock a delayed response
    authService.login.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
    );

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Check loading state
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });
});
EOF
```

## 4. Database Integration Tests

### 4.1 Model Integration Tests
```bash
cd ../BackEnd

cat > tests/integration/models.integration.test.js << 'EOF'
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import User from '../../models/user.model.js';
import Shop from '../../models/shop.model.js';
import Item from '../../models/item.model.js';

describe('Model Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('User-Shop Relationship', () => {
    test('should create shop with valid owner', async () => {
      const owner = await User.create({
        email: 'owner@example.com',
        password: 'hashedPassword',
        name: 'Shop Owner',
        role: 'shopOwner'
      });

      const shop = await Shop.create({
        name: 'Test Shop',
        description: 'A test shop',
        ownerId: owner._id,
        address: '123 Test Street'
      });

      expect(shop.ownerId.toString()).toBe(owner._id.toString());

      // Test population
      const populatedShop = await Shop.findById(shop._id).populate('ownerId');
      expect(populatedShop.ownerId.name).toBe('Shop Owner');
    });

    test('should enforce referential integrity', async () => {
      const fakeOwnerId = '507f1f77bcf86cd799439011';

      await expect(Shop.create({
        name: 'Invalid Shop',
        description: 'Shop with invalid owner',
        ownerId: fakeOwnerId,
        address: '123 Invalid Street'
      })).rejects.toThrow();
    });
  });

  describe('Shop-Item Relationship', () => {
    test('should create items for shop', async () => {
      const owner = await User.create({
        email: 'owner@example.com',
        password: 'hashedPassword',
        name: 'Shop Owner',
        role: 'shopOwner'
      });

      const shop = await Shop.create({
        name: 'Test Shop',
        ownerId: owner._id,
        address: '123 Test Street'
      });

      const item = await Item.create({
        name: 'Test Item',
        description: 'A test item',
        price: 10.99,
        shopId: shop._id,
        category: 'food'
      });

      expect(item.shopId.toString()).toBe(shop._id.toString());

      // Test population
      const populatedItem = await Item.findById(item._id).populate('shopId');
      expect(populatedItem.shopId.name).toBe('Test Shop');
    });
  });

  describe('Complex Queries', () => {
    test('should find shops with items', async () => {
      const owner = await User.create({
        email: 'owner@example.com',
        password: 'hashedPassword',
        name: 'Shop Owner',
        role: 'shopOwner'
      });

      const shop = await Shop.create({
        name: 'Test Shop',
        ownerId: owner._id,
        address: '123 Test Street'
      });

      await Item.create({
        name: 'Item 1',
        price: 10.99,
        shopId: shop._id,
        category: 'food'
      });

      await Item.create({
        name: 'Item 2',
        price: 15.99,
        shopId: shop._id,
        category: 'drink'
      });

      // Aggregate query to get shop with item count
      const shopsWithItemCount = await Shop.aggregate([
        {
          $lookup: {
            from: 'items',
            localField: '_id',
            foreignField: 'shopId',
            as: 'items'
          }
        },
        {
          $addFields: {
            itemCount: { $size: '$items' }
          }
        }
      ]);

      expect(shopsWithItemCount).toHaveLength(1);
      expect(shopsWithItemCount[0].itemCount).toBe(2);
    });
  });
});
EOF
```

## 5. Running Integration Tests

### 5.1 Backend Integration Tests
```bash
cd BackEnd

# Run all integration tests
npm test -- tests/integration

# Run specific integration test
npm test -- tests/integration/auth.integration.test.js

# Run with coverage
npm run test:coverage -- tests/integration

# Run in watch mode
npm run test:watch -- tests/integration
```

### 5.2 Frontend Integration Tests
```bash
cd FrontEnd

# Run integration tests
npm test -- --run src/**/*.integration.test.jsx

# Run with coverage
npm run test:coverage -- src/**/*.integration.test.jsx

# Run specific test
npm test LoginPage.integration.test.jsx
```

## 6. CI/CD Integration

### 6.1 GitHub Actions Integration Tests
```yaml
# Add to .github/workflows/ci.yml
- name: Run Integration Tests
  run: |
    cd BackEnd
    npm run test:ci -- tests/integration
    cd ../FrontEnd  
    npm run test:ci -- src/**/*.integration.test.jsx
```

## 7. Best Practices

### 7.1 Test Data Management
- Use test database for integration tests
- Clean database between tests
- Use realistic test data
- Mock external services

### 7.2 Test Organization
- Separate unit and integration tests
- Group related tests together
- Use descriptive test names
- Test both success and failure paths

### 7.3 Performance Considerations
- Run integration tests in parallel when possible
- Use database transactions for faster cleanup
- Mock slow external services
- Set reasonable timeouts
