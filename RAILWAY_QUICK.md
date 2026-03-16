# 🚀 Railway Deployment - Quick Reference

## 5-Minute Setup

### Step 1: Build React Dashboard
```bash
cd dashboard
npm run build
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

### Step 3: Create Railway Project
1. Go to **railway.app**
2. Click **+ New Project**
3. Select **Deploy from GitHub**
4. Choose your repository
5. Click **Deploy**

### Step 4: Add Database
1. Click **+ New**
2. Select **Database → PostgreSQL**
3. Note the `DATABASE_URL` that appears

### Step 5: Set Environment Variables
Click your **Web Service** → **Variables** tab, then add:

```
DATABASE_URL = [copy from PostgreSQL]
WEBHOOK_USER = admin
WEBHOOK_PASS = your_secure_password
```

### Step 6: Initialize Database
Click **PostgreSQL** → **Query** tab → paste entire `schema.sql` file → Execute

### Step 7: Get Your URL
Click **Web Service** → **Settings** → **Networking** → Copy the domain

## ✅ Done!
Visit your domain to see the dashboard live! 🎉

---

## Common Issues

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm run build` locally first |
| Dashboard blank | Make sure `dashboard/dist/` is committed |
| 401 errors on API | Check WEBHOOK_USER and WEBHOOK_PASS match |
| Empty dashboard | Send a test webhook to populate data |

## Useful Links
- **Dashboard at:** `https://your-railway-url/`
- **API endpoint:** `https://your-railway-url/api/stats`
- **Webhook endpoint:** `https://your-railway-url/webhook`

---

**For detailed steps:** See [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)
