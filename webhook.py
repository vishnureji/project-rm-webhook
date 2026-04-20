import os
import logging
import json
import secrets
import psycopg2
from datetime import datetime, timedelta
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from urllib.parse import urlparse
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest
from google.auth import load_credentials_from_dict

# --- LOGGING CONFIGURATION ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = FastAPI()
security = HTTPBasic()

# Configuration from Environment Variables
DB_URL = os.getenv("DATABASE_URL")
EXPECTED_USER = os.getenv("WEBHOOK_USER")
EXPECTED_PASS = os.getenv("WEBHOOK_PASS")

# Optional: Website domain to name mapping (can be configured via environment)
WEBSITE_MAPPING = os.getenv("WEBSITE_MAPPING", "{}")
try:
    import json as json_module
    WEBSITE_MAPPING = json_module.loads(WEBSITE_MAPPING)
except:
    WEBSITE_MAPPING = {}

# --- GOOGLE ANALYTICS 4 CONFIGURATION ---
GOOGLE_ANALYTICS_CREDENTIALS = os.getenv("GOOGLE_ANALYTICS_CREDENTIALS")

# Parse single property ID (legacy support) or multiple properties mapping
GOOGLE_ANALYTICS_PROPERTY_ID = os.getenv("GOOGLE_ANALYTICS_PROPERTY_ID")  # Single property (legacy)
GA_PROPERTIES_MAPPING = os.getenv("GA_PROPERTIES_MAPPING", "{}")  # Multi-property: {"website-id": "property-123456", ...}

try:
    GA_PROPERTIES_MAPPING = json.loads(GA_PROPERTIES_MAPPING)
except:
    GA_PROPERTIES_MAPPING = {}

# If single property is set but no mapping exists, use it as default
if GOOGLE_ANALYTICS_PROPERTY_ID and not GA_PROPERTIES_MAPPING:
    GA_PROPERTIES_MAPPING = {"default": GOOGLE_ANALYTICS_PROPERTY_ID}
    logging.info(f"Using single GA property: {GOOGLE_ANALYTICS_PROPERTY_ID}")
elif GA_PROPERTIES_MAPPING:
    logging.info(f"Loaded GA properties mapping for {len(GA_PROPERTIES_MAPPING)} website(s)")

# Initialize GA4 client
ga_client = None
if GOOGLE_ANALYTICS_CREDENTIALS and GA_PROPERTIES_MAPPING:
    try:
        logging.info(f"Attempting to load GA credentials (type: {type(GOOGLE_ANALYTICS_CREDENTIALS).__name__}, length: {len(GOOGLE_ANALYTICS_CREDENTIALS)})")
        
        # Parse credentials from JSON string or file path
        if GOOGLE_ANALYTICS_CREDENTIALS.startswith('{'):
            logging.info("Loading credentials from JSON string")
            creds_dict = json.loads(GOOGLE_ANALYTICS_CREDENTIALS)
            logging.info(f"Parsed JSON with keys: {list(creds_dict.keys())}")
        else:
            logging.info(f"Loading credentials from file: {GOOGLE_ANALYTICS_CREDENTIALS}")
            with open(GOOGLE_ANALYTICS_CREDENTIALS, 'r') as f:
                creds_dict = json.load(f)
            logging.info(f"Loaded JSON file with keys: {list(creds_dict.keys())}")
        
        credentials, _ = load_credentials_from_dict(creds_dict)
        logging.info(f"Created credentials object: {credentials}")
        
        ga_client = BetaAnalyticsDataClient(credentials=credentials)
        logging.info("Google Analytics 4 client initialized successfully")
    except Exception as e:
        logging.error(f"Failed to initialize GA4 client: {str(e)}", exc_info=True)
        ga_client = None
else:
    if not GOOGLE_ANALYTICS_CREDENTIALS:
        logging.warning("GOOGLE_ANALYTICS_CREDENTIALS environment variable not set")
    if not GA_PROPERTIES_MAPPING:
        logging.warning("GA_PROPERTIES_MAPPING is empty")
    logging.warning("Google Analytics credentials not configured. GA metrics will not be available.")


