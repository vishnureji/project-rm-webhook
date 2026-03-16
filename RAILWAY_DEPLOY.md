# 🚀 Deploy to Railway - Complete Guide

Railway is perfect for deploying your webhook server + dashboard. This guide walks through everything.

## Prerequisites

✅ GitHub account (to push your code)  
✅ Railway account (railway.app)  
✅ Your code repo ready to push

## 📋 Step 1: Prepare Your Code

### 1.1 Build the React Dashboard Locally
```bash
cd dashboard
npm run build
```

This creates the `dashboard/dist/` folder with optimized production files.

### 1.2 Commit Everything to Git
```bash
git add .
git commit -m "Deploy dashboard to Railway"
git push origin main
```

**Important:** Make sure `dashboard/dist/` is committed (it's not in .gitignore). The React build files are needed!

## 🎯 Step 2: Create Railway Project

1. Go to **railway.app**
2. Sign in or create account
3. Click **+ New Project**
4. Select **Deploy from GitHub repo**
5. Authorize Railway to access your GitHub
6. Find and select your webhook repo
7. Click Deploy

Railway will read `railway.toml` and start building!

## 🗄️ Step 3: Add PostgreSQL Database

1. In your Railway project, click **+ New**
2. Select **Database → PostgreSQL**
3. It will generate a `DATABASE_URL` automatically
4. Copy the full URL

## 🔐 Step 4: Set Environment Variables

In your Railway project:

1. Click the **Web Service** (the Python/webhook one)
2. Go to **Variables** tab
3. Add these variables:

| Key | Value | Example |
|-----|-------|---------|
| `DATABASE_URL` | From PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `WEBHOOK_USER` | Your username | `admin` |
| `WEBHOOK_PASS` | Your password | `super_secure_pass_123` |

4. Click **Deploy** to apply changes

## 📊 Step 5: Initialize Database Schema

1. Go to your **PostgreSQL database** service
2. Click **Query** tab
3. Copy-paste the contents of `schema.sql`
4. Execute

This creates the `articles_with_authors` table.

## ✅ Step 6: Get Your Public URL

1. Click the **Web Service**
2. Go to **Settings** tab
3. Look for **Networking** → **Custom Domain**
4. Railway generates a public URL like: `webhook-production-xyz.up.railway.app`
5. Copy this URL

Your dashboard is now live! 🎉

**Test it:**
```
https://webhook-production-xyz.up.railway.app/
```

## 🧪 Step 7: Test the Webhook

Send a test webhook (replace YOUR_URL and credentials):

```bash
curl -X POST https://your-railway-url.up.railway.app/webhook \
  -H "Content-Type: application/json" \
  -u admin:your_password \
  -d '{
    "payload": {
      "id": 123,
      "headline": "Test Article from Railway",
      "post_url": "https://example.com/article",
      "created_ts": 1710604800,
      "updated_ts": 1710604800,
      "roar_authors": [
        {
          "id": 1,
          "title": "John Doe",
          "avatar": "https://example.com/avatar.jpg",
          "profile_href": "https://example.com/profile"
        }
      ]
    }
  }'
```

If successful, you'll see:
```json
{"status": "success", "message": "Article Synced"}
```

## 📊 View Dashboard

Open your Railway URL and you should see:

✅ Statistics cards (total articles, authors)  
✅ Posts per day chart  
✅ Top authors chart  
✅ Author profile cards  
✅ Recent articles list

## 🔄 Continuous Deployment

Now when you push to GitHub:

```bash
git push origin main
```

Railway **automatically redeploys**! 🚀

This includes:
- Building the React dashboard
- Installing Python dependencies
- Restarting the server

## 🐛 Troubleshooting

### Dashboard shows "Connection refused"
- Frontend is trying to reach `/api` endpoints
- Check Railway Web Service logs for errors
- Ensure `DATABASE_URL` is set correctly

### Empty dashboard (no data)
- Database table is empty
- Send a test webhook to populate data
- Or manually insert test data in PostgreSQL

### "401 Unauthorized" errors
- Your webhook credentials are wrong
- Check `WEBHOOK_USER` and `WEBHOOK_PASS` variables
- Credentials in curl command must match what you set

### Build fails with Node errors
- Check that `dashboard/dist/` is committed
- Verify `npm run build` works locally first
- Look at Railway build logs for details

### React app not loading, only API works
- `dashboard/dist/` folder is missing
- Make sure you ran `npm run build` before committing
- Check the build logs in Railway

## 📝 Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/db` |
| `WEBHOOK_USER` | HTTP Basic Auth username | `admin` |
| `WEBHOOK_PASS` | HTTP Basic Auth password | `secure_password` |
| `PORT` | Server port (optional, default: 8000) | `8000` |

## 🔗 API Endpoints (After Deploying)

- `GET https://your-url/` → React Dashboard
- `POST https://your-url/webhook` → Webhook receiver
- `GET https://your-url/api/stats` → Statistics API
- `GET https://your-url/api/posts-per-day` → Daily posts
- `GET https://your-url/api/top-authors` → Top authors
- `GET https://your-url/api/recent-articles` → Recent articles

(All `/api/*` endpoints require HTTP Basic Auth)

## 🚀 Production Tips

1. **Use strong passwords** for `WEBHOOK_USER` and `WEBHOOK_PASS`
2. **Monitor logs** in Railway dashboard for errors
3. **Set up alerts** if errors spike
4. **Use custom domain** for professional look
5. **Back up database** regularly
6. **Cache API responses** on frontend for better performance

## 📚 Useful Railway Commands

### View Logs
```bash
railway logs
```

### Connect to PostgreSQL
```bash
railway psql
```

### Set Environment Variables (CLI)
```bash
railway variables set WEBHOOK_USER=admin
railway variables set WEBHOOK_PASS=secure_pass
```

### Deploy Manually
```bash
railway up
```

## ✨ You're Done!

Your webhook + dashboard is now live on Railway! 🎉

**Next Steps:**
- Configure RebelMouse to send webhooks to your Railway URL
- Set up monitoring/alerts
- Customize the dashboard styling
- Add more analytics features

For more help: [Railway Docs](https://railway.app/docs)

---

**Need help?** Check Railway's documentation or reach out to Railway support!
