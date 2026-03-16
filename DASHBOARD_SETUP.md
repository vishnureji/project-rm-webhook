# 🚀 Getting Started - Complete Setup Guide

## Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- PostgreSQL database running

## 🔧 Step-by-Step Setup

### Step 1: Set Environment Variables

Create a `.env` file in the root directory (where `webhook.py` is):

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
WEBHOOK_USER=admin
WEBHOOK_PASS=your_secure_password
PORT=8000
```

### Step 2: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

Add `pandas` to requirements.txt if not already there:

```
fastapi
uvicorn[standard]
psycopg2-binary
pandas
```

### Step 3: Initialize Database

Run the schema:

```bash
psql -U your_user -d your_database -f schema.sql
```

### Step 4: Start Webhook Server

```bash
python webhook.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 5: Install Frontend Dependencies

In a new terminal:

```bash
cd dashboard
npm install
```

### Step 6: Run Dashboard

```bash
npm run dev
```

Dashboard is now at: **http://localhost:5173**

## 📊 Using the Dashboard

1. Open http://localhost:5173 in your browser
2. You'll see cards with:
   - Total articles count
   - Total authors count
   - Last updated date

3. Charts show:
   - Posts per day (last 30 days)
   - Top 15 authors
   - Author grid cards
   - Recent articles list

## 🔌 Testing the Webhook

Send a test webhook to `http://localhost:8000/webhook`:

```bash
curl -X POST http://localhost:8000/webhook \
  -H "Content-Type: application/json" \
  -u admin:your_secure_password \
  -d '{
    "payload": {
      "id": 123,
      "headline": "Test Article",
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

## 🏗️ Production Deployment

### Option 1: Using Railway (Recommended)

👉 **[See full Railway deployment guide →](RAILWAY_DEPLOY.md)**

Quick summary:
1. Push code to GitHub
2. Create Railway project from GitHub repo
3. Add PostgreSQL database
4. Set environment variables (DATABASE_URL, WEBHOOK_USER, WEBHOOK_PASS)
5. Run schema.sql in Railway's Query tab
6. Your app is live! Railway auto-deploys on each git push

### Option 2: Manual Deployment

1. Build React app:
   ```bash
   cd dashboard
   npm run build
   ```

2. Serve dist folder with your web server (nginx, etc)
3. Deploy Python app with gunicorn:
   ```bash
   gunicorn -w 4 webhook:app
   ```

## 📝 API Documentation

### GET /api/stats
Returns overall statistics

**Response:**
```json
{
  "total_articles": 150,
  "total_authors": 25,
  "latest_article_ts": 1710604800
}
```

### GET /api/posts-per-day
Returns posts per day for last 30 days

**Response:**
```json
[
  {"date": "2024-03-16", "count": 5},
  {"date": "2024-03-15", "count": 3}
]
```

### GET /api/top-authors
Returns top 15 authors by post count

**Response:**
```json
[
  {
    "author_id": 1,
    "name": "John Doe",
    "photo": "https://...",
    "profile_url": "https://...",
    "post_count": 42
  }
]
```

### GET /api/recent-articles?limit=20
Returns recent articles

**Response:**
```json
[
  {
    "post_id": 123,
    "headline": "Article Title",
    "post_url": "https://...",
    "created_ts": 1710604800,
    "author": "John Doe",
    "photo": "https://...",
    "profile_url": "https://..."
  }
]
```

## 🆘 Troubleshooting

### "Connection refused" error
- Check if webhook server is running: `http://localhost:8000`
- Verify `DATABASE_URL` is correct

### Empty dashboard
- Send a test webhook to populate data
- Check database with: `SELECT COUNT(*) FROM articles_with_authors;`

### CORS errors
- Ensure vite.config.js has correct proxy settings
- Check that API calls use `/api/` prefix

### Database errors
- Run schema: `psql -f schema.sql`
- Verify credentials in `.env` file
- Check PostgreSQL is running

## 📚 Next Steps

1. Customize styling in `src/index.css`
2. Add more analytics endpoints
3. Implement authentication in React
4. Set up monitoring/alerts
5. Create export/download features

---

**Questions?** Check the main README.md or the component files for more details!
