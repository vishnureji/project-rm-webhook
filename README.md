# RebelMouse Webhook → PostgreSQL

FastAPI webhook that receives RebelMouse post events and upserts them into PostgreSQL.

## Deploy to Railway

1. Push this repo to GitHub
2. railway.app → New Project → Deploy from GitHub repo
3. Inside project → + New → Database → PostgreSQL
4. Copy DATABASE_URL from Postgres Variables tab
5. Set env vars on your web service:
   - DATABASE_URL  (from step 4)
   - WEBHOOK_USER  (choose any username)
   - WEBHOOK_PASS  (choose any password)
6. Run schema.sql in Railway's Postgres Query tab
7. Web service → Settings → Networking → Generate Domain

## Test

```bash
curl https://yourapp.up.railway.app/

curl -X POST https://yourapp.up.railway.app/webhook \
  -u USERNAME:PASSWORD \
  -H "Content-Type: application/json" \
  -d '{"post":{"id":"123","headline":"Test Article"}}'
```