def get_ga_metrics(start_date: str, end_date: str, website_id: str = None, property_id: str = None) -> dict:
    """
    Fetch Google Analytics metrics: unique visitors, page views, and average duration.
    
    Args:
        start_date: Date string in format 'YYYY-MM-DD'
        end_date: Date string in format 'YYYY-MM-DD'
        website_id: Website ID to lookup property ID from mapping
        property_id: Direct GA4 property ID (overrides website_id lookup)
    
    Returns:
        Dictionary with metrics or empty dict if GA4 not configured
    """
    if not ga_client:
        return {
            "users": 0,
            "page_views": 0,
            "avg_duration": 0,
            "error": "Google Analytics client not initialized"
        }
    
    # Determine which property ID to use
    if property_id:
        # Use directly provided property ID
        ga_property_id = property_id
    elif website_id:
        # Look up property ID from website mapping
        ga_property_id = GA_PROPERTIES_MAPPING.get(website_id)
        if not ga_property_id:
            return {
                "users": 0,
                "page_views": 0,
                "avg_duration": 0,
                "error": f"Google Analytics property not configured for website: {website_id}"
            }
    elif GA_PROPERTIES_MAPPING:
        # Use default property if available
        ga_property_id = GA_PROPERTIES_MAPPING.get("default")
        if not ga_property_id:
            # Use first available property
            ga_property_id = list(GA_PROPERTIES_MAPPING.values())[0]
    else:
        return {
            "users": 0,
            "page_views": 0,
            "avg_duration": 0,
            "error": "No Google Analytics properties configured"
        }
    
    try:
        logging.info(f"Fetching GA metrics for property {ga_property_id}, website: {website_id}, dates: {start_date} to {end_date}")
        request = RunReportRequest(
            property=f"properties/{ga_property_id}",
            date_ranges=[{"start_date": start_date, "end_date": end_date}],
            metrics=[
                {"name": "activeUsers"},  # Unique Users
                {"name": "screenPageViews"},  # Page Views
                {"name": "averageSessionDuration"},  # Average Duration in seconds
            ],
        )
        
        response = ga_client.run_report(request)
        logging.info(f"GA API response received with {len(response.rows)} rows")
        
        if response.rows:
            row = response.rows[0]
            metrics = row.metric_values
            result = {
                "users": int(metrics[0].value),
                "page_views": int(metrics[1].value),
                "avg_duration": float(metrics[2].value),
                "property_id": ga_property_id,
                "website_id": website_id,
            }
            logging.info(f"GA metrics fetched successfully: {result}")
            return result
        else:
            logging.warning(f"No data rows in GA response for property {ga_property_id}")
            return {
                "users": 0,
                "page_views": 0,
                "avg_duration": 0,
                "property_id": ga_property_id,
                "website_id": website_id,
            }
    except Exception as e:
        logging.error(f"Error fetching GA metrics for property {ga_property_id}: {str(e)}", exc_info=True)
        return {
            "users": 0,
            "page_views": 0,
            "avg_duration": 0,
            "error": str(e)
        }


