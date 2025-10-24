# Whitebox Test Cases - Authentication & Display Functions

## 1. Authentication Module - Whitebox Test Cases

### 1.1 Password Hashing Function

#### TC_WB_AUTH_HASH_001: bcrypt Hash Generation
**Objective**: Verify password is properly hashed using bcrypt
**Function**: `hashPassword(password)`
**Code Path**: BackEnd/utils/auth.js

**Test Cases**:
```javascript
describe('Password Hashing', () => {
  test('should hash password with bcrypt', async () => {
    const password = 'testPassword123';
    const hashedPassword = await hashPassword(password);
    
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(50);
    expect(hashedPassword.startsWith('$2b$')).toBe(true);
  });
});
```

**Coverage**: 
- Branch: Hash generation path
- Statement: All lines in hashPassword function
- Condition: Salt rounds configuration

#### TC_WB_AUTH_HASH_002: Password Comparison
**Objective**: Verify password comparison logic
**Function**: `comparePassword(password, hashedPassword)`

**Test Cases**:
```javascript
describe('Password Comparison', () => {
  test('should return true for correct password', async () => {
    const password = 'testPassword123';
    const hashedPassword = await hashPassword(password);
    const isMatch = await comparePassword(password, hashedPassword);
    
    expect(isMatch).toBe(true);
  });
  
  test('should return false for incorrect password', async () => {
    const password = 'testPassword123';
    const wrongPassword = 'wrongPassword';
    const hashedPassword = await hashPassword(password);
    const isMatch = await comparePassword(wrongPassword, hashedPassword);
    
    expect(isMatch).toBe(false);
  });
});
```

### 1.2 JWT Token Management

#### TC_WB_AUTH_JWT_001: Token Generation
**Objective**: Test JWT token creation with proper payload
**Function**: `generateToken(userId, role)`

**Test Cases**:
```javascript
describe('JWT Token Generation', () => {
  test('should generate valid JWT token', () => {
    const userId = '507f1f77bcf86cd799439011';
    const role = 'user';
    const token = generateToken(userId, role);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(userId);
    expect(decoded.role).toBe(role);
  });
  
  test('should include expiration time', () => {
    const token = generateToken('userId', 'user');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp > Date.now() / 1000).toBe(true);
  });
});
```

#### TC_WB_AUTH_JWT_002: Token Verification
**Objective**: Test token validation logic
**Function**: `verifyToken(token)`

**Test Cases**:
```javascript
describe('JWT Token Verification', () => {
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
  
  test('should throw error for expired token', () => {
    // Create token with past expiration
    const expiredToken = jwt.sign(
      { userId: 'test', exp: Math.floor(Date.now() / 1000) - 3600 },
      process.env.JWT_SECRET
    );
    
    expect(() => verifyToken(expiredToken)).toThrow('jwt expired');
  });
});
```

### 1.3 Input Validation

#### TC_WB_AUTH_VAL_001: Email Validation
**Objective**: Test email format validation logic
**Function**: `validateEmail(email)`

**Test Cases**:
```javascript
describe('Email Validation', () => {
  test('should validate correct email formats', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org'
    ];
    
    validEmails.forEach(email => {
      expect(validateEmail(email)).toBe(true);
    });
  });
  
  test('should reject invalid email formats', () => {
    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user.domain',
      ''
    ];
    
    invalidEmails.forEach(email => {
      expect(validateEmail(email)).toBe(false);
    });
  });
});
```

#### TC_WB_AUTH_VAL_002: Password Strength Validation
**Objective**: Test password strength requirements
**Function**: `validatePassword(password)`

**Test Cases**:
```javascript
describe('Password Validation', () => {
  test('should accept strong passwords', () => {
    const strongPasswords = [
      'StrongPass123!',
      'MySecure@Password1',
      'Complex#Pass99'
    ];
    
    strongPasswords.forEach(password => {
      const result = validatePassword(password);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
  
  test('should reject weak passwords', () => {
    const weakPasswords = [
      '123456',        // Too simple
      'password',      // No numbers/special chars
      'Pass1',         // Too short
      'ALLUPPERCASE1!' // No lowercase
    ];
    
    weakPasswords.forEach(password => {
      const result = validatePassword(password);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
```

## 2. Database Operations - Whitebox Test Cases

### 2.1 User Model Operations

#### TC_WB_DB_USER_001: User Creation
**Objective**: Test user creation with proper data validation
**Model**: User.create()

**Test Cases**:
```javascript
describe('User Model Creation', () => {
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
    expect(user.role).toBe('user');
    expect(user._id).toBeDefined();
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
});
```

#### TC_WB_DB_USER_002: User Query Operations
**Objective**: Test user finding and filtering
**Model**: User.findOne(), User.find()

