# 🌐 Auto-Detect Websites from URL

Your webhook now automatically detects which website an article belongs to **from the post URL**!

## How It Works

### Automatic Website Detection

The system now extracts the domain from `post_url` and uses it as the `website_id`:

**Example 1:**
```json
{
  "payload": {
    "id": 1,
    "post_url": "https://techblog.com/article-title",
    ...
  }
}
```
→ Automatically detected as: `website_id: "techblog.com"`, `website_name: "Techblog"`

**Example 2:**
```json
{
  "payload": {
    "id": 2,
    "post_url": "https://www.stylemagazine.com/article-title",
    ...
  }
}
```
→ Automatically detected as: `website_id: "stylemagazine.com"`, `website_name: "Stylemagazine"`

## No More Manual Website ID!

You **don't need** to send `website_id` and `website_name` anymore. They're extracted automatically!

### Simple Webhook (Now Sufficient)
```bash
curl -X POST https://your-railway-url/webhook \
  -H "Content-Type: application/json" \
  -u admin:password \
  -d '{
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

## Priority System

The system uses this priority for website identification:

1. **Explicit fields** - If you provide `website_id` and `website_name` in payload, use them
2. **URL extraction** - Extract domain from `post_url` (e.g., "techblog.com")
3. **Domain mapping** - Look up friendly name (see configuration below)
4. **Fallback** - Use "default"/"Unknown Website"

## Domain Mapping (Optional)

You can map domains to friendly names via environment variable.

### Setup Domain Mapping

Set this environment variable in Railway:

```
WEBSITE_MAPPING={"techblog.com":"Tech News","stylemagazine.com":"Style Magazine","foodblog.org":"Recipes & Food"}
```

Example:
- `techblog.com` → displays as "Tech News"
- `stylemagazine.com` → displays as "Style Magazine"  
- `foodblog.org` → displays as "Recipes & Food"

### Without Mapping

If no mapping is configured, domain names are auto-formatted:
- `techblog.com` → "Techblog"
- `style-magazine.com` → "Style Magazine"
- `food.blog.org` → "Food"

## Examples

### Example 1: Tech & Style Blogs

**Tech Blog webhook** (no explicit website_id needed):
```json
{
  "payload": {
    "id": 100,
    "headline": "React Tips",
    "post_url": "https://techblog.com/react-tips",
    "created_ts": 1710604800,
    "roar_authors": [{"id": 1, "title": "Alice"}]
  }
}
```
→ Auto-detected: `website_id: "techblog.com"`, `website_name: "Techblog"`

**Style Blog webhook** (different URL):
```json
{
  "payload": {
    "id": 101,
    "headline": "Spring Fashion",
    "post_url": "https://stylemagazine.com/spring-fashion",
    "created_ts": 1710604800,
    "roar_authors": [{"id": 2, "title": "Bob"}]
  }
}
```
→ Auto-detected: `website_id: "stylemagazine.com"`, `website_name: "Stylemagazine"`

### Example 2: Multi-Regional Sites

**US News Site:**
```json
{
  "payload": {
    "id": 200,
    "post_url": "https://news-us.com/story",
    ...
  }
}
```
→ `website_id: "news-us.com"`

**UK News Site:**
```json
{
  "payload": {
    "id": 201,
    "post_url": "https://news-uk.com/story",
    ...
  }
}
```
→ `website_id: "news-uk.com"`

### Example 3: Explicit Override (Still Supported)

If you want to override automatic detection:
```json
{
  "website_id": "custom_id",
  "website_name": "My Custom Name",
  "payload": {
    "id": 300,
    "post_url": "https://techblog.com/article",
    ...
  }
}
```
→ Uses: `website_id: "custom_id"`, `website_name: "My Custom Name"`

## Dashboard Feature

In the React dashboard:
- The **Website Selector** dropdown automatically lists all detected websites
- Each website shows post count and author count
- Click a website to filter all charts and statistics
- "All Websites" shows combined data

## Environment Variable Reference

### WEBSITE_MAPPING (Optional)
**Format:** JSON string mapping domains to display names

```
WEBSITE_MAPPING={"domain1.com":"Display Name 1","domain2.org":"Display Name 2"}
```

**Example:**
```
WEBSITE_MAPPING={"techblog.com":"Technology News","stylemagazine.com":"Fashion & Style","foodblog.org":"Recipes"}
```

## API Endpoints Still Support Filtering

All API endpoints work with the auto-detected `website_id`:

```
GET /api/websites                      # List all detected websites
GET /api/stats?website_id=techblog.com # Stats for techblog.com
GET /api/posts-per-day?website_id=techblog.com
GET /api/top-authors?website_id=techblog.com
GET /api/recent-articles?website_id=techblog.com
```

## Setup Instructions

### 1. No Change Needed to Webhooks!

Your existing webhooks should work as-is. Just send articles with `post_url`:

```bash
curl -X POST https://your-url/webhook \
  -u admin:password \
  -d '{
    "payload": {
      "id": 123,
      "headline": "My Article",
      "post_url": "https://yoursite.com/article",
      "created_ts": 1710604800,
      "roar_authors": [...]
    }
  }'
```

### 2. Optional: Configure Website Names

In Railway, add this environment variable:

```
WEBSITE_MAPPING={"yoursite.com":"Your Site Name","othersite.com":"Other Site"}
```

### 3. Deploy

The changes are already deployed to Railway! Just redeploy if you add `WEBSITE_MAPPING`:

1. Go to railway.app
2. Project → Web Service → Variables
3. Add/update `WEBSITE_MAPPING`
4. Railway auto-restarts

### 4. View in Dashboard

Open your dashboard and you'll see:
- All websites auto-detected from URLs
- Website selector dropdown
- Separate analytics per site

## Benefits

✅ **No manual setup** - Just send `post_url`, websites auto-detected  
✅ **Multiple websites** - Support unlimited websites from one webhook  
✅ **Flexible naming** - Configure friendly names via environment variable  
✅ **Dashboard filtering** - Select website to view specific analytics  
✅ **Backwards compatible** - Still supports explicit `website_id` if provided  

## Common Questions

**Q: Do I need to change my webhook payloads?**  
A: No! Just make sure you include `post_url`. Website is auto-detected.

**Q: What if two websites have the same domain?**  
A: Use explicit `website_id` in the payload to differentiate them.

**Q: Can I see all websites in the dashboard?**  
A: Yes! Open the website dropdown to see all auto-detected websites.

**Q: What if post_url is missing?**  
A: Falls back to "default" website. Try to always include `post_url`.

## Troubleshooting

**Articles show "Unknown Website"**
- `post_url` is missing or invalid
- Make sure each webhook includes a valid `post_url`

**Display name isn't formatted correctly**
- Add the domain to `WEBSITE_MAPPING` environment variable
- Example: `{"techblog.com":"Tech News"}`

**Can't see website in dropdown**
- No articles from that website yet
- Send a test webhook with that website's URL

---

**Everything is automatic now!** Just send `post_url` in your webhooks. 🚀
