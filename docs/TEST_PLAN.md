# Test Plan Document - KTPM E-commerce Authentication & Display Functions

## 1. Test Plan Overview

### 1.1 Scope
Kiểm thử các chức năng:
- **Authentication**: Login, Logout, Register, Password Reset
- **Display Functions**: Shop Display, Item Display, User Profile Display
- **Authorization**: Role-based access control (User, Admin, Shop Owner)

### 1.2 Out of Scope
- Order Management (đặt hàng)
- Payment Processing (thanh toán)  
- Delivery Management (giao hàng)

### 1.3 Test Objectives
- Xác minh tính bảo mật của hệ thống authentication
- Đảm bảo hiển thị dữ liệu chính xác và đầy đủ
- Kiểm tra performance và reliability
- Xác nhận compatibility trên các browser/device

## 2. Test Strategy

### 2.1 Testing Levels
```
┌─────────────────┐
│   Unit Tests    │ ← Individual functions/components
├─────────────────┤
│Integration Tests│ ← API endpoints, Database interactions
├─────────────────┤
│  System Tests   │ ← End-to-end user workflows
├─────────────────┤
│Acceptance Tests │ ← Business requirements validation
└─────────────────┘
```

### 2.2 Testing Types
- **Functional Testing**: Blackbox testing cho business logic
- **Structural Testing**: Whitebox testing cho code coverage
- **Security Testing**: Authentication, authorization, input validation
- **Performance Testing**: Load testing, stress testing
- **Usability Testing**: User experience validation

## 3. Test Environment

### 3.1 Environment Setup
- **Development**: Local với Docker Compose
- **Testing**: Isolated test database
- **Staging**: Production-like environment
- **CI/CD**: GitHub Actions automated testing

### 3.2 Test Data
- **Valid Users**: Admin, Shop Owner, Regular User
- **Invalid Data**: Malformed inputs, SQL injection attempts
- **Edge Cases**: Empty fields, special characters, long strings

## 4. Features to Test

### 4.1 Authentication Module

#### 4.1.1 User Registration
**Test Cases:**
- TC_AUTH_REG_001: Valid user registration
- TC_AUTH_REG_002: Duplicate email registration
- TC_AUTH_REG_003: Invalid email format
- TC_AUTH_REG_004: Weak password validation
- TC_AUTH_REG_005: Missing required fields

#### 4.1.2 User Login
**Test Cases:**
- TC_AUTH_LOGIN_001: Valid credentials login
- TC_AUTH_LOGIN_002: Invalid email/password
- TC_AUTH_LOGIN_003: Non-existent user login
- TC_AUTH_LOGIN_004: Account lockout after failed attempts
- TC_AUTH_LOGIN_005: Remember me functionality

#### 4.1.3 User Logout
**Test Cases:**
- TC_AUTH_LOGOUT_001: Normal logout process
- TC_AUTH_LOGOUT_002: Session cleanup verification
- TC_AUTH_LOGOUT_003: Token invalidation
- TC_AUTH_LOGOUT_004: Logout from multiple devices

#### 4.1.4 Password Management
**Test Cases:**
- TC_AUTH_PWD_001: Password reset request
- TC_AUTH_PWD_002: Password reset with valid token
- TC_AUTH_PWD_003: Password reset with expired token
- TC_AUTH_PWD_004: Password change with current password

### 4.2 Shop Display Module

#### 4.2.1 Shop Listing
**Test Cases:**
- TC_SHOP_LIST_001: Display all active shops
- TC_SHOP_LIST_002: Shop search functionality
- TC_SHOP_LIST_003: Shop filtering by category
- TC_SHOP_LIST_004: Shop pagination
- TC_SHOP_LIST_005: Shop sorting options

#### 4.2.2 Shop Details
**Test Cases:**
- TC_SHOP_DETAIL_001: Display shop information
- TC_SHOP_DETAIL_002: Shop owner information
- TC_SHOP_DETAIL_003: Shop rating and reviews
- TC_SHOP_DETAIL_004: Shop operating hours
- TC_SHOP_DETAIL_005: Invalid shop ID handling

### 4.3 Item Display Module