**Test Cases**:
```javascript
describe('User Query Operations', () => {
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
```

### 2.2 Shop Model Operations

#### TC_WB_DB_SHOP_001: Shop Creation and Validation
**Objective**: Test shop creation with owner validation
**Model**: Shop.create()

**Test Cases**:
```javascript
describe('Shop Model Operations', () => {
  test('should create shop with valid owner', async () => {
    const owner = await User.create({
      email: 'owner@example.com',
      password: 'password123',
      name: 'Shop Owner',
      role: 'shopOwner'
    });
    
    const shopData = {
      name: 'Test Shop',
      description: 'A test shop',
      ownerId: owner._id,
      address: '123 Test Street'
    };
    
    const shop = await Shop.create(shopData);
    
    expect(shop).toBeDefined();
    expect(shop.name).toBe(shopData.name);
    expect(shop.ownerId.toString()).toBe(owner._id.toString());
  });
});
```

## 3. API Controller Logic - Whitebox Test Cases

### 3.1 Authentication Controller

#### TC_WB_CTRL_AUTH_001: Login Controller Logic
**Objective**: Test login controller decision paths
**Controller**: authController.login()

**Test Cases**:
```javascript
describe('Login Controller', () => {
  test('should handle successful login path', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'correctPassword'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn()
    };
    
    // Mock user exists and password matches
    User.findOne = jest.fn().mockResolvedValue({
      _id: 'userId',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'user'
    });
    
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    
    await authController.login(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        user: expect.any(Object)
      })
    );
    expect(res.cookie).toHaveBeenCalled();
  });
  
  test('should handle invalid credentials path', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'wrongPassword'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    User.findOne = jest.fn().mockResolvedValue({
      password: 'hashedPassword'
    });
    
    bcrypt.compare = jest.fn().mockResolvedValue(false);
    
    await authController.login(req, res);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Invalid')
      })
    );
  });
});
```

### 3.2 Shop Controller Logic

#### TC_WB_CTRL_SHOP_001: Get Shops Controller
**Objective**: Test shop listing with pagination and filtering
**Controller**: shopController.getShops()

**Test Cases**:
```javascript
describe('Shop Controller - Get Shops', () => {
  test('should return paginated shops', async () => {
    const req = {
      query: {
        page: '1',
        limit: '10'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    const mockShops = [
      { name: 'Shop 1', _id: 'id1' },
      { name: 'Shop 2', _id: 'id2' }
    ];
    
    Shop.find = jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockShops)
    });
    
    Shop.countDocuments = jest.fn().mockResolvedValue(25);
    
    await shopController.getShops(req, res);
    
    expect(Shop.find).toHaveBeenCalledWith({ isActive: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        shops: mockShops,
        totalPages: 3,
        currentPage: 1
      })
    );
  });
});
```

## 4. Frontend Component Testing - Whitebox Test Cases

### 4.1 Login Component

#### TC_WB_FE_LOGIN_001: Login Form Submission
**Objective**: Test login form state management and submission
**Component**: LoginForm.jsx

**Test Cases**:
```javascript
describe('LoginForm Component', () => {
  test('should handle form submission with valid data', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ success: true });
    
    render(<LoginForm onLogin={mockLogin} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
  
  test('should show validation errors for empty fields', async () => {
    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});
```

### 4.2 Shop List Component

#### TC_WB_FE_SHOP_001: Shop List Rendering
**Objective**: Test shop list component rendering logic
**Component**: ShopList.jsx

**Test Cases**:
```javascript
describe('ShopList Component', () => {
  test('should render shops when data is loaded', () => {
    const mockShops = [
      { _id: '1', name: 'Shop 1', rating: 4.5 },
      { _id: '2', name: 'Shop 2', rating: 4.0 }
    ];
    
    render(<ShopList shops={mockShops} loading={false} />);
    
    expect(screen.getByText('Shop 1')).toBeInTheDocument();
    expect(screen.getByText('Shop 2')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
  
  test('should show loading state', () => {
    render(<ShopList shops={[]} loading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  test('should show empty state when no shops', () => {
    render(<ShopList shops={[]} loading={false} />);
    
    expect(screen.getByText(/no shops found/i)).toBeInTheDocument();
  });
});
```

## 5. Code Coverage Targets

### 5.1 Backend Coverage Goals
- **Statement Coverage**: 90%
- **Branch Coverage**: 85%
- **Function Coverage**: 95%
- **Line Coverage**: 90%

### 5.2 Frontend Coverage Goals
- **Statement Coverage**: 85%
- **Branch Coverage**: 80%
- **Function Coverage**: 90%
- **Line Coverage**: 85%

### 5.3 Critical Path Coverage
- Authentication flows: 100%
- Data validation: 100%
- Error handling: 95%
- Security functions: 100%
