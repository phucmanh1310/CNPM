# Railway Deployment Guide

## Recommended Setup

Railway should deploy from the **BackEnd** directory, not the root.

### Configuration in Railway Dashboard:

1. Go to your service settings
2. Set **Root Directory** to: `BackEnd`
3. Railway will automatically:
   - Detect `BackEnd/nixpacks.toml`
   - Use yarn (installed via nixpacks)
   - Run `yarn start`

### Files for Railway:

- `BackEnd/nixpacks.toml` - Tells Railway to use yarn
- `BackEnd/railway.toml` - Service configuration
- `BackEnd/.npmrc` - Prevents npm from creating package-lock.json

### Environment Variables Needed:

```
PORT=8000
MONGO_URI=mongodb://...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
NODE_ENV=production
```

### Deployment from Root (NOT RECOMMENDED):

If you must deploy from root directory:

- Railway will use `nixpacks.toml` at root
- It will run `node BackEnd/index.js` directly
- This bypasses yarn entirely