#### 4.3.1 Item Listing
**Test Cases:**
- TC_ITEM_LIST_001: Display items by shop
- TC_ITEM_LIST_002: Item search functionality
- TC_ITEM_LIST_003: Item filtering by price/category
- TC_ITEM_LIST_004: Item availability status
- TC_ITEM_LIST_005: Item image display

#### 4.3.2 Item Details
**Test Cases:**
- TC_ITEM_DETAIL_001: Display item information
- TC_ITEM_DETAIL_002: Item pricing and discounts
- TC_ITEM_DETAIL_003: Item ingredients/description
- TC_ITEM_DETAIL_004: Item reviews and ratings
- TC_ITEM_DETAIL_005: Invalid item ID handling

## 5. Test Execution Plan

### 5.1 Phase 1: Unit Testing (Week 1)
- Backend unit tests cho authentication logic
- Frontend component tests
- Database model tests
- Utility function tests

### 5.2 Phase 2: Integration Testing (Week 2)
- API endpoint testing
- Database integration tests
- Third-party service integration
- Cross-component communication

### 5.3 Phase 3: System Testing (Week 3)
- End-to-end user workflows
- Cross-browser compatibility
- Mobile responsiveness
- Performance testing

### 5.4 Phase 4: Security & Acceptance Testing (Week 4)
- Security vulnerability assessment
- User acceptance testing
- Business requirement validation
- Final regression testing

## 6. Test Deliverables

### 6.1 Test Documentation
- [ ] Test Plan Document (this document)
- [ ] Test Case Specifications
- [ ] Test Data Preparation Guide
- [ ] Test Environment Setup Guide

### 6.2 Test Implementation
- [ ] Unit Test Suites
- [ ] Integration Test Suites
- [ ] E2E Test Scripts
- [ ] Performance Test Scripts

### 6.3 Test Reports
- [ ] Test Execution Reports
- [ ] Coverage Reports
- [ ] Performance Test Results
- [ ] Security Assessment Report

## 7. Entry & Exit Criteria

### 7.1 Entry Criteria
- [ ] Development code complete for target features
- [ ] Test environment setup complete
- [ ] Test data prepared
- [ ] Test cases reviewed and approved

### 7.2 Exit Criteria
- [ ] All planned test cases executed
- [ ] 90%+ test case pass rate
- [ ] 80%+ code coverage achieved
- [ ] No critical/high severity bugs open
- [ ] Performance benchmarks met

## 8. Risk Assessment

### 8.1 Technical Risks
- **Database connectivity issues**: Mitigation - Mock database for unit tests
- **Third-party service failures**: Mitigation - Service mocking and fallback testing
- **Browser compatibility**: Mitigation - Cross-browser testing matrix

### 8.2 Schedule Risks
- **Resource availability**: Mitigation - Parallel test execution
- **Environment issues**: Mitigation - Containerized test environments
- **Scope creep**: Mitigation - Clear scope definition and change control

## 9. Tools and Technologies

### 9.1 Testing Frameworks
- **Backend**: Jest, Supertest, MongoDB Memory Server
- **Frontend**: Vitest, Testing Library, MSW (Mock Service Worker)
- **E2E**: Playwright or Cypress
- **Performance**: Artillery, Lighthouse CI

### 9.2 CI/CD Tools
- **Version Control**: Git, GitHub
- **Containerization**: Docker, Docker Compose
- **CI/CD Pipeline**: GitHub Actions
- **Code Coverage**: Codecov, Istanbul

### 9.3 Monitoring Tools
- **Test Reporting**: Allure, Jest HTML Reporter
- **Performance Monitoring**: Grafana, Prometheus
- **Error Tracking**: Sentry
- **Log Analysis**: Winston, ELK Stack

## 10. Success Metrics

### 10.1 Quality Metrics
- **Defect Density**: < 2 defects per KLOC
- **Test Coverage**: > 80% line coverage
- **Pass Rate**: > 90% test case pass rate
- **Performance**: < 2s response time for 95% of requests

### 10.2 Process Metrics
- **Test Execution Time**: < 30 minutes for full test suite
- **Bug Fix Time**: < 24 hours for critical bugs
- **Test Automation**: > 80% of test cases automated
- **CI/CD Success Rate**: > 95% successful builds
