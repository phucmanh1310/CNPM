# Cấu hình Vercel Environment Variables

## 🔧 Bước 1: Vào Vercel Dashboard

1. Truy cập: https://vercel.com/dashboard
2. Chọn project: **cnpm**
3. Vào **Settings** → **Environment Variables**

## 📝 Bước 2: Thêm biến môi trường

### Biến cần thiết:

| Variable Name       | Value                                         | Environment                      |
| ------------------- | --------------------------------------------- | -------------------------------- |
| `VITE_API_BASE_URL` | `https://cnpm-production-7745.up.railway.app` | Production, Preview, Development |
| `VITE_GEOAPIKEY`    | `6b80094f605040a5b675e471228438fa`            | Production, Preview, Development |

### Cách thêm:

1. Click **Add New**
2. **Key**: `VITE_API_BASE_URL`
3. **Value**: `https://cnpm-production-7745.up.railway.app`
4. **Environment**: Chọn tất cả (Production, Preview, Development)
5. Click **Save**

6. Click **Add New** lần nữa
7. **Key**: `VITE_GEOAPIKEY`
8. **Value**: `6b80094f605040a5b675e471228438fa`
9. **Environment**: Chọn tất cả
10. Click **Save**

## 🚀 Bước 3: Redeploy

Sau khi thêm environment variables:

1. Vào tab **Deployments**
2. Chọn deployment mới nhất
3. Click **...** (menu) → **Redeploy**
4. Hoặc đơn giản push một commit mới lên GitHub

## ✅ Bước 4: Kiểm tra

Sau khi redeploy xong:

1. Mở: https://cnpm-ten.vercel.app
2. Mở Developer Console (F12)
3. Vào tab **Network**
4. Thử login hoặc call API
5. Kiểm tra request đi tới `https://cnpm-production-7745.up.railway.app/api/...`

### Nếu vẫn lỗi CORS:

Kiểm tra:

- Railway backend có đang chạy không: https://cnpm-production-7745.up.railway.app/health
- Console có báo lỗi CORS không
- Request có được gửi đến đúng URL không

## 📌 Lưu ý

- **VITE\_** prefix là bắt buộc cho Vite environment variables
- Sau khi thay đổi env vars, **PHẢI redeploy** mới có hiệu lực
- Không có dấu `/` ở cuối URL backend
- Railway URL có thể thay đổi nếu bạn regenerate domain

## 🔍 Troubleshooting

### Lỗi: "Failed to fetch" hoặc Network Error

**Nguyên nhân**: Frontend không connect được backend

**Giải pháp**:

1. Kiểm tra Railway backend đang chạy
2. Verify `VITE_API_BASE_URL` đã được set trong Vercel
3. Redeploy Vercel sau khi thêm env vars

### Lỗi: CORS policy blocked

**Nguyên nhân**: Backend không cho phép origin của Vercel

**Giải pháp**:

1. Kiểm tra `BackEnd/index.js` có domain Vercel trong `allowedOrigins`
2. Push code mới lên GitHub để Railway redeploy

### Lỗi: 404 Not Found trên /api/...

**Nguyên nhân**: Base URL không đúng

**Giải pháp**:

1. Verify `VITE_API_BASE_URL` không có dấu `/` ở cuối
2. Kiểm tra `main.jsx` logic xử lý baseURL