def get_ga_page_metrics(start_date: str, end_date: str, page_path: str, website_id: str = None, property_id: str = None) -> dict:
    """
    Fetch Google Analytics metrics for a specific page path.
    
    Args:
        start_date: Date string in format 'YYYY-MM-DD'
        end_date: Date string in format 'YYYY-MM-DD'
        page_path: The page path to filter by (e.g., '/article-title' or '/news/article')
        website_id: Website ID to lookup property ID from mapping
        property_id: Direct GA4 property ID
    
    Returns:
        Dictionary with metrics for the specific page
    """
    if not ga_client:
        return {
            "users": 0,
            "page_views": 0,
            "avg_duration": 0,
            "error": "Google Analytics client not initialized"
        }
    
    # Determine which property ID to use
    if property_id:
        ga_property_id = property_id
    elif website_id:
        ga_property_id = GA_PROPERTIES_MAPPING.get(website_id)
        if not ga_property_id:
            return {
                "users": 0,
                "page_views": 0,
                "avg_duration": 0,
                "error": f"Google Analytics property not configured for website: {website_id}"
            }
    elif GA_PROPERTIES_MAPPING:
        ga_property_id = GA_PROPERTIES_MAPPING.get("default")
        if not ga_property_id:
            ga_property_id = list(GA_PROPERTIES_MAPPING.values())[0]
    else:
        return {
            "users": 0,
            "page_views": 0,
            "avg_duration": 0,
            "error": "No Google Analytics properties configured"
        }
    
    try:
        logging.info(f"Fetching GA page metrics for path: {page_path}, property: {ga_property_id}")
        
        # Use pagePath as a dimension and query all rows
        # GA4 will return data grouped by pagePath, we filter in the response
        from google.analytics.data_v1beta.types import Filter, FilterExpression
        
        # Create a simple string filter for the page path
        page_filter = FilterExpression(
            filter=Filter(
                field_name="pagePath",
                string_filter={"value": page_path, "match_type": 1}  # 1 = EXACT
            )
        )
        
        request = RunReportRequest(
            property=f"properties/{ga_property_id}",
            date_ranges=[{"start_date": start_date, "end_date": end_date}],
            dimensions=[
                {"name": "pagePath"}  # Include pagePath as dimension
            ],
            metrics=[
                {"name": "activeUsers"},
                {"name": "screenPageViews"},
                {"name": "averageSessionDuration"},
            ],
            dimension_filter=page_filter,
        )
        
        response = ga_client.run_report(request)
        logging.info(f"GA page metrics response: {len(response.rows)} rows for path {page_path}")
        
        if response.rows:
            row = response.rows[0]
            metrics = row.metric_values
            result = {
                "users": int(metrics[0].value),
                "page_views": int(metrics[1].value),
                "avg_duration": float(metrics[2].value),
                "page_path": page_path,
                "property_id": ga_property_id,
                "website_id": website_id,
            }
            logging.info(f"Page metrics fetched: {result}")
            return result
        else:
            logging.info(f"No GA data for page path: {page_path}")
            return {
                "users": 0,
                "page_views": 0,
                "avg_duration": 0,
                "page_path": page_path,
                "property_id": ga_property_id,
                "website_id": website_id,
            }
    except Exception as e:
        logging.error(f"Error fetching page metrics for {page_path}: {str(e)}", exc_info=True)
        return {
            "users": 0,
            "page_views": 0,
            "avg_duration": 0,
            "error": str(e)
        }


def authenticate(credentials: HTTPBasicCredentials = Depends(security)):
    if not EXPECTED_USER or not EXPECTED_PASS:
        logging.error("Webhook credentials not set in environment variables.")
        raise HTTPException(status_code=500, detail="Server configuration error")

    is_user_ok = secrets.compare_digest(credentials.username, EXPECTED_USER)
    is_pass_ok = secrets.compare_digest(credentials.password, EXPECTED_PASS)

    if not (is_user_ok and is_pass_ok):
        logging.warning(f"Unauthorized access attempt from user: {credentials.username}")
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


