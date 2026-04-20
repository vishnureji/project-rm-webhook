# GA4 Data Validation Guide

This guide provides steps to validate Google Analytics 4 data at both **page level** and **website level** in your dashboard.

---

## 1. WEBSITE-LEVEL DATA VALIDATION

### A. Dashboard UI Validation
1. **Open the Dashboard**
   - Navigate to your dashboard at: `https://your-domain.railway.app`
   - Select a website from the "Website" dropdown

2. **Check Website-Level Metrics**
   - Look for the **GoogleAnalyticsCard** section
   - Verify these metrics are displayed:
     - **Unique Visitors**: Active users on the entire website
     - **Page Views**: Total screen page views across all pages
     - **Avg Duration**: Average session duration in seconds

3. **Expected Behavior**
   - Metrics should show numbers (not "—" or "...")
   - Numbers should be formatted with thousands separators (e.g., "1,234")
   - Duration should be in human-readable format (e.g., "2m 30s")

### B. API-Level Validation (Website Metrics)
1. **Call the Website Metrics API**
   ```bash
   curl "http://localhost:8000/api/ga-metrics?website_id=easterneye.biz&start_date=2026-04-01&end_date=2026-04-20"
   ```

2. **Expected Response Format**
   ```json
   {
     "metrics": {
       "users": 1500,
       "page_views": 3000,
       "avg_duration": 185.5
     }
   }
   ```

