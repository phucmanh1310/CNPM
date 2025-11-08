# Quick Deployment Guide - Vercel + Render

làm theo video của https://www.youtube.com/watch?v=mjU6bT3JgHw +
https://www.youtube.com/watch?v=N48cnnDCOp8
hoặc các hướng dẫn bên dưới

## 🚀 Tổng quan

Stack deployment:

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Database**: MongoDB Atlas (Free tier)
- **CI/CD**: GitHub Actions

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (signup tại https://vercel.com)
- [ ] Render account (signup tại https://render.com)
- [ ] MongoDB Atlas account (signup tại https://cloud.mongodb.com)

---

## Part 1: Setup MongoDB Atlas (5 phút)

### Bước 1: Tạo Free Cluster

1. Vào https://cloud.mongodb.com
2. Click **"Build a Database"** → **"FREE"** → **"Create"**
3. Chọn provider: **AWS** hoặc **Google Cloud**
4. Region: **Singapore** (gần VN nhất)
5. Cluster Name: `KTPM` → **"Create Cluster"**

### Bước 2: Create Database User

1. Sidebar → **"Database Access"**
2. **"Add New Database User"**
3. Username: `ktpm_admin`
4. Password: **"Autogenerate Secure Password"** → Copy password
5. **"Add User"**

### Bước 3: Whitelist IP

1. Sidebar → **"Network Access"**
2. **"Add IP Address"**
3. **"Allow Access from Anywhere"** (0.0.0.0/0)
4. **"Confirm"**

### Bước 4: Get Connection String

1. Sidebar → **"Database"** → **"Connect"**
2. **"Connect your application"**
3. Copy connection string:
   ```
   mongodb+srv://ktpm_admin:<password>@ktpm.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Thay `<password>` bằng password ở Bước 2

**✅ Done! Lưu connection string này**

---

## Part 2: Deploy Backend to Render (10 phút)

### Bước 1: Tạo Web Service

1. Vào https://dashboard.render.com
2. **"New +"** → **"Web Service"**
3. **"Connect account"** → Authorize GitHub
4. Chọn repository: **`phucmanh1310/CNPM`**

### Bước 2: Configure Service

```
Name: ktpm-backend
Region: Singapore
Branch: main
Root Directory: BackEnd
Runtime: Node
Build Command: yarn
Start Command: yarn production
Instance Type: Free
```

### Bước 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

```bash
NODE_ENV=production
PORT=8000
MONGO_URI=<your-mongodb-connection-string-from-part-1>
JWT_SECRET=<generate-random-string-64-chars>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
EMAIL_USER=<your-gmail>
EMAIL_PASS=<your-gmail-app-password>
MOMO_ACCESS_KEY=<your-momo-access-key>
MOMO_PARTNER_CODE=<your-momo-partner-code>
MOMO_SECRET_KEY=<your-momo-secret-key>
```

### Bước 4: Deploy

1. Click **"Create Web Service"**
2. Đợi 5-10 phút để build & deploy
3. Sau khi deploy xong, copy URL: vd:`https://ktpm-backend.onrender.com`

### Bước 5: Test Backend

```bash
# Health check
curl https://cnpm-6sgw.onrender.com/health
cur
# Expected response:
# {"status":"ok","timestamp":"..."}
```

**✅ Done! Backend deployed**

---

## Part 3: Deploy Frontend to Vercel (5 phút)

### Bước 1: Import Project

1. Vào https://vercel.com/new
2. **"Import Git Repository"** → Authorize GitHub
3. Chọn repository: **`phucmanh1310/CNPM`**
4. Click **"Import"**

### Bước 2: Configure Project

```
Project Name:
Framework Preset: Vite
Root Directory: FrontEnd
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Bước 3: Add Environment Variables

Click **"Environment Variables"**:

```
Name: VITE_API_URL
Value: https://cnpm-6sgw.onrender.com

Name: VITE_GEOAPIKEY
Value: get in website
```

> **Note**: Get your free Geoapify API key at https://www.geoapify.com/ (3000 requests/day)

### Bước 4: Deploy

1. Click **"Deploy"**
2. Đợi 2-3 phút để build
3. Sau khi deploy xong, copy URL: `https://ktpm-frontend.vercel.app`

### Bước 5: Test Frontend

1. Mở browser: `https://cnpm-ten.vercel.app`
2. Kiểm tra console (F12) → không có errors
3. Test login/register

**✅ Done! Frontend deployed**

---

## Part 4: Setup GitHub Secrets for Auto-Deploy

### Bước 1: Get Vercel Credentials

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd FrontEnd
vercel link

# Get tokens
vercel whoami
```

Copy từ `.vercel/project.json`:

- `projectId` → `VERCEL_PROJECT_ID`
- `orgId` → `VERCEL_ORG_ID`

Get Vercel Token:

1. https://vercel.com/account/tokens
2. **"Create Token"** → Copy

### Bước 2: Get Render Credentials

1. https://dashboard.render.com/settings/api
2. **"Create API Key"** → Copy
3. Vào service → **"Settings"** → Copy **Service ID** từ URL

### Bước 3: Add GitHub Secrets

Vào: `https://github.com/phucmanh1310/CNPM/settings/secrets/actions`

**Add New Repository Secret:**

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>

RENDER_API_KEY=<your-render-api-key>
RENDER_SERVICE_ID=<your-service-id>

BACKEND_URL=https://ktpm-backend.onrender.com
FRONTEND_URL=https://ktpm-frontend.vercel.app
```

**✅ Done! Auto-deploy configured**

---

## Part 5: Test Auto-Deploy

### Test 1: Backend Auto-Deploy

```bash
# Make a change in BackEnd
cd BackEnd
echo "// test deploy" >> index.js

# Commit and push
git add .
git commit -m "test: backend auto-deploy"
git push origin main

# Check GitHub Actions
# https://github.com/phucmanh1310/CNPM/actions
```

### Test 2: Frontend Auto-Deploy

```bash
# Make a change in FrontEnd
cd FrontEnd
# Edit src/App.jsx - add a comment

# Commit and push
git add .
git commit -m "test: frontend auto-deploy"
git push origin main

# Check GitHub Actions & Vercel dashboard
```

---

## 🎉 Hoàn thành!

### URLs

- **Frontend**: https://ktpm-frontend.vercel.app
- **Backend API**: https://ktpm-backend.onrender.com
- **Backend Health**: https://ktpm-backend.onrender.com/health
- **GitHub Actions**: https://github.com/phucmanh1310/CNPM/actions

### Workflow

```
Code Change → Push to GitHub → GitHub Actions → Auto Deploy
  ↓                                                    ↓
 main                                          Vercel/Render
```

### Free Tier Limits

- **MongoDB Atlas**: 512 MB storage, unlimited requests
- **Vercel**: Unlimited deployments, 100 GB bandwidth/month
- **Render**: 750 hours/month free tier, auto-sleep after 15min inactive

---

## ⚠️ Important Notes

1. **Render Free Tier**: Service sleeps after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds (cold start)
   - Solution: Use cron job to ping every 14 minutes

2. **Environment Variables**:
   - Frontend cần prefix `VITE_` cho variables
   - Backend không cần prefix

3. **CORS**:
   - Đảm bảo backend allow origin từ Vercel domain
   - Update trong `BackEnd/index.js`

4. **MongoDB Connection**:
   - Sử dụng connection string từ MongoDB Atlas
   - Không dùng localhost

---

## 🔧 Troubleshooting

### Backend không start

```bash
# Check Render logs
https://dashboard.render.com → Your Service → Logs

# Common issues:
# - Missing environment variables
# - MongoDB connection failed
# - Port binding error
```

### Frontend API errors

```bash
# Check browser console (F12)
# Verify VITE_API_URL is correct
# Check CORS settings in backend
```

### Auto-deploy không chạy

```bash
# Check GitHub Actions
https://github.com/phucmanh1310/CNPM/actions

# Verify secrets are added correctly
# Check workflow triggers (push to main, paths)
```

---

## 📚 Next Steps

- [ ] Setup custom domain (optional)
- [ ] Add monitoring (Sentry, LogRocket)
- [ ] Setup backup automation
- [ ] Configure CDN for static assets
- [ ] Add performance monitoring

---

**Need help?** Check:

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
