# Google Analytics Integration Guide

This guide walks you through integrating Google Analytics 4 (GA4) with your Webhook Dashboard to display Unique Visitors, Page Views, and Average Session Duration metrics.

---

## **What You'll Get**

Once configured, your dashboard will display:
- **Unique Visitors**: Total number of individual users who visited your site
- **Page Views**: Total number of pages viewed during the period
- **Average Session Duration**: Average time users spend on your site (in seconds/minutes)
- **Trend Comparisons**: Compare metrics between current and previous periods

---

## **Prerequisites**

- Google Cloud Project (free to create)
- Google Analytics 4 property set up for your website
- Access to Google Cloud Console
- Your website's GA4 Property ID

---

## **Step 1: Create a Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google Account
3. Click the **project dropdown** (top-left) → **NEW PROJECT**
4. Enter project name: `webhook-analytics`
5. Click **CREATE**
6. Wait for the project to be created, then select it

---

## **Step 2: Enable Google Analytics Data API**

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Google Analytics Data API v1"**
3. Click on it and press **ENABLE**
4. Wait for it to finish (should show "API enabled" in blue)

---

## **Step 3: Create a Service Account**

1. Go to **APIs & Services** → **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS** → **Service Account**
3. Fill in:
   - **Service account name**: `webhook-analytics`
   - **Service account ID**: (auto-filled, keep as is)
   - **Description**: `Analytics service for webhook dashboard`
4. Click **CREATE AND CONTINUE**
5. Click **CONTINUE** (skip optional steps)
6. Click **DONE**

---

## **Step 4: Create and Download Service Account Key**

1. Go to **APIs & Services** → **Credentials**
2. Under "Service Accounts", click on **`webhook-analytics`**
3. Go to the **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Select **"JSON"** and click **"Create"**
6. A JSON file downloads automatically
7. **IMPORTANT**: Keep this file safe! It contains sensitive credentials.

**Example structure of the JSON key:**
```json
{
  "type": "service_account",
  "project_id": "webhook-analytics-123456",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "webhook-analytics@webhook-analytics-123456.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

---

## **Step 5: Get Your Google Analytics Property ID**

### **If you already have GA4 set up:**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your website property
3. Click **Admin** (bottom-left gear icon)
4. Click **"Property details"** (left column)
5. Copy your **Property ID** (looks like: `123456789`)

### **If you DON'T have GA4 set up:**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **"Create"** (or **"Start measuring"**)
3. Enter your **Account name** (company/site name)
4. Click **"Next"** → Enter **Property name** (website name)
5. Select timezone, currency, industry
6. Click **"Create"** → Select platform: **"Web"**
7. Enter **Website name** and **Website URL**
8. Click **"Create"**
9. Your **Property ID** will be displayed on the next screen

---

## **Step 6: Grant Service Account Access to GA4**

1. In Google Analytics, go to **Admin** (gear icon) → **Account Access Management**
2. Click **"+"** to add a new member
3. Paste the **Service Account Email** (from the JSON file):
   - Format: `webhook-analytics@YOUR-PROJECT-ID.iam.gserviceaccount.com`
4. Give it **"Editor"** or **"Analyst"** permissions
5. Click **"Add"**

---

## **Step 7: Configure Environment Variables**

You have two options:

### **Option A: Using JSON File Path (Recommended for local development)**

1. Save the downloaded JSON file to your project or a secure location
2. Set environment variables:

```bash
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_ANALYTICS_CREDENTIALS=/path/to/service-account-key.json
```

### **Option B: Using JSON as String (Better for production/Railway)**

1. Convert the JSON file to a single-line string
2. Set environment variables:

```bash
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_ANALYTICS_CREDENTIALS='{"type":"service_account","project_id":"webhook-analytics-123456","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"webhook-analytics@webhook-analytics-123456.iam.gserviceaccount.com",...}'
```

### **For Railway Deployment:**

1. Go to your Railway project
2. Click **"Variables"** (or **"Environment"**)
3. Add these variables:
   - `GOOGLE_ANALYTICS_PROPERTY_ID` = `123456789`
   - `GOOGLE_ANALYTICS_CREDENTIALS` = (paste the entire JSON as a string)

---

## **Step 7b: Configure Multiple GA4 Properties (Multi-Website Setup)**

If your dashboard tracks **multiple websites**, you need to map each website to its own GA4 property.

### **Setup Process:**

1. **Get Property IDs for each website:**
   - Go to [Google Analytics](https://analytics.google.com/)
   - For each website, navigate to **Admin** → **Property details**
   - Copy the **Property ID** for each

2. **Create a properties mapping JSON:**

```json
{
  "website-domain-1.com": "123456789",
  "website-domain-2.com": "987654321",
  "example-site": "456789123"
}
```

- Keys: Use your website IDs (matching `website_id` in your database)
- Values: The corresponding GA4 Property IDs

3. **Set Environment Variables:**

#### **Option A: Using JSON String (Recommended)**

```bash
GA_PROPERTIES_MAPPING='{"website-domain-1.com":"123456789","website-domain-2.com":"987654321","example-site":"456789123"}'
GOOGLE_ANALYTICS_CREDENTIALS='{"type":"service_account",...}'
```

#### **Option B: Using JSON File**

Save the mapping to a file (e.g., `ga-properties.json`):

```json
{
  "website-domain-1.com": "123456789",
  "website-domain-2.com": "987654321"
}
```

Then reference it:

```bash
GA_PROPERTIES_MAPPING_FILE=/path/to/ga-properties.json
GOOGLE_ANALYTICS_CREDENTIALS=/path/to/service-account-key.json
```

#### **For Railway Deployment:**

1. Go to your Railway project → **Variables**
2. Add:
   - `GA_PROPERTIES_MAPPING` = `{"website-1.com":"123456789","website-2.com":"987654321"}`
   - `GOOGLE_ANALYTICS_CREDENTIALS` = (JSON string)

### **Verifying Multi-Property Setup:**

1. Start your server
2. Check the logs for:
   ```
   Loaded GA properties mapping for X website(s)
   ```

3. Call the API endpoint to verify:
   ```bash
   curl http://localhost:8000/api/ga-properties
   ```
   
   You should see:
   ```json
   {
     "properties": [
       {
         "website_id": "website-1.com",
         "website_name": "Website 1",
         "property_id": "123456789"
       },
       {
         "website_id": "website-2.com",
         "website_name": "Website 2",
         "property_id": "987654321"
       }
     ],
     "total": 2,
     "has_ga_configured": true
   }
   ```

### **Grant Service Account Access to ALL GA4 Properties**

⚠️ **Important:** The service account needs access to each GA4 property.

For **each website's GA4 property**:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select the property
3. Click **Admin** → **Account Access Management**
4. Click **"+"** to add a new member
5. Paste the service account email
6. Give it **"Editor"** permissions
7. Click **"Add"**

**Repeat this for ALL your GA4 properties.**

---

## **How Multi-Property Works**

When you select a website in the dashboard:

1. Dashboard sends `website_id` to the backend
2. Backend looks up the GA4 property ID from `GA_PROPERTIES_MAPPING`
3. Metrics are fetched from that specific GA4 property
4. Results shown only for that website

**Example flow:**
- User selects "website-domain-1.com" in dashboard
- Dashboard requests: `/api/ga-metrics?website_id=website-domain-1.com&start_date=2024-01-01&end_date=2024-01-31`
- Backend looks up: `GA_PROPERTIES_MAPPING["website-domain-1.com"]` → `"123456789"`
- Fetches metrics from GA4 property `123456789`
- Returns metrics for that specific website only

---

## **Step 8: Verify the Integration**

1. Start your webhook server:
   ```bash
   python webhook.py
   ```

2. Open your dashboard at `http://localhost:3000` (or your deployment URL)

