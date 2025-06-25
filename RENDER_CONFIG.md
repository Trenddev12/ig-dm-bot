# Render Configuration Guide

## 📋 Exact Configuration for Render

### Basic Settings
```
Service Name: ig-dm-bot
Environment: Node
Region: Oregon (US West)
Branch: main
Root Directory: (leave blank)
```

### Build & Deploy Settings
```
Build Command: npm install
Start Command: node sendDm.js
```

### Environment Variables (CRITICAL)
Add these in the "Environment" tab:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | `3000` | Port for the service |
| `IG_SESSION_ID` | `71638033137%3AFCZkHir9q9Ncz3%3A6%3AAYdJrK5lxkAFFunzXHWw_4Z92fQrbcy95UFG4gVzmQ` | Your Instagram session ID |

### Advanced Settings
```
Auto-Deploy: ✅ Enabled
Health Check Path: /
```

## 🔧 Step-by-Step Render Setup

### Step 1: Create Service
1. Login to Render: https://dashboard.render.com
2. Click "New +" button (top right)
3. Select "Web Service"

### Step 2: Connect Repository
1. Click "Connect a repository"
2. If GitHub not connected, click "Connect GitHub"
3. Find and select: `Trenddev12/ig-dm-bot`
4. Click "Connect"

### Step 3: Configure Service
Fill in these exact values:

**Name**: `ig-dm-bot`
**Environment**: `Node`
**Region**: `Oregon (US West)` (or your preferred region)
**Branch**: `main`
**Build Command**: `npm install`
**Start Command**: `node sendDm.js`

### Step 4: Environment Variables
1. Scroll down to "Environment Variables"
2. Click "Add Environment Variable" for each:

**Variable 1:**
- Key: `NODE_ENV`
- Value: `production`

**Variable 2:**
- Key: `PORT`
- Value: `3000`

**Variable 3:**
- Key: `IG_SESSION_ID`
- Value: `71638033137%3AFCZkHir9q9Ncz3%3A6%3AAYdJrK5lxkAFFunzXHWw_4Z92fQrbcy95UFG4gVzmQ`

### Step 5: Advanced Settings
1. Scroll to "Advanced"
2. Set "Auto-Deploy": `Yes`
3. Set "Health Check Path": `/`

### Step 6: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)

## 🎯 Expected Deployment Process

### Build Phase (2-3 minutes)
```
==> Cloning from https://github.com/Trenddev12/ig-dm-bot...
==> Using Node version 18.x.x
==> Running build command 'npm install'...
    Installing dependencies...
    Installing Puppeteer Chrome...
==> Build successful!
```

### Deploy Phase (1-2 minutes)
```
==> Starting service with 'node sendDm.js'...
🚀 Instagram DM Bot Server is running on port 3000
📍 Environment: production
🔑 Session ID configured: Yes
==> Service is live at https://ig-dm-bot-xxxx.onrender.com
```

## ✅ Verification Steps

### 1. Check Service Status
- Service should show "Live" status in Render dashboard
- No error messages in logs

### 2. Test Health Endpoint
```bash
curl https://your-service-url.onrender.com
# Should return: "FluxDX IG DM bot is live 🚀"
```

### 3. Test DM Endpoint
```bash
curl -X POST https://your-service-url.onrender.com/send-instagram-dm \
  -H "Content-Type: application/json" \
  -d '{"username":"natgeo","message":"Test from Render deployment!"}'
```

## 🚨 Common Issues & Solutions

### Issue 1: Build Fails
**Error**: `npm install` fails
**Solution**: Check package.json is valid JSON

### Issue 2: Chrome Installation Fails
**Error**: Puppeteer can't install Chrome
**Solution**: This should work automatically with our postinstall script

### Issue 3: Service Won't Start
**Error**: `node sendDm.js` fails
**Solution**: Check environment variables are set correctly

### Issue 4: Session ID Invalid
**Error**: Login verification fails
**Solution**: Get fresh session ID from browser

## 📊 Expected Performance

### Startup Time
- Cold start: 30-60 seconds
- Warm start: 5-10 seconds

### Memory Usage
- Base: ~100MB
- With browser: ~200-300MB
- Peak: ~400MB

### Response Times
- Health check: <100ms
- DM sending: 10-30 seconds (depending on Instagram)

## 🔄 Monitoring

### Logs Location
- Render Dashboard → Your Service → Logs tab
- Real-time log streaming available

### Key Log Messages
```
✅ Good: "🚀 Instagram DM Bot Server is running on port 3000"
✅ Good: "🔑 Session ID configured: Yes"
✅ Good: "✅ Session is valid, login successful"
❌ Bad: "❌ Session invalid"
❌ Bad: "Message button not found"
```

## 🎉 Success Indicators

1. ✅ Service shows "Live" in Render dashboard
2. ✅ Health endpoint returns bot message
3. ✅ Logs show successful startup
4. ✅ Session ID authentication working
5. ✅ Can send test DM successfully