def extract_website_from_url(url):
    """Extract website domain from URL"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.replace("www.", "")
        return domain
    except:
        return "unknown"


def get_website_info(post_url, website_id_from_payload=None, website_name_from_payload=None):
    """
    Extract or determine website identification
    Priority: explicit fields > URL extraction > defaults
    """
    # If explicitly provided, use them
    if website_id_from_payload and website_name_from_payload:
        return website_id_from_payload, website_name_from_payload
    
    # Extract from URL
    if post_url:
        domain = extract_website_from_url(post_url)
        
        # If website_id provided explicitly, use it with domain-derived name
        if website_id_from_payload:
            # Check if we have a mapping for this domain
            display_name = WEBSITE_MAPPING.get(domain, domain.replace(".com", "").title())
            return website_id_from_payload, display_name
        
        # Use domain as website_id
        if domain != "unknown":
            # Check if we have a friendly name mapping
            display_name = WEBSITE_MAPPING.get(domain, domain.replace(".com", "").title())
            return domain, display_name
    
    # Fallback
    if website_name_from_payload:
        return website_id_from_payload or "default", website_name_from_payload
    
    return "default", "Unknown Website"


def upsert_to_master(data):
    """Insert/update article and author data into database"""
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        post_id = data.get("post_id") or data.get("id")

        if not post_id:
            raise ValueError("Payload contains no usable article ID (id / post_id)")

        # Get website identification
        website_id = data.get("website_id", "default")
        website_name = data.get("website_name", "Unknown")

        # Coerce timestamps to int
        created_ts = int(data.get("created_ts")) if data.get("created_ts") is not None else None
        updated_ts = int(data.get("updated_ts")) if data.get("updated_ts") is not None else None

        # Get authors array — already normalized before this call
        authors = data.get("authors", [])

        # If no authors, insert one row with null author fields
        if not authors:
            authors = [{}]

        # Loop through each author and insert one row per author
        for author in authors:
            cur.execute("""
                INSERT INTO articles_with_authors (
                    post_id,
                    website_id,
                    website_name,
                    headline,
                    post_url,
                    created_ts,
                    updated_ts,
                    author_id,
                    displayname,
                    photo,
                    profile_url,
                    last_modified
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
                ON CONFLICT (post_id, author_id, website_id) DO UPDATE SET
                    website_name  = EXCLUDED.website_name,
                    headline      = EXCLUDED.headline,
                    post_url      = EXCLUDED.post_url,
                    created_ts    = EXCLUDED.created_ts,
                    updated_ts    = EXCLUDED.updated_ts,
                    displayname   = EXCLUDED.displayname,
                    photo         = EXCLUDED.photo,
                    profile_url   = EXCLUDED.profile_url,
                    last_modified = NOW();
            """, (
                post_id,
                website_id,
                website_name,
                data.get("headline"),
                data.get("post_url"),
                created_ts,
                updated_ts,
                author.get("author_id"),
                author.get("displayname"),
                author.get("photo"),
                author.get("profile_url"),
            ))

        conn.commit()
        logging.info(f"Successfully synced Post ID: {post_id} (Website: {website_name}) with {len(authors)} author(s)")

    except Exception as e:
        if conn:
            conn.rollback()
        logging.error(f"Database Error for ID {data.get('post_id', data.get('id', 'Unknown'))}: {str(e)}")
        raise e

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Webhook server is running"}


@app.post("/webhook")
async def rebelmouse_webhook(
    request: Request,
    authenticated_user: str = Depends(authenticate)
):
    try:
        payload = await request.json()
        logging.info(f"Authorized Webhook ({authenticated_user}): {json.dumps(payload)}")

        # ✅ RebelMouse sends article data under the "payload" key
        post_data_raw = payload.get("payload", payload)

        if not (post_data_raw.get("id") or post_data_raw.get("post_id")):
            logging.warning("Webhook received but missing Article ID.")
            return {"status": "ignored", "message": "Missing ID"}

        # Get post_url for automatic website detection
        post_url = post_data_raw.get("post_url")

        # ✅ Extract or use explicit website identification
        # Priority: explicit fields > URL extraction > defaults
        website_id_payload = post_data_raw.get("website_id") or payload.get("website_id")
        website_name_payload = post_data_raw.get("website_name") or payload.get("website_name")
        
        website_id, website_name = get_website_info(post_url, website_id_payload, website_name_payload)

        # ✅ Normalize roar_authors → authors with DB-expected field names
        #    roar_authors[].id          → author_id
        #    roar_authors[].title       → displayname  (falls back to .name)
        #    roar_authors[].avatar      → photo
        #    roar_authors[].profile_href → profile_url
        roar_authors = post_data_raw.get("roar_authors", [])
        normalized_authors = [
            {
                "author_id":   str(a.get("id")),
                "displayname": a.get("title") or a.get("name"),
                "photo":       a.get("avatar"),
                "profile_url": a.get("profile_href"),
            }
            for a in roar_authors
            if a.get("id")
        ]

        post_data = {
            "post_id":     post_data_raw.get("id") or post_data_raw.get("post_id"),
            "website_id":  website_id,
            "website_name": website_name,
            "headline":    post_data_raw.get("headline"),
            "post_url":    post_url,
            "created_ts":  post_data_raw.get("created_ts"),
            "updated_ts":  post_data_raw.get("updated_ts"),
            "authors":     normalized_authors,
        }

        upsert_to_master(post_data)
        return {"status": "success", "message": "Article Synced", "website": website_name, "website_id": website_id}

    except Exception as e:
        logging.critical(f"System Failure: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/webhook/wordpress")
async def wordpress_webhook(
    request: Request,
    authenticated_user: str = Depends(authenticate)
):
    try:
        payload = await request.json()
        logging.info(f"WordPress Webhook ({authenticated_user}): {json.dumps(payload)}")

        # WordPress will send data directly or wrapped in 'payload'
        post_data_raw = payload.get("payload", payload)

        if not post_data_raw.get("id"):
            logging.warning("WP Webhook missing ID.")
            return {"status": "ignored", "message": "Missing ID"}

        # Extract/Determine website info using your existing helper
        post_url = post_data_raw.get("post_url")
        website_id, website_name = get_website_info(
            post_url, 
            post_data_raw.get("website_id"), 
            post_data_raw.get("website_name")
        )

        # Normalize WordPress authors to your 'roar_authors' style format
        wp_authors = post_data_raw.get("authors", [])
        normalized_authors = [
            {
                "author_id":   str(a.get("id")),
                "displayname": a.get("name"),
                "photo":       a.get("avatar"),
                "profile_url": a.get("profile_url"),
            }
            for a in wp_authors if a.get("id")
        ]

        # Structure the data for upsert_to_master
        post_data = {
            "post_id":      post_data_raw.get("id"),
            "website_id":   website_id,
            "website_name": website_name,
            "headline":     post_data_raw.get("headline"),
            "post_url":     post_url,
            "created_ts":   post_data_raw.get("created_ts"),
            "updated_ts":   post_data_raw.get("updated_ts"),
            "authors":      normalized_authors,
        }

        upsert_to_master(post_data)
        return {"status": "success", "message": "WordPress Article Synced"}

    except Exception as e:
        logging.critical(f"WP System Failure: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/api/websites")
async def get_websites():
    """Get list of all websites with article counts"""
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        cur.execute("""
            SELECT 
                website_id,
                website_name,
                COUNT(DISTINCT post_id) as post_count,
                COUNT(DISTINCT author_id) as author_count,
                MAX(created_ts) as latest_article_ts
            FROM articles_with_authors
            WHERE author_id IS NOT NULL
            GROUP BY website_id, website_name
            ORDER BY post_count DESC
        """)
        
        rows = cur.fetchall()
        return [
            {
                "website_id": row[0],
                "website_name": row[1],
                "post_count": row[2],
                "author_count": row[3],
                "latest_article_ts": row[4]
            }
            for row in rows
        ]
    except Exception as e:
        logging.error(f"Error fetching websites: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching websites")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/stats")
async def get_stats(website_id: str = None, start_date: str = None, end_date: str = None):
    """Get overall statistics, optionally filtered by website and date range"""
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        # Build WHERE clause
        where_clauses = ["author_id IS NOT NULL"]
        params = []

        if website_id:
            where_clauses.append("website_id = %s")
            params.append(website_id)

        if start_date:
            start_ts = int(datetime.strptime(start_date, '%Y-%m-%d').timestamp())
            where_clauses.append("created_ts >= %s")
            params.append(start_ts)

        if end_date:
            end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            end_ts = int(end_dt.timestamp())
            where_clauses.append("created_ts < %s")
            params.append(end_ts)

        where_clause = " AND ".join(where_clauses)
        query = f"""
            SELECT 
                COUNT(DISTINCT post_id) as total_articles,
                COUNT(DISTINCT author_id) as total_authors,
                MAX(created_ts) as latest_article_ts
            FROM articles_with_authors
            WHERE {where_clause}
        """
        
        cur.execute(query, params)
        stats = cur.fetchone()
        return {
            "total_articles": stats[0] or 0,
            "total_authors": stats[1] or 0,
            "latest_article_ts": stats[2],
            "website_id": website_id,
            "start_date": start_date,
            "end_date": end_date
        }
    except Exception as e:
        logging.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching stats")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/posts-per-day")
async def get_posts_per_day(website_id: str = None, start_date: str = None, end_date: str = None):
    """Get posts published per day, optionally filtered by website and date range"""
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        # Build WHERE clause
        where_clauses = ["created_ts IS NOT NULL", "author_id IS NOT NULL"]
        params = []

        if website_id:
            where_clauses.append("website_id = %s")
            params.append(website_id)

        if start_date:
            start_ts = int(datetime.strptime(start_date, '%Y-%m-%d').timestamp())
            where_clauses.append("created_ts >= %s")
            params.append(start_ts)

        if end_date:
            end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            end_ts = int(end_dt.timestamp())
            where_clauses.append("created_ts < %s")
            params.append(end_ts)

        where_clause = " AND ".join(where_clauses)
        query = f"""
            SELECT 
                TO_CHAR(TO_TIMESTAMP(created_ts), 'YYYY-MM-DD') as date,
                COUNT(DISTINCT post_id) as post_count
            FROM articles_with_authors
            WHERE {where_clause}
            GROUP BY TO_CHAR(TO_TIMESTAMP(created_ts), 'YYYY-MM-DD')
            ORDER BY date DESC
            LIMIT 365
        """
        
        cur.execute(query, params)
        rows = cur.fetchall()
        return [
            {"date": row[0], "count": row[1]}
            for row in rows
        ]
    except Exception as e:
        logging.error(f"Error fetching posts per day: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching posts per day")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/top-authors")
async def get_top_authors(website_id: str = None, start_date: str = None, end_date: str = None):
    """Get top authors by post count, optionally filtered by website and date range"""
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        # Build WHERE clause
        where_clauses = ["author_id IS NOT NULL"]
        params = []

        if website_id:
            where_clauses.append("website_id = %s")
            params.append(website_id)

        if start_date:
            start_ts = int(datetime.strptime(start_date, '%Y-%m-%d').timestamp())
            where_clauses.append("created_ts >= %s")
            params.append(start_ts)

        if end_date:
            end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            end_ts = int(end_dt.timestamp())
            where_clauses.append("created_ts < %s")
            params.append(end_ts)

        where_clause = " AND ".join(where_clauses)
        query = f"""
            SELECT 
                author_id,
                displayname,
                photo,
                profile_url,
                COUNT(DISTINCT post_id) as post_count
            FROM articles_with_authors
            WHERE {where_clause}
            GROUP BY author_id, displayname, photo, profile_url
            ORDER BY post_count DESC
            LIMIT 15
        """
        
        cur.execute(query, params)
        rows = cur.fetchall()
        return [
            {
                "author_id": row[0],
                "name": row[1],
                "photo": row[2],
                "profile_url": row[3],
                "post_count": row[4]
            }
            for row in rows
        ]
    except Exception as e:
        logging.error(f"Error fetching top authors: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching top authors")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/recent-articles")
async def get_recent_articles(limit: int = 20, website_id: str = None, start_date: str = None, end_date: str = None):
    """Get recent articles, optionally filtered by website and date range"""
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        # Build WHERE clause
        where_clauses = ["created_ts IS NOT NULL"]
        params = []

        if website_id:
            where_clauses.append("website_id = %s")
            params.append(website_id)

        if start_date:
            start_ts = int(datetime.strptime(start_date, '%Y-%m-%d').timestamp())
            where_clauses.append("created_ts >= %s")
            params.append(start_ts)

        if end_date:
            end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            end_ts = int(end_dt.timestamp())
            where_clauses.append("created_ts < %s")
            params.append(end_ts)

        where_clause = " AND ".join(where_clauses)
        params.append(limit)
        
        query = f"""
            SELECT DISTINCT ON (post_id)
                post_id,
                headline,
                post_url,
                created_ts,
                displayed_name,
                photo,
                profile_url,
                website_name
            FROM (
                SELECT 
                    post_id,
                    headline,
                    post_url,
                    created_ts,
                    displayname as displayed_name,
                    photo,
                    profile_url,
                    website_name
                FROM articles_with_authors
                WHERE {where_clause}
                ORDER BY post_id DESC, author_id DESC
            ) recent_posts
            ORDER BY post_id DESC
            LIMIT %s
        """
        
        cur.execute(query, params)
        rows = cur.fetchall()
        return [
            {
                "post_id": row[0],
                "headline": row[1],
                "post_url": row[2],
                "created_ts": row[3],
                "author": row[4],
                "photo": row[5],
                "profile_url": row[6],
                "website_name": row[7]
            }
            for row in rows
        ]
    except Exception as e:
        logging.error(f"Error fetching recent articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching recent articles")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/ga-metrics")
async def get_ga_metrics_endpoint(website_id: str = None, start_date: str = None, end_date: str = None):
    """Get Google Analytics metrics for a specific website or all websites"""
    try:
        # Default to last 30 days if not specified
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        metrics = get_ga_metrics(start_date, end_date, website_id=website_id)
        return {
            "start_date": start_date,
            "end_date": end_date,
            "website_id": website_id,
            "metrics": metrics
        }
    except Exception as e:
        logging.error(f"Error in GA metrics endpoint: {str(e)}")
        return {
            "error": "Failed to fetch Google Analytics metrics",
            "detail": str(e)
        }


@app.get("/api/ga-comparison")
async def get_ga_comparison(website_id: str = None, start_date: str = None, end_date: str = None, previous_period: bool = True):
    """Get Google Analytics metrics with comparison to previous period for a specific website"""
    try:
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        # Current period metrics
        current_metrics = get_ga_metrics(start_date, end_date, website_id=website_id)
        
        # Previous period metrics (if requested)
        previous_metrics = None
        if previous_period:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            period_days = (end_dt - start_dt).days + 1
            
            prev_end_date = start_date
            prev_start_date = (start_dt - timedelta(days=period_days)).strftime('%Y-%m-%d')
            
            previous_metrics = get_ga_metrics(prev_start_date, prev_end_date, website_id=website_id)
        
        # Calculate trends
        trends = {}
        if previous_metrics and 'error' not in previous_metrics:
            if previous_metrics['users'] > 0:
                trends['users_trend'] = ((current_metrics['users'] - previous_metrics['users']) / previous_metrics['users']) * 100
            if previous_metrics['page_views'] > 0:
                trends['page_views_trend'] = ((current_metrics['page_views'] - previous_metrics['page_views']) / previous_metrics['page_views']) * 100
            if previous_metrics['avg_duration'] > 0:
                trends['duration_trend'] = ((current_metrics['avg_duration'] - previous_metrics['avg_duration']) / previous_metrics['avg_duration']) * 100
        
        return {
            "current": {
                "start_date": start_date,
                "end_date": end_date,
                "website_id": website_id,
                "metrics": current_metrics
            },
            "previous": {
                "metrics": previous_metrics
            } if previous_metrics else None,
            "trends": trends
        }
    except Exception as e:
        logging.error(f"Error in GA comparison endpoint: {str(e)}")
        return {
            "error": "Failed to fetch Google Analytics comparison data",
            "detail": str(e)
        }


@app.get("/api/ga-properties")
async def get_ga_properties():
    """Get list of all configured Google Analytics properties"""
    try:
        properties_list = []
        for website_id, property_id in GA_PROPERTIES_MAPPING.items():
            if website_id != "default":
                # Get website name from WEBSITE_MAPPING if available
                website_name = WEBSITE_MAPPING.get(website_id, website_id)
                properties_list.append({
                    "website_id": website_id,
                    "website_name": website_name,
                    "property_id": property_id
                })
        
        return {
            "properties": properties_list,
            "total": len(properties_list),
            "has_ga_configured": ga_client is not None
        }
    except Exception as e:
        logging.error(f"Error fetching GA properties: {str(e)}")
        return {
            "properties": [],
            "error": str(e)
        }


@app.get("/api/ga-page-metrics")
async def get_ga_page_metrics_endpoint(page_path: str, website_id: str = None, start_date: str = None, end_date: str = None):
    """Get Google Analytics metrics for a specific page path"""
    try:
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        if not page_path:
            return {
                "error": "page_path parameter is required"
            }
        
        metrics = get_ga_page_metrics(start_date, end_date, page_path, website_id=website_id)
        return {
            "start_date": start_date,
            "end_date": end_date,
            "page_path": page_path,
            "website_id": website_id,
            "metrics": metrics
        }
    except Exception as e:
        logging.error(f"Error in GA page metrics endpoint: {str(e)}")
        return {
            "error": "Failed to fetch Google Analytics page metrics",
            "detail": str(e)
        }


# Mount static files from dashboard build directory (MUST be last - after all API routes)
dashboard_dist = Path(__file__).parent / "dashboard" / "dist"
if dashboard_dist.exists():
    app.mount("/", StaticFiles(directory=str(dashboard_dist), html=True), name="static")
else:
    logging.warning(f"Dashboard dist not found at {dashboard_dist}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))