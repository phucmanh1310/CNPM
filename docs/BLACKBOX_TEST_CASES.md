# Blackbox Test Cases - Authentication & Display Functions

## 1. Authentication Module - Blackbox Test Cases

### 1.1 User Registration

#### TC_AUTH_REG_001: Valid User Registration
**Objective**: Verify successful user registration with valid data
**Preconditions**: User not registered in system
**Test Data**: 
- Email: test@example.com
- Password: SecurePass123!
- Name: John Doe
- Phone: 0123456789

**Test Steps**:
1. Navigate to registration page
2. Enter valid email address
3. Enter valid password
4. Enter full name
5. Enter phone number
6. Click "Register" button

**Expected Result**: 
- User successfully registered
- Confirmation message displayed
- Redirect to login page
- Email verification sent

**Priority**: High

#### TC_AUTH_REG_002: Duplicate Email Registration
**Objective**: Verify system prevents duplicate email registration
**Preconditions**: Email already exists in system
**Test Data**: 
- Email: existing@example.com (already registered)
- Password: NewPass123!

**Test Steps**:
1. Navigate to registration page
2. Enter existing email address
3. Enter valid password and other details
4. Click "Register" button

**Expected Result**: 
- Registration fails
- Error message: "Email already exists"
- User remains on registration page

**Priority**: High

#### TC_AUTH_REG_003: Invalid Email Format
**Objective**: Verify email format validation
**Test Data**: 
- Invalid emails: "invalid-email", "@domain.com", "user@", "user.domain"

**Test Steps**:
1. Navigate to registration page
2. Enter invalid email format
3. Fill other valid details
4. Click "Register" button

**Expected Result**: 
- Validation error displayed
- Registration not processed
- Focus remains on email field

**Priority**: Medium

### 1.2 User Login

#### TC_AUTH_LOGIN_001: Valid Credentials Login
**Objective**: Verify successful login with correct credentials
**Preconditions**: User account exists and is active
**Test Data**: 
- Email: test@example.com
- Password: SecurePass123!

**Test Steps**:
1. Navigate to login page
2. Enter valid email
3. Enter correct password
4. Click "Login" button

**Expected Result**: 
- Login successful
- Redirect to dashboard/home page
- User session established
- Welcome message displayed

**Priority**: High

#### TC_AUTH_LOGIN_002: Invalid Credentials
**Objective**: Verify login fails with incorrect credentials
**Test Data**: 
- Email: test@example.com
- Password: WrongPassword123

**Test Steps**:
1. Navigate to login page
2. Enter valid email
3. Enter incorrect password
4. Click "Login" button

**Expected Result**: 
- Login fails
- Error message: "Invalid email or password"
- User remains on login page
- No session created

**Priority**: High

#### TC_AUTH_LOGIN_003: Account Lockout
**Objective**: Verify account lockout after multiple failed attempts
**Test Data**: 
- Email: test@example.com
- Wrong passwords: WrongPass1, WrongPass2, WrongPass3, WrongPass4, WrongPass5

**Test Steps**:
1. Attempt login with wrong password 5 times consecutively
2. Try login with correct password on 6th attempt

**Expected Result**: 
- After 5 failed attempts: Account locked message
- 6th attempt fails even with correct password
- Lockout duration message displayed

**Priority**: Medium

### 1.3 User Logout

#### TC_AUTH_LOGOUT_001: Normal Logout
**Objective**: Verify successful logout process
**Preconditions**: User is logged in
**Test Steps**:
1. Click "Logout" button/link
2. Confirm logout if prompted

**Expected Result**: 
- User successfully logged out
- Session terminated
- Redirect to login page
- All user data cleared from browser

**Priority**: High

#### TC_AUTH_LOGOUT_002: Session Cleanup
**Objective**: Verify complete session cleanup after logout
**Preconditions**: User is logged in
**Test Steps**:
1. Login and note session token
2. Logout
3. Try to access protected page with old session

**Expected Result**: 
- Protected pages inaccessible
- Redirect to login page
- Session token invalidated

**Priority**: High

## 2. Shop Display Module - Blackbox Test Cases

### 2.1 Shop Listing

#### TC_SHOP_LIST_001: Display All Active Shops
**Objective**: Verify all active shops are displayed correctly
**Preconditions**: Multiple active shops exist in database
**Test Steps**:
1. Navigate to shops page
2. Observe shop listings

**Expected Result**: 
- All active shops displayed
- Shop name, image, rating visible
- Inactive shops not shown
- Proper pagination if many shops

**Priority**: High

#### TC_SHOP_LIST_002: Shop Search Functionality
**Objective**: Verify shop search works correctly
**Test Data**: Search term: "Pizza"
**Test Steps**:
1. Navigate to shops page
2. Enter "Pizza" in search box
3. Click search button

**Expected Result**: 
- Only shops matching "Pizza" displayed
- Search results highlighted
- "No results" message if no matches
- Clear search option available

**Priority**: Medium

#### TC_SHOP_LIST_003: Shop Filtering
**Objective**: Verify shop filtering by category
**Test Steps**:
1. Navigate to shops page
2. Select "Fast Food" category filter
3. Apply filter

