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


# Mount static files from dashboard build directory
dashboard_dist = Path(__file__).parent / "dashboard" / "dist"
if dashboard_dist.exists():
    app.mount("/", StaticFiles(directory=str(dashboard_dist), html=True), name="static")
else:
    logging.warning(f"Dashboard dist not found at {dashboard_dist}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))