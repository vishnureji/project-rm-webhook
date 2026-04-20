# Multi-Website GA4 Configuration Quick Reference

For dashboards tracking **multiple websites**, map each website to its own Google Analytics 4 property.

---

## **Quick Setup**

### **1. Get All Property IDs**

For each website, go to Google Analytics → Admin → Property details and copy the Property ID.

Example:
- Website 1: `website-1.com` → Property ID: `123456789`
- Website 2: `website-2.com` → Property ID: `987654321`
- Website 3: `blog.example.com` → Property ID: `456789123`

### **2. Create Properties Mapping**

Format: `{"website-id": "property-id", ...}`

Example:
```json
{
  "website-1.com": "123456789",
  "website-2.com": "987654321",
  "blog.example.com": "456789123"
}
```

### **3. Set Environment Variables**

**Option A: As JSON string (Recommended for Railway/Docker)**

```bash
export GA_PROPERTIES_MAPPING='{"website-1.com":"123456789","website-2.com":"987654321"}'
export GOOGLE_ANALYTICS_CREDENTIALS='{"type":"service_account",...}'
```

**Option B: Single property (legacy - all websites use same GA property)**

```bash
export GOOGLE_ANALYTICS_PROPERTY_ID=123456789
export GOOGLE_ANALYTICS_CREDENTIALS=/path/to/service-account-key.json
```

### **4. Grant Service Account Access**

For **each GA4 property**:

1. Go to Google Analytics
2. Select property
3. Click **Admin** → **Account Access Management**
4. Click **"+"** → Paste service account email
5. Give **"Editor"** permissions
6. Repeat for all properties

### **5. Verify Setup**

```bash
curl http://localhost:8000/api/ga-properties
```

Should show all configured properties:

```json
{
  "properties": [
    {"website_id": "website-1.com", "property_id": "123456789"},
    {"website_id": "website-2.com", "property_id": "987654321"}
  ],
  "total": 2,
  "has_ga_configured": true
}
```

---

## **How It Works**

1. **Dashboard**: User selects a website from the website selector
2. **Frontend**: Sends `website_id` with GA metrics request
3. **Backend**: 
   - Looks up property ID from `GA_PROPERTIES_MAPPING`
   - Fetches metrics from that specific GA4 property
4. **Result**: Shows metrics for that website only

---

## **API Examples**

### **Fetch GA metrics for a specific website**

```bash
curl "http://localhost:8000/api/ga-metrics?website_id=website-1.com&start_date=2024-01-01&end_date=2024-01-31"
```

### **Get all configured properties**

```bash
curl http://localhost:8000/api/ga-properties
```

### **Compare metrics with previous period**

```bash
curl "http://localhost:8000/api/ga-comparison?website_id=website-1.com&previous_period=true"
```

---

## **Troubleshooting**

| Issue | Solution |
|-------|----------|
| "property not configured for website X" | Add website to `GA_PROPERTIES_MAPPING` |
| Only one website shows data | Verify all websites in mapping, restart server |
| Service account permission denied | Add service account to ALL GA4 properties |
| No data shows for any website | Verify `GOOGLE_ANALYTICS_CREDENTIALS` is set |
| Mapping not loading | Check JSON format is valid, restart server |

---

## **Testing Multi-Property Setup**

### **Test 1: Verify Properties are Loaded**

```bash
curl http://localhost:8000/api/ga-properties
```

Look for: `"total": 2` (or however many properties you configured)

### **Test 2: Fetch Metrics for Website 1**

```bash
curl "http://localhost:8000/api/ga-metrics?website_id=website-1.com"
```

Should return metrics for website-1.com's property

### **Test 3: Fetch Metrics for Website 2**

```bash
curl "http://localhost:8000/api/ga-metrics?website_id=website-2.com"
```

Should return metrics for website-2.com's property

### **Test 4: Check Dashboard**

1. Open dashboard
2. Click website selector
3. Select a website
4. Should see GA metrics for that website only

---

## **Common Configuration Mistakes**

❌ **Wrong:** Different website_id in database vs mapping

```bash
# Database has "site1" but mapping has "website-1.com"
GA_PROPERTIES_MAPPING='{"website-1.com":"123456789"}'
```

✅ **Correct:** Website IDs must match

```bash
GA_PROPERTIES_MAPPING='{"site1":"123456789"}'
```

---

❌ **Wrong:** Missing quotes in JSON string

```bash
GA_PROPERTIES_MAPPING={site1:123456789}  # Invalid JSON
```

✅ **Correct:** Proper JSON format

```bash
GA_PROPERTIES_MAPPING='{"site1":"123456789"}'
```

---

❌ **Wrong:** Property not added to service account access

Service account created but not added to GA4 Admin → Account Access Management

✅ **Correct:** Service account has Editor role on all GA4 properties

---

## **Reference**

- Full guide: [GA4_INTEGRATION_SETUP.md](./GA4_INTEGRATION_SETUP.md)
- API endpoint docs: See "API Endpoints" in full guide
- Google Cloud docs: [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