3. **Validation Checklist**
   - ✅ Response status is `200 OK`
   - ✅ `metrics` object contains all three fields
   - ✅ Values are numbers (not null or error strings)
   - ✅ `users` ≤ `page_views` (users can't exceed page views)

### C. GA4 Dashboard Direct Validation
1. **Go to GA4 Property Dashboard**
   - Visit: `https://analytics.google.com`
   - Select your property (e.g., "Eastern Eye")

2. **Check Reports → Engagement**
   - Verify **Engaged sessions (engaged sessions count)** matches approximate visitor count
   - Check **Average session duration** to compare with API values

3. **Cross-Reference Date Range**
   - Ensure the same date range is selected in both GA4 and your dashboard

---

## 2. PAGE-LEVEL DATA VALIDATION

### A. Dashboard UI Validation (Recent Content Table)
1. **Open the Dashboard**
   - Scroll down to **Recent Content** table
   - Ensure articles are displayed with URLs

2. **Check Page Metrics Per Article**
   - **Title**: Article headline
   - **Author**: Article author name
   - **Platform**: Website name
   - **Date**: Publication date
   - **Unique Visitors**: Page-specific visitor count (blue icon 👤)
   - **Page Views**: Page-specific view count (gold icon 👁)
   - **Avg Duration**: Average session duration on that page (red icon ⏱)

3. **Expected Behavior for Each Article**
   - Each article should show **different metrics** (not all the same)
   - Higher-traffic articles should show more visitors
   - Loading state shows "..." while fetching
   - If no GA data exists, shows "—"

### B. Manual Testing Steps
1. **Test with 2-3 Articles from the Table**
   
   **Article 1: "Word of mouth drives more Asian visitors to National Trust"**
   - URL: `https://www.easterneye.biz/wightwick-national-trust-british-asians/`
   - Expected path extraction: `/wightwick-national-trust-british-asians/`
   - Expected: Higher visitor count (popular article)

   **Article 2: "Economy risks recession as Iran war threatens 250,000 job losses"**
   - URL: `https://www.easterneye.biz/economy-risks-recession-as-iran-war-threatens-250000-job-losses/`
   - Expected path extraction: `/economy-risks-recession-as-iran-war-threatens-250000-job-losses/`
   - Compare metrics with Article 1 - should be different

2. **Verify Metric Differences**
   - Open browser DevTools (F12 → Console)
   - Watch for logs showing path extraction for each article
   - Each article should have different visitor/view counts

### C. API-Level Validation (Page Metrics)
1. **Identify Page Path**
   - Article URL: `https://www.easterneye.biz/my-article-slug/`
   - Extract path: `/my-article-slug/`

2. **Call the Page Metrics API**
   ```bash
   curl "http://localhost:8000/api/ga-page-metrics?page_path=/wightwick-national-trust-british-asians/&website_id=easterneye.biz&start_date=2026-04-01&end_date=2026-04-20"
   ```

3. **Expected Response Format**
   ```json
   {
     "start_date": "2026-04-01",
     "end_date": "2026-04-20",
     "page_path": "/wightwick-national-trust-british-asians/",
     "website_id": "easterneye.biz",
     "metrics": {
       "users": 250,
       "page_views": 450,
       "avg_duration": 145.75,
       "property_id": "152893548",
       "website_id": "easterneye.biz"
     }
   }
   ```

4. **Validation Checklist**
   - ✅ Response status is `200 OK`
   - ✅ `page_path` matches the requested path exactly
   - ✅ `metrics` contains all fields with numeric values
   - ✅ `users` ≤ `page_views` (logical relationship)
   - ✅ `avg_duration` is in seconds (typically 0-600)

### D. GA4 Dashboard Page-Level Validation
1. **Create a Custom Report in GA4**
   - Go to GA4 → Reports → Explore
   - Add **Page Path** as dimension
   - Add metrics: **Active Users**, **Screenpageviews**, **Average Session Duration**
   - Filter for your domain

2. **Find Your Article Path in Results**
   - Search for `/wightwick-national-trust-british-asians/`
   - Compare metrics with API response
   - Should match exactly (within 1-2 second rounding for duration)

3. **Date Range Consistency**
   - Verify same date range in GA4 and your API call

---

## 3. TROUBLESHOOTING VALIDATION ISSUES

### Issue: Page Metrics Show "—" (No Data)
**Possible Causes:**
1. **GA4 hasn't tracked the page yet**
   - Solution: Check GA4 dashboard for the page path - if not present, data will take 24-48 hours to appear
   
2. **Page path doesn't match GA4 format**
   - Check: Is the URL trailing slash consistent? (`/slug/` vs `/slug`)
   - Solution: Verify URL format in GA4 reports

3. **Credentials issue (401 error in backend logs)**
   - Check: Backend logs for "cannot import name 'StringFilter'" error
   - Solution: Ensure credentials are valid in Railway environment variable

### Issue: All Articles Show Same Metrics
**Possible Causes:**
1. **Still using website-level metrics instead of page-level**
   - Solution: Check ArticleRow component is calling `getGAPageMetrics`, not website metrics
   
2. **Page path extraction failing**
   - Solution: Check browser console for path extraction logs
   - Verify URL format includes leading slash: `/slug/`

### Issue: Slow Loading (Metrics Take >5 seconds)
**Possible Causes:**
1. **Network latency to Railway**
   - Check: Network tab in DevTools for slow requests
   
2. **GA4 API rate limiting**
   - Solution: Add caching layer or request batching (future optimization)

3. **Too many concurrent requests**
   - Solution: React.memo now prevents unnecessary re-renders

---

## 4. DATA VALIDATION CHECKLIST

### Daily Validation
- [ ] Dashboard loads without errors
- [ ] Website-level metrics display numbers
- [ ] Recent Content table shows page-level metrics
- [ ] Each article has different metric values
- [ ] No "—" symbols for recent articles (should have GA data)
- [ ] Duration format is human-readable (e.g., "2m 30s")

### Weekly Validation
- [ ] Compare dashboard metrics with GA4 dashboard
- [ ] Verify trending - high-traffic articles show higher numbers
- [ ] Test API endpoints with `curl` commands
- [ ] Check Railway logs for errors

### API Validation
- [ ] Website metrics API returns 200 status
- [ ] Page metrics API returns 200 status for known pages
- [ ] Response JSON structure matches expected format
- [ ] No "error" field in metrics response
- [ ] Metrics follow logical relationships (users ≤ page_views)

---

## 5. PERFORMANCE VALIDATION

### Dashboard Load Time
- Initial load: **< 3 seconds**
- Metrics fetch per article: **< 1 second**
- Page transition: **Immediate** (due to React.memo optimization)

### Database Validation
- Recent articles query: **< 500ms**
- Website list query: **< 100ms**

### GA4 API Response Time
- Website metrics: **< 2 seconds**
- Page metrics: **< 2 seconds each**

---

## 6. DATA CONSISTENCY ACROSS ENVIRONMENTS

### Local Development vs Production
```bash
# Local
curl "http://localhost:8000/api/ga-page-metrics?page_path=/article/&website_id=easterneye.biz&start_date=2026-04-01&end_date=2026-04-20"

# Production (Railway)
curl "https://your-railway-domain/api/ga-page-metrics?page_path=/article/&website_id=easterneye.biz&start_date=2026-04-01&end_date=2026-04-20"
```

Both should return identical metrics (within seconds for rounding differences).

---

## 7. QUICK REFERENCE: VALIDATION ENDPOINTS

### Website-Level Metrics
```
GET /api/ga-metrics
Query params: website_id, start_date, end_date
Example: /api/ga-metrics?website_id=easterneye.biz&start_date=2026-04-01&end_date=2026-04-20
```

### Page-Level Metrics
```
GET /api/ga-page-metrics
Query params: page_path, website_id, start_date, end_date
Example: /api/ga-page-metrics?page_path=/article-slug/&website_id=easterneye.biz&start_date=2026-04-01&end_date=2026-04-20
```

### Website Properties Configuration
```
GET /api/ga-properties
Returns: List of configured website → GA4 property mappings
```

---

## 8. SUCCESS INDICATORS

✅ **Data is validated when:**
- Dashboard metrics match GA4 dashboard (within 1-2% variance)
- Page-level metrics differ between articles
- API returns 200 status with numeric values
- No errors in backend logs
- Load time is < 3 seconds total
- Articles show real GA4 data (not "—" or placeholder values)

---

**Last Updated:** April 20, 2026  
**Dashboard Version:** 1.0.0 (GA4 Integration)
