# Render Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy session ID Instagram DM bot to Render"
git push origin main
```

### 2. Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `https://github.com/Trenddev12/ig-dm-bot`
4. Configure the service:

### 3. Service Configuration
- **Name**: `ig-dm-bot`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` or closest to your users
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `node sendDm.js`

### 4. Environment Variables
Set these in Render's Environment tab:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `IG_SESSION_ID` | `71638033137%3AFCZkHir9q9Ncz3%3A6%3AAYdJrK5lxkAFFunzXHWw_4Z92fQrbcy95UFG4gVzmQ` |

### 5. Advanced Settings
- **Auto-Deploy**: `Yes`
- **Health Check Path**: `/`
- **Plan**: `Starter` (free tier)

## 🔧 Post-Deployment

### Test the Deployment
```bash
# Replace YOUR_RENDER_URL with your actual Render URL
curl https://your-app-name.onrender.com

# Test DM sending
curl -X POST https://your-app-name.onrender.com/send-instagram-dm \
  -H "Content-Type: application/json" \
  -d '{"username":"natgeo","message":"Test from Render!"}'
```

### Monitor Logs
1. Go to Render Dashboard
2. Click on your service
3. Go to "Logs" tab to monitor activity

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Fails
- Check if all dependencies are in package.json
- Verify Node.js version compatibility

#### 2. Chrome Installation Fails
- The postinstall script should handle this automatically
- Check build logs for Puppeteer errors

#### 3. Session ID Issues
- Verify the session ID is correctly set in environment variables
- Check if session has expired (get new one from browser)

#### 4. DM Sending Fails
- Check target account allows DMs
- Verify Instagram hasn't rate-limited the account
- Check service logs for detailed error messages

### Getting New Session ID
1. Login to Instagram in browser
2. Open Developer Tools (F12)
3. Go to Application → Cookies → instagram.com
4. Copy `sessionid` value
5. Update environment variable in Render

## 📊 Monitoring

### Health Checks
- Render automatically monitors the `/` endpoint
- Service will restart if health checks fail

### Logs
- All console.log statements appear in Render logs
- Screenshots are saved but not accessible (use for local debugging)

### Performance
- Starter plan: 512MB RAM, 0.1 CPU
- Should handle 10-20 concurrent DM requests

## 🔄 Updates

### Automatic Deployment
- Push to main branch triggers automatic deployment
- No manual intervention needed

### Manual Deployment
1. Go to Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

## 🔐 Security

### Environment Variables
- Never commit session IDs to Git
- Use Render's environment variable system
- Rotate session IDs regularly

### Rate Limiting
- Consider adding rate limiting to prevent abuse
- Monitor for Instagram restrictions

## 📈 Scaling

### Upgrade Plans
- If you need more resources, upgrade to paid plans
- Professional plan: 2GB RAM, 1 CPU

### Multiple Instances
- For high volume, consider multiple services with different session IDs
- Load balance between instances
