# Google Analytics 4 Setup Guide

Complete step-by-step guide to integrate Google Analytics with your webhook dashboard.

---

## **Step 1: Create a Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google Account
3. Click **"Create Project"** (top-left dropdown)
4. Enter project name: `webhook-analytics` (or any name)
5. Click **"Create"** and wait for it to complete
6. Select your new project (it should auto-select)

---

## **Step 2: Enable Google Analytics API**

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Google Analytics Data API"**
3. Click on it and press **"Enable"**
4. Wait for it to finish enabling (shows "Enabled" in blue)

---

## **Step 3: Create a Service Account**

1. Go to **APIs & Services** → **Credentials** (left sidebar)
2. Click **"+ Create Credentials"** at the top
3. Select **"Service Account"**
4. Fill in:
   - **Service account name:** `webhook-analytics`
   - **Service account ID:** (auto-filled, keep default)
   - **Description:** Analytics service for webhook dashboard
5. Click **"Create and Continue"**
6. On the next screen, click **"Continue"** (skip the optional steps)
7. Click **"Done"**

---

## **Step 4: Create and Download Service Account Key**

1. Go to **APIs & Services** → **Credentials**
2. Under "Service Accounts", click on **`webhook-analytics`** (the one you just created)
3. Go to the **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Select **"JSON"** and click **"Create"**
6. A JSON file will download automatically
7. **Save this file securely** - you'll need it for the webhook server

**Keep this file safe!** It contains credentials to access your analytics.

---

## **Step 5: Get Your Google Analytics Property ID**

### **Option A: If you already have GA4 set up:**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your website property
3. Go to **Admin** (bottom-left gear icon)
4. Click **"Property details"** (left column)
5. Copy the **"Property ID"** (looks like: `123456789`)

### **Option B: If you DON'T have GA4 set up:**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **"Create"** (or **"Start measuring"**)
3. Enter your **Account name** (your company/site name)
4. Click **"Next"**
5. Enter **Property name** (your website name)
6. Select your timezone, currency, industry
7. Click **"Create"**
8. Select platform: **"Web"**
9. Enter your **Website name** and **Website URL**
10. Click **"Create"** (ignore data stream setup for now, we'll add tracking later)
11. Your **Property ID** will be displayed (save it!)

---

## **Step 6: Add Service Account to your GA4 Property**

1. In Google Analytics, go to **Admin** → **Account access management**
2. Click **"+"** to add a new member
3. Paste your **Service Account Email** (from the JSON file, looks like: `webhook-analytics@YOUR-PROJECT-ID.iam.gserviceaccount.com`)
4. Give it **"Editor"** permissions
5. Click **"Add"**

---

## **Step 7: Set Up Your Environment**

### **Option A: Using Environment Variables (Recommended)**

Add to your `.env` file or Railway environment variables:

```bash
# Google Analytics Configuration
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_ANALYTICS_CREDENTIALS_PATH=/app/google-credentials.json
```

### **Option B: Store Credentials in Railway**

On Railway:
1. Go to your project → **Settings** → **Environment**
2. Add new variable:
   - **Key:** `GOOGLE_ANALYTICS_PROPERTY_ID`
   - **Value:** Your property ID
3. Upload the service account JSON file:
   - Go to **Settings** → **File Storage** or use the **Secrets** section
   - Upload your JSON file

---

## **Step 8: Prepare Your Service Account JSON File**

1. Open the downloaded JSON file with a text editor
2. Copy the entire contents
3. In Railway:
   - Go to **Settings** → **Variables**
   - Add new variable:
     - **Key:** `GOOGLE_APPLICATION_CREDENTIALS`
     - **Value:** *Paste the entire JSON content*

**Alternative:** Save the JSON file to `/app/` directory in Railway and reference the path.

---

## **Step 9: Verify Your Setup**

Use this Python script to test the connection:

```python
import os
from google.analytics.data_v1beta import BetaAnalyticsDataClient

# Set up credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/path/to/your/google-credentials.json'

# Initialize client
client = BetaAnalyticsDataClient()

# Test query
property_id = "YOUR_PROPERTY_ID"
request = {
    "property": f"properties/{property_id}",
    "date_ranges": [{"start_date": "30daysAgo", "end_date": "today"}],
    "metrics": [{"name": "sessions"}],
}

response = client.run_report(request)
print(f"Sessions in last 30 days: {response.rows[0].metric_values[0].value}")
```

If this works, you're all set! ✅

---

## **Step 10: Files Organization**

**Local Setup:**
```
Webhook/
├── google-credentials.json          (service account JSON - keep secret!)
├── webhook.py                       (to be updated with GA code)
├── requirements.txt                 (add google-analytics-data)
└── dashboard/
    └── src/
        └── components/
            └── GoogleAnalytics.jsx  (new component - to be created)
```

**Railway Setup:**
```
Environment Variables:
- GOOGLE_ANALYTICS_PROPERTY_ID = 123456789
- GOOGLE_APPLICATION_CREDENTIALS = /app/credentials.json
```

---

## **Troubleshooting**

### **"Permission denied" error**
- ✅ Make sure service account is added to GA4 property with "Editor" access
- ✅ Wait 5-10 minutes for permissions to propagate

### **"Property not found" error**
- ✅ Verify Property ID is correct (not Account ID)
- ✅ Check Property ID format (should be all numbers)

### **"Invalid credentials" error**
- ✅ JSON file not found/readable
- ✅ Environment variable path is incorrect
- ✅ Credentials JSON is corrupted or incomplete

### **"Quota exceeded" error**
- ✅ You've hit 10K daily API limit
- ✅ Implement caching (don't fetch every request)

---

## **Next Steps**

Once setup is complete:
1. Save your **Property ID** securely
2. Save your **Service Account JSON** file securely
3. Provide me with the **Property ID** (ID is safe to share)
4. I'll implement the backend integration

**Then I'll add:**
- ✅ Google Analytics API endpoints
- ✅ React components for GA metrics
- ✅ Charts showing top articles
- ✅ Views and visitor data
- ✅ Smart caching to avoid rate limits

---

## **Security Notes**

⚠️ **IMPORTANT:**
- Never commit your `google-credentials.json` to GitHub
- Add to `.gitignore`
- Don't share the full JSON file
- Use Railway's secure environment variables
- Rotate credentials periodically

---

## **Quick Reference**

| Item | Where to Find | Example |
|------|---------------|---------|
| Property ID | GA4 Admin → Property Details | `123456789` |
| Service Account Email | JSON file → "client_email" | `service@project.iam.gserviceaccount.com` |
| Project ID | JSON file → "project_id" | `my-project-12345` |
| API | Google Cloud Console → APIs & Services | Google Analytics Data API |

---

## **Done! ✅**

Once you've completed all steps:
1. Share your **Google Analytics Property ID** with me
2. Confirm credentials are working
3. I'll implement the full integration on the backend and frontend

Need help? Ask away! 🚀
