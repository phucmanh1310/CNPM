# 📄 Tài Liệu Báo Cáo Tổng Hợp: Chiến Lược Kiểm Thử và CI/CD cho Dự Án E-commerce

## 1. Tổng Quan Kiến Trúc & Chiến Lược

### 1.1. Kiến Trúc Ứng Dụng
Ứng dụng được xây dựng theo kiến trúc **Full-stack** với hai thành phần chính:

| Thành Phần | Công Nghệ Chính | Chi Tiết Kỹ Thuật |
| :--- | :--- | :--- |
| **Backend** | **Node.js + Express.js** | Database: MongoDB (Mongoose), Auth: JWT + bcryptjs, File Upload: Cloudinary + Multer, Email: Nodemailer. |
| **Frontend** | **React + Vite** | State: Redux Toolkit, Styling: TailwindCSS, Build Tool: Vite. |

---

### 1.2. Chiến Lược Kiểm Thử (Testing Strategy)
Chiến lược kiểm thử tuân thủ mô hình **Testing Pyramid** với 4 cấp độ:

| Cấp Độ Kiểm Thử | Mục Tiêu | Công Cụ | Code Coverage Target (Line) |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Kiểm tra các hàm, module riêng lẻ. | Backend: **Jest**, Frontend: **Vitest** | $\geq 90\%$ (Backend), $\geq 85\%$ (Frontend) |
| **Integration Tests** | Kiểm tra sự tương tác giữa các thành phần (API ↔ DB, Component ↔ Service). | Backend: **Supertest**, Frontend: **Testing Library** | $\geq 80\%$ |
| **System Tests (E2E)**| Kiểm tra luồng người dùng toàn diện. | **Playwright** hoặc **Cypress** | N/A |
| **Acceptance Tests** | Xác nhận đáp ứng yêu cầu nghiệp vụ. | Manual QA, Blackbox Test Cases | N/A |

---

## 2. Kế Hoạch Kiểm Thử Chi Tiết

### 2.1. Phạm Vi Kiểm Thử (Scope)
* **Chức Năng Chính**: Authentication (Login, Logout, Register, Password Reset), Display Functions (Shop Display, Item Display, User Profile Display), Authorization (Role-based access control).
* **Out of Scope**: Order Management, Payment Processing, Delivery Management.

### 2.2. Mục Tiêu Code Coverage
| Metric | Backend Goal | Frontend Goal |
| :--- | :--- | :--- |
| **Statements** | $\geq 90\%$ | $\geq 85\%$ |
| **Branches** | $\geq 85\%$ | $\geq 80\%$ |
| **Functions** | $\geq 95\%$ | $\geq 90\%$ |
| **Lines** | $\geq 90\%$ | $\geq 85\%$ |

### 2.3. Các Trường Hợp Kiểm Thử Tiêu Biểu

#### Blackbox Test Cases (Kiểm thử chức năng)
| Module | ID | Mục Tiêu | Kết Quả Mong Đợi |
| :--- | :--- | :--- | :--- |
| **Registration** | TC\_AUTH\_REG\_001 | Đăng ký với dữ liệu hợp lệ. | Thành công, gửi email xác minh. |
| **Login** | TC\_AUTH\_LOGIN\_002 | Đăng nhập với thông tin không hợp lệ. | Thất bại, lỗi "Invalid email or password". |
| **Security** | TC\_DATA\_VAL\_001 | Kiểm tra phòng chống SQL Injection. | Inputs properly sanitized, No database errors. |

#### Whitebox Test Cases (Kiểm thử cấu trúc - Code)
* **TC\_WB\_AUTH\_HASH\_001**: Xác minh hàm `hashPassword` sử dụng **bcrypt** để mã hóa.
* **TC\_WB\_AUTH\_JWT\_001**: Kiểm tra hàm `generateToken` tạo ra JWT hợp lệ và hàm `verifyToken` xác thực thành công.
* **TC\_WB\_FE\_SHOP\_001**: Test component `ShopList.jsx` xử lý các trạng thái **Loading**, **Empty** và **Rendering** dữ liệu.

---

## 3. Chiến Lược CI/CD (Continuous Integration/Continuous Delivery)

### 3.1. Git Workflow
Sử dụng mô hình **Git Flow** đơn giản hóa:
* **`main`**: Môi trường **Production** (Manual approval để merge).
* **`develop`**: Môi trường **Staging** (Auto deploy).
* **`feature/*`**: Các nhánh phát triển tính năng.

### 3.2. CI/CD Pipeline với GitHub Actions
Pipeline bao gồm các giai đoạn chính:

| Stage | Mục Đích | Công Cụ |
| :--- | :--- | :--- |
| **1. Code Quality** | Linting, Formatting, Security Scan. | **ESLint**, **Prettier**, **npm audit** |
| **2. Testing** | Chạy Unit và Integration Tests. | **Jest**, **Vitest**, **Supertest** |
| **3. Build & Package** | Đóng gói ứng dụng thành containers. | **Docker** (Multi-stage builds) |
| **4. Deployment** | Triển khai lên môi trường Staging. | **GitHub Actions** |

### 3.3. Các Công Cụ và Công Nghệ
* **CI/CD Platform**: **GitHub Actions**
* **Containerization**: **Docker**
* **Test Database**: **MongoDB Memory Server** (cho unit/integration tests)

---

## 4. Môi Trường Kiểm Thử (Test Environment Setup)

### 4.1. Cài Đặt Ban Đầu (Prerequisites)
Yêu cầu cài đặt các công cụ sau:
* **Node.js** (v18.x hoặc cao hơn)
* **Git**
* **Docker** (và Docker Compose)

### 4.2. Cấu Hình Môi Trường
* **Local Development**: Sử dụng **Docker Compose** để khởi động đồng thời Backend (Port 5000), Frontend (Port 5173), và MongoDB (Port 27017).
* **Test Database (CI)**: Sử dụng dịch vụ **MongoDB** trong GitHub Actions (hoặc `mongodb-memory-server` cho các bài test).
* **Quản lý Secrets**: Sử dụng **GitHub Secrets** để lưu trữ các thông tin nhạy cảm (`JWT_SECRET`, `MONGO_URI`, v.v.).

---

## 5. Tiêu Chí Đánh Giá Thành Công (Success Metrics)

| Hạng Mục | Metrics | Mục Tiêu |
| :--- | :--- | :--- |
| **Quality** | Test Coverage (Line) | $\geq 80\%$ |
| | Pass Rate (Test Case) | $\geq 90\%$ |
| | Defect Density | $< 2$ defects/KLOC |
| **Development** | Deployment Frequency | Daily |
| | Lead Time (Code → Prod) | $< 1$ day |
| **Operational** | Uptime | $\geq 99.9\%$ |
| | MTTR (Mean Time to Recovery) | $< 1$ hour |