3. Look for the **"Google Analytics Insights"** section with three metric cards:
   - Unique Visitors (with user icon)
   - Page Views (with eye icon)
   - Avg. Duration (with clock icon)

4. If you see data, the integration is working! ✅

5. If you see errors:
   - Check that `GOOGLE_ANALYTICS_PROPERTY_ID` and `GOOGLE_ANALYTICS_CREDENTIALS` are set
   - Verify the service account has Editor access to your GA4 property
   - Check server logs for detailed error messages

---

## **Understanding the Metrics**

### **Unique Visitors (Users)**
- **What it measures**: Number of individual people who visited your site
- **Good for**: Understanding audience size and growth
- **Note**: GA4 counts unique users based on cookies and user ID

### **Page Views**
- **What it measures**: Total number of times any page was viewed
- **Good for**: Measuring content consumption and engagement
- **Note**: Includes repeat visits by the same user

### **Average Session Duration**
- **What it measures**: Average time a user spends in a single session
- **Units**: Seconds (displayed as "Xm Ys" in the dashboard)
- **Good for**: Understanding user engagement and content quality
- **Note**: Longer duration usually means more engaged users

### **Trend Comparison**
- Shows percentage change from the previous period
- **Green ↑**: Positive trend (metric increased)
- **Red ↓**: Negative trend (metric decreased)
- Helps identify momentum and patterns

---

## **Troubleshooting**

### **No data showing**

1. **Check credentials are set**:
   - Ensure `GOOGLE_ANALYTICS_PROPERTY_ID` and `GOOGLE_ANALYTICS_CREDENTIALS` environment variables are configured
   - Restart the server after setting environment variables

2. **Verify service account permissions**:
   - Go to GA4 Admin → Account Access Management
   - Confirm service account has Editor/Analyst role
   - Wait a few minutes for permissions to propagate

3. **Check GA4 data collection**:
   - Go to GA4 Admin → Property details → Data streams
   - Ensure your website URL is in the data stream
   - Verify tracking is active (check your website for the GA4 tag)

4. **Review server logs**:
   - Look for error messages like "Failed to initialize GA4 client"
   - Check that the JSON key format is correct

### **"Google Analytics not configured" message**

- This means the credentials weren't loaded successfully
- Verify the JSON format if using the string approach
- Check file path if using file-based approach

### **"Google Analytics property not configured for website: X"**

- The website ID doesn't exist in `GA_PROPERTIES_MAPPING`
- Verify the website ID matches what's in your database
- Add the missing website to `GA_PROPERTIES_MAPPING`
- Example: Add `"website-x.com": "123456789"` to the mapping

### **Connection timeout errors**

- Ensure your server can reach Google's API servers
- Check firewall/network settings if running locally
- Verify internet connection is stable

### **Multi-Property Setup Issues**

**Symptom:** Only one website shows GA data, others show "not configured"

**Solution:**
1. Verify all websites have entries in `GA_PROPERTIES_MAPPING`
2. Check that each property ID is correct:
   ```bash
   curl http://localhost:8000/api/ga-properties
   ```
3. Ensure the service account has Editor access to ALL GA4 properties
4. Check logs for initialization messages:
   ```
   Loaded GA properties mapping for X website(s)
   ```

**Symptom:** "property not configured" error for all websites

**Solution:**
1. Verify `GA_PROPERTIES_MAPPING` environment variable is set correctly
2. Check JSON format is valid (use an online JSON validator)
3. Restart the server after setting environment variables
4. Check server logs for detailed error messages

**Symptom:** Service account doesn't have access to all properties

**Solution:**
- For **each GA4 property**, go to Admin → Account Access Management
- Add the service account email with Editor permissions
- Wait 5-10 minutes for permissions to propagate
- Test with `/api/ga-properties` endpoint

---

## **API Endpoints**

Your backend now exposes these endpoints for GA metrics:

### **Get Current Metrics (Single Website)**
```
GET /api/ga-metrics?website_id=website-domain.com&start_date=2024-01-01&end_date=2024-01-31
```

**Query Parameters:**
- `website_id` (optional): Website ID to fetch metrics for. If not provided, uses default property.
- `start_date` (optional): Start date in YYYY-MM-DD format (default: 30 days ago)
- `end_date` (optional): End date in YYYY-MM-DD format (default: today)

Response:
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "website_id": "website-domain.com",
  "metrics": {
    "users": 1234,
    "page_views": 5678,
    "avg_duration": 125.5,
    "property_id": "123456789",
    "website_id": "website-domain.com"
  }
}
```

### **Get Metrics with Comparison (Single Website)**
```
GET /api/ga-comparison?website_id=website-domain.com&start_date=2024-01-01&end_date=2024-01-31&previous_period=true
```

**Query Parameters:**
- `website_id` (optional): Website ID to fetch metrics for
- `start_date` (optional): Start date in YYYY-MM-DD format (default: 30 days ago)
- `end_date` (optional): End date in YYYY-MM-DD format (default: today)
- `previous_period` (optional): Include comparison with previous period (true/false, default: true)

Response:
```json
{
  "current": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "website_id": "website-domain.com",
    "metrics": {
      "users": 1234,
      "page_views": 5678,
      "avg_duration": 125.5
    }
  },
  "previous": {
    "metrics": {
      "users": 1100,
      "page_views": 5000,
      "avg_duration": 110.2
    }
  },
  "trends": {
    "users_trend": 12.18,
    "page_views_trend": 13.6,
    "duration_trend": 13.98
  }
}
```

### **Get All Configured GA4 Properties**
```
GET /api/ga-properties
```

Response (for multi-property setup):
```json
{
  "properties": [
    {
      "website_id": "website-1.com",
      "website_name": "Website 1",
      "property_id": "123456789"
    },
    {
      "website_id": "website-2.com",
      "website_name": "Website 2",
      "property_id": "987654321"
    }
  ],
  "total": 2,
  "has_ga_configured": true
}
```

**Use this endpoint to:**
- Verify that your properties are correctly configured
- See the website-to-property mapping
- Ensure the service account has access to all properties

---

## **Security Notes**

⚠️ **IMPORTANT: Protect your credentials!**

1. **Never commit** the JSON key file to version control
2. **Never** share the private key
3. **Always** use environment variables for credentials
4. For production, use:
   - Railway's secret management
   - AWS Secrets Manager
   - HashiCorp Vault
   - Similar secure credential storage

5. **Rotate keys periodically** (monthly recommended)
   - Go to Google Cloud Console → Service Account → Keys
   - Delete old keys and create new ones

---

## **Next Steps**

- Set up [Google Analytics custom events](https://support.google.com/analytics/answer/9268036) to track specific user actions
- Create [GA4 segments](https://support.google.com/analytics/answer/9304353) to analyze subsets of your audience
- Export reports using the **"Actions"** section in your dashboard

---

## **Support**

If you encounter issues:

1. Check the [Google Analytics Setup Guide](./GOOGLE_ANALYTICS_SETUP.md) for basic GA4 setup
2. Review server logs: `docker logs` or check your terminal output
3. Verify credentials in [Google Cloud Console](https://console.cloud.google.com/)
4. Check that GA4 data is being collected on your website

Happy analyzing! 📊