**Expected Result**: 
- Only fast food shops displayed
- Filter indicator shown
- Option to clear filters
- Results count updated

**Priority**: Medium

### 2.2 Shop Details

#### TC_SHOP_DETAIL_001: Display Shop Information
**Objective**: Verify complete shop details are displayed
**Preconditions**: Valid shop exists
**Test Steps**:
1. Click on a shop from listing
2. View shop details page

**Expected Result**: 
- Shop name, description displayed
- Contact information shown
- Operating hours visible
- Location/address displayed
- Shop images loaded

**Priority**: High

#### TC_SHOP_DETAIL_002: Invalid Shop ID
**Objective**: Verify handling of invalid shop ID
**Test Steps**:
1. Navigate to URL with invalid shop ID
2. Example: /shop/invalid-id-123

**Expected Result**: 
- 404 error page displayed
- "Shop not found" message
- Navigation back to shops list
- No system errors

**Priority**: Medium

## 3. Item Display Module - Blackbox Test Cases

### 3.1 Item Listing

#### TC_ITEM_LIST_001: Display Items by Shop
**Objective**: Verify items are correctly displayed for a shop
**Preconditions**: Shop has multiple items
**Test Steps**:
1. Navigate to shop details page
2. View items section

**Expected Result**: 
- All shop items displayed
- Item name, price, image shown
- Available/unavailable status clear
- Items organized by category

**Priority**: High

#### TC_ITEM_LIST_002: Item Search
**Objective**: Verify item search functionality
**Test Data**: Search term: "Burger"
**Test Steps**:
1. On shop page, search for "Burger"
2. View search results

**Expected Result**: 
- Only burger items displayed
- Search term highlighted
- Relevant results shown first
- Search suggestions if available

**Priority**: Medium

#### TC_ITEM_LIST_003: Price Filtering
**Objective**: Verify price range filtering
**Test Steps**:
1. Set price range filter (e.g., $10-$20)
2. Apply filter

**Expected Result**: 
- Only items in price range shown
- Filter values displayed
- Results count updated
- Clear filter option available

**Priority**: Medium

### 3.2 Item Details

#### TC_ITEM_DETAIL_001: Display Item Information
**Objective**: Verify complete item details
**Test Steps**:
1. Click on item from listing
2. View item details

**Expected Result**: 
- Item name, description shown
- Price clearly displayed
- High-quality images loaded
- Ingredients/allergens listed
- Nutritional info if available

**Priority**: High

#### TC_ITEM_DETAIL_002: Item Availability
**Objective**: Verify item availability status
**Test Steps**:
1. View available item details
2. View unavailable item details

**Expected Result**: 
- Available items: Add to cart option visible
- Unavailable items: "Out of stock" message
- Estimated availability time if applicable
- Alternative suggestions shown

**Priority**: High

## 4. Cross-Functional Test Cases

### 4.1 Authorization Tests

#### TC_AUTH_AUTHZ_001: Protected Page Access
**Objective**: Verify unauthorized users cannot access protected pages
**Test Steps**:
1. Without logging in, try to access user profile
2. Try to access admin pages

**Expected Result**: 
- Redirect to login page
- "Please login" message
- Return to intended page after login

**Priority**: High

#### TC_AUTH_AUTHZ_002: Role-Based Access
**Objective**: Verify role-based page access
**Test Steps**:
1. Login as regular user
2. Try to access admin-only pages

**Expected Result**: 
- Access denied message
- Redirect to appropriate page
- No sensitive data exposed

**Priority**: High

### 4.2 Data Validation Tests

#### TC_DATA_VAL_001: SQL Injection Prevention
**Objective**: Verify protection against SQL injection
**Test Data**: Malicious inputs like "'; DROP TABLE users; --"
**Test Steps**:
1. Enter SQL injection attempts in search fields
2. Submit forms with malicious data

**Expected Result**: 
- Inputs properly sanitized
- No database errors
- No data corruption
- Security logs generated

**Priority**: Critical

#### TC_DATA_VAL_002: XSS Prevention
**Objective**: Verify protection against XSS attacks
**Test Data**: Script tags like "<script>alert('XSS')</script>"
**Test Steps**:
1. Enter script tags in input fields
2. Submit and view data

**Expected Result**: 
- Scripts not executed
- Data properly escaped
- No JavaScript alerts
- Content displayed safely

**Priority**: Critical

## 5. Performance Test Cases

### 5.1 Load Testing

#### TC_PERF_LOAD_001: Concurrent User Login
**Objective**: Verify system handles multiple simultaneous logins
**Test Setup**: 50 concurrent users
**Test Steps**:
1. Simulate 50 users logging in simultaneously
2. Monitor response times

**Expected Result**: 
- All logins processed successfully
- Response time < 3 seconds
- No system errors
- Database connections managed properly

**Priority**: Medium

#### TC_PERF_LOAD_002: Shop/Item Browsing Load
**Objective**: Verify system handles browsing load
**Test Setup**: 100 concurrent users browsing
**Test Steps**:
1. Simulate users browsing shops and items
2. Monitor system performance

**Expected Result**: 
- Pages load within 2 seconds
- Images load properly
- No timeouts or errors
- Memory usage stable

**Priority**: Medium
