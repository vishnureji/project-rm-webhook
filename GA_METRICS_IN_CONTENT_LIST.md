# Google Analytics Metrics in Recent Content List

## Changes Made

### 1. **ArticleRow Component** (`dashboard/src/components/dashboard/ArticleRow.jsx`)
   - ✅ Added 3 new GA metrics columns:
     - **Unique Visitors** - Shows user count with 👥 icon (blue)
     - **Page Views** - Shows page view count with 👁️ icon (gold)
     - **Avg Duration** - Shows average session duration with ⏱️ icon (red)
   - ✅ Added `gaMetrics` prop to receive GA data
   - ✅ Added styling for GA metric cells with icons and formatting
   - ✅ Duration formatted as "Xm Ys" (e.g., "2m 15s")

### 2. **App.jsx** (`dashboard/src/App.jsx`)
   - ✅ Updated table headers to include 3 new GA columns
   - ✅ Pass `gaMetrics` prop to each `ArticleRow` component
   - ✅ Added styling for GA header cells
   - ✅ Headers labeled: "Unique Visitors", "Page Views", "Avg Duration"

### 3. **Environment Configuration** (`.env`)
   - ✅ Cleaned up `GA_PROPERTIES_MAPPING` (removed extra quotes)
   - ✅ Ready for Railway deployment

---

## What You See Now

### Recent Content Table Layout:

```
┌─────────────┬────────┬──────────┬──────┬─────────────┬──────────────┬────────────┬─────────────┬────────┐
│ Title       │ Author │ Platform │ Date │ Performance │ Unique Vis.  │ Page Views │ Avg Duration│ Action │
├─────────────┼────────┼──────────┼──────┼─────────────┼──────────────┼────────────┼─────────────┼────────┤
│ Article 1   │ John   │ Website1 │ Jan1 │ High        │ 👥 1,234     │ 👁️ 5,678   │ ⏱️ 2m 30s   │ View   │
│ Article 2   │ Jane   │ Website2 │ Jan2 │ Medium      │ 👥 876       │ 👁️ 3,456   │ ⏱️ 1m 45s   │ View   │
│ Article 3   │ Bob    │ Website1 │ Jan3 │ Low         │ 👥 543       │ 👁️ 2,100   │ ⏱️ 58s      │ View   │
└─────────────┴────────┴──────────┴──────┴─────────────┴──────────────┴────────────┴─────────────┴────────┘
```

---

## How GA Metrics Are Displayed

- **Unique Visitors**: Total users for the selected website (period: filtered by date range)
- **Page Views**: Total pages viewed for the selected website
- **Avg Duration**: Average time users spend on the website

**Note:** These are website-level metrics, so all articles in the same website show the same GA metrics.

---

## Deployment to Railway

### Step 1: Prepare Google Analytics Credentials

1. Download your `service-account-key.json` from Google Cloud
2. Open the file and copy its entire content
3. Convert to single-line string (remove all newlines and extra spaces)

### Step 2: Set Railway Environment Variables

Go to Railway Dashboard → Your Project → Variables:

**Variable 1: GOOGLE_ANALYTICS_CREDENTIALS**
```
Key: GOOGLE_ANALYTICS_CREDENTIALS
Value: {"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Variable 2: GA_PROPERTIES_MAPPING** (if not already set)
```
Key: GA_PROPERTIES_MAPPING
Value: {"easterneye.biz":"152893548"}
```

For multiple websites:
```
{"easterneye.biz":"152893548","asianhospitality.com":"123456789","asiantrader.biz":"987654321"}
```

### Step 3: Deploy

1. Click **Deploy** in Railway
2. Wait for deployment to complete
3. Check **Logs** for:
   ```
   Loaded GA properties mapping for 1 website(s)
   Google Analytics 4 client initialized successfully
   ```

### Step 4: Verify

1. Open your dashboard
2. Select a website from the website selector
3. Look at the "Recent Content" section
4. You should see GA metrics (Unique Visitors, Page Views, Avg Duration) in each row

---

## Color Coding

| Icon | Metric | Color |
|------|--------|-------|
| 👥 | Unique Visitors | Blue (#4285f4) |
| 👁️ | Page Views | Gold (#fbbc04) |
| ⏱️ | Avg Duration | Red (#ea4335) |

---

## Testing Locally (Optional)

### Create Local Credentials File

1. Create `credentials/` folder:
```bash
mkdir credentials
```

2. Place your `service-account-key.json` file there

3. Update `.env`:
```bash
GOOGLE_ANALYTICS_CREDENTIALS=credentials/service-account-key.json
```

4. Start the webhook server:
```bash
python webhook.py
```

5. Start the dashboard:
```bash
cd dashboard
npm install
npm run dev
```

6. Open http://localhost:5173
7. Select a website and check Recent Content list for GA metrics

---

## API Integration

The metrics flow:
1. **Frontend** requests GA metrics: `/api/ga-metrics?website_id=easterneye.biz`
2. **Backend** looks up property ID from `GA_PROPERTIES_MAPPING`
3. **Backend** fetches from GA4: unique users, page views, avg duration
4. **Frontend** passes `gaMetrics` to each `ArticleRow`
5. **ArticleRow** displays metrics with icons in the table

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| GA metrics show "—" | GA credentials not configured or API call failed |
| Table looks misaligned | Browser cache issue - hard refresh (Ctrl+Shift+R) |
| Metrics don't update | Check GA dashboard has data for the selected website |
| "property not configured" error | Ensure `GA_PROPERTIES_MAPPING` has correct website ID and property ID |

---

## Files Modified

✅ `dashboard/src/components/dashboard/ArticleRow.jsx` - Added GA metrics columns
✅ `dashboard/src/App.jsx` - Pass GA metrics and update table headers
✅ `.env` - Cleaned up GA configuration
✅ `.gitignore` - Already has credentials folder ignored

---

## Next Steps

1. ✅ Deploy to Railway with GA credentials
2. ✅ Verify GA metrics appear in Recent Content list
3. ✅ Add more websites to `GA_PROPERTIES_MAPPING` as needed
4. ✅ Monitor dashboard for data accuracy
