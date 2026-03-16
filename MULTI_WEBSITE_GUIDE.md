# 🌐 Multi-Website Support Guide

Your webhook system now supports multiple websites with separate analytics dashboards!

## 🎯 How It Works

Each website can send webhooks to the same endpoint. The system automatically:
- Differentiates articles by website
- Tracks separate statistics per website
- Displays website-wise analytics in the dashboard

## 📝 Sending Webhooks for Multiple Websites

### Include `website_id` and `website_name` in your webhook payload:

```bash
curl -X POST https://your-railway-url.com/webhook \
  -H "Content-Type: application/json" \
  -u admin:your_password \
  -d '{
    "website_id": "site1",
    "website_name": "Tech Blog",
    "payload": {
      "id": 123,
      "headline": "Article Title",
      "post_url": "https://techblog.com/article",
      "created_ts": 1710604800,
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

### For another website:

```bash
curl -X POST https://your-railway-url.com/webhook \
  -H "Content-Type: application/json" \
  -u admin:your_password \
  -d '{
    "website_id": "site2",
    "website_name": "Style Magazine",
    "payload": {
      "id": 456,
      "headline": "Fashion Trends",
      "post_url": "https://stylemagazine.com/article",
      "created_ts": 1710604800,
      "roar_authors": [
        {
          "id": 2,
          "title": "Jane Smith",
          "avatar": "https://example.com/avatar2.jpg",
          "profile_href": "https://example.com/profile2"
        }
      ]
    }
  }'
```

## 🎨 Dashboard Features

### Website Selector
- **Dropdown menu** at the top to select website
- Shows all websites with article counts
- "All Websites" option to view combined data

### Website-Specific Metrics
When you select a website, all charts and statistics update to show:
- ✅ Total articles for that website
- ✅ Total authors for that website
- ✅ Posts per day chart (for that website)
- ✅ Top authors (for that website)
- ✅ Recent articles (from that website)

## 📊 Database Structure

New columns added to `articles_with_authors` table:

| Column | Type | Purpose |
|--------|------|---------|
| `website_id` | VARCHAR(100) | Unique identifier for website |
| `website_name` | VARCHAR(255) | Display name for website |

**Unique constraint:** `(post_id, author_id, website_id)` - Ensures no duplicate article-author combinations per website

## 🔌 API Endpoints with Website Filtering

All API endpoints now accept optional `website_id` parameter:

### Get All Websites
```
GET /api/websites
```
Returns list of all websites with their statistics

**Response:**
```json
[
  {
    "website_id": "site1",
    "website_name": "Tech Blog",
    "post_count": 45,
    "author_count": 12,
    "latest_article_ts": 1710604800
  },
  {
    "website_id": "site2",
    "website_name": "Style Magazine",
    "post_count": 32,
    "author_count": 8,
    "latest_article_ts": 1710604700
  }
]
```

### Get Stats for a Website
```
GET /api/stats?website_id=site1
GET /api/stats  (returns combined stats)
```

### Get Posts Per Day for a Website
```
GET /api/posts-per-day?website_id=site1
GET /api/posts-per-day  (returns combined data)
```

### Get Top Authors for a Website
```
GET /api/top-authors?website_id=site1
GET /api/top-authors  (returns combined data)
```

### Get Recent Articles for a Website
```
GET /api/recent-articles?website_id=site1&limit=20
GET /api/recent-articles?limit=20  (returns combined data)
```

## 💾 Local Testing

### 1. Rebuild Database Schema
```bash
psql -U your_user -d your_database -f schema.sql
```

### 2. Rebuild React Dashboard
```bash
cd dashboard
npm run build
```

### 3. Push Changes to GitHub
```bash
git add .
git commit -m "Add multi-website support"
git push origin main
```

### 4. Railway Auto-Deploys
Your changes will be live within 2-3 minutes

## 🎯 Example Use Cases

### Use Case 1: Network of Blogs
```
website_id: "blog-travel"
website_name: "Travel Adventures"

website_id: "blog-food"
website_name: "Food & Recipes"

website_id: "blog-tech"
website_name: "Tech News"
```

### Use Case 2: Multi-Regional Sites
```
website_id: "us-site"
website_name: "US News"

website_id: "uk-site"
website_name: "UK News"

website_id: "au-site"
website_name: "AU News"
```

### Use Case 3: Different Content Types
```
website_id: "news"
website_name: "Breaking News"

website_id: "opinion"
website_name: "Opinion Articles"

website_id: "reviews"
website_name: "Product Reviews"
```

## 🔒 Best Practices

1. **Unique website_id**: Use a unique identifier per website (alphanumeric, no spaces)
2. **Consistent naming**: Keep `website_name` consistent across requests
3. **Include in all webhooks**: Always send `website_id` and `website_name`
4. **Monitor by website**: Check each website's analytics regularly

## 📈 Analytics Insights

After implementing multi-website support, you can:

✅ Compare performance across websites  
✅ Identify top-performing websites  
✅ Track author frequency per website  
✅ Monitor posting patterns by website  
✅ Spot content opportunities  

## 🚀 Production Deployment

After Railway deploys your changes:

1. **Verify database** has new columns
   ```sql
   \d articles_with_authors
   ```

2. **Send test webhook** from website 1
3. **Send test webhook** from website 2
4. **Open dashboard** and select websites from dropdown

## 🆘 Troubleshooting

### All articles show "Unknown Website"
- **Problem**: webhook requests missing `website_id` and `website_name`
- **Solution**: Update sending code to include these fields

### Website dropdown is empty
- **Problem**: No articles in database yet
- **Solution**: Send a test webhook first

### Can't filter by website
- **Problem**: Database schema not updated
- **Solution**: Run schema.sql again to add `website_id` column

### Old articles disappeared
- **Problem**: Database was dropped and recreated
- **Solution**: Re-send webhooks or check backup

## 📝 Webhook Payload Reminder

```json
{
  "website_id": "unique-identifier",
  "website_name": "Display Name",
  "payload": {
    "id": 123,
    "headline": "Article Title",
    "post_url": "https://website.com/article",
    "created_ts": 1710604800,
    "updated_ts": 1710604800,
    "roar_authors": [
      {
        "id": 1,
        "title": "Author Name",
        "avatar": "https://...",
        "profile_href": "https://..."
      }
    ]
  }
}
```

## Next Steps

1. ✅ Update webhook integrations to include `website_id` and `website_name`
2. ✅ Deploy to Railway
3. ✅ Send test webhooks from multiple websites
4. ✅ View website-specific analytics in dashboard
5. ✅ Monitor and optimize by website!

---

**Questions?** Check the API endpoints or contact support!
