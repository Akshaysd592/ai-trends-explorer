# PostgreSQL Data Persistence - Testing Guide

## ✅ What We've Accomplished

1. ✅ **PostgreSQL Docker Container Running**
   - Container: `ai-trend-explorer-postgres`
   - Port: 5433 (mapped to 5432)
   - Database: `ai_trend_explorer`
   - User: `ai_trend_user`

2. ✅ **Database Verified**
   - Database exists and is accessible
   - User has proper permissions
   - Connection tested successfully

3. ✅ **Dependencies Installed**
   - `pg` package installed in api-gateway
   - `@types/pg` installed
   - TypeORM configured

4. ✅ **API Server Building**
   - Nx build completed successfully
   - Server is starting up
   - Port: 3000

---

## 🚀 How to Test (Once Server is Running)

### Step 1: Verify Server is Running

Look for this message in the terminal:
```
[Nest] LOG  Application is running on: http://localhost:3000
```

Or check if port 3000 is listening:
```powershell
netstat -ano | findstr :3000
```

### Step 2: Test the API

Open a **new PowerShell terminal** and run:

```powershell
# First request - should fetch from providers and save to database
curl http://localhost:3000/api/trends?limit=5
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      "source": "github",
      "score": 100,
      ...
    }
  ],
  "sources": {...},
  "pagination": {...},
  "timestamp": "2026-08-08T..."
}
```

### Step 3: Watch the API Logs

In the API terminal, you should see:
```
Cache miss, fetching from providers
Saved X trends to database
```

This confirms data is being saved to PostgreSQL! 🎉

### Step 4: Verify Data in Database

```powershell
# Connect to Docker PostgreSQL
docker exec -it ai-trend-explorer-postgres psql -U ai_trend_user -d ai_trend_explorer
```

Run these SQL commands:
```sql
-- Check tables exist
\dt

-- View trends
SELECT id, title, source, score, saved_at 
FROM trends 
ORDER BY saved_at DESC 
LIMIT 10;

-- Count trends
SELECT COUNT(*) FROM trends;

-- View sources
SELECT name, status, last_checked 
FROM sources;

-- Exit
\q
```

### Step 5: Test Cache (Wait 1 Minute)

Wait 60 seconds, then:
```powershell
# Second request - should return cached data
curl http://localhost:3000/api/trends?limit=5
```

Watch API logs for:
```
Returning cached trends from database
```

---

## 📊 Database Schema

### trends table:
- `id` (string, primary key)
- `title` (string)
- `description` (text, nullable)
- `source` (string)
- `url` (string)
- `language` (string, nullable)
- `stars` (number, nullable)
- `forks` (number, nullable)
- `score` (number)
- `topics` (text array)
- `created_at` (timestamp, nullable)
- `updated_at` (timestamp, nullable)
- `saved_at` (timestamp, auto-generated)

### sources table:
- `id` (uuid, auto-generated)
- `name` (string, unique)
- `status` (string)
- `error` (text, nullable)
- `last_checked` (timestamp, auto-generated)

---

## 🔧 Troubleshooting

### If server won't start:
1. Check the terminal for error messages
2. Verify Docker PostgreSQL is running: `docker-compose ps`
3. Check .env file has correct credentials
4. Try rebuilding: `npx nx build api-gateway`

### If no data in database:
1. Check API logs for errors
2. Verify database connection in logs
3. Ensure tables are created (check with `\dt` in psql)

### If connection refused:
1. Verify server is running on port 3000
2. Check firewall settings
3. Try restarting the server

---

## 🎯 Success Criteria

✅ Server starts without errors
✅ API returns trends data
✅ Database has records in `trends` table
✅ Database has records in `sources` table
✅ Second request returns cached data (after 1 minute)

---

## 📝 Current Status

- **PostgreSQL**: Running on port 5433 ✅
- **Database**: `ai_trend_explorer` exists ✅
- **API Server**: Starting/Should be running on port 3000 ⏳
- **Tables**: Will be created automatically on first API call ⏳
- **Data Persistence**: Ready to test ⏳

---

## 🎬 Next Steps

1. **Wait for server to fully start** (check terminal for "Application is running" message)
2. **Make first API call**: `curl http://localhost:3000/trends?limit=5`
3. **Check database**: `docker exec -it ai-trend-explorer-postgres psql -U ai_trend_user -d ai_trend_explorer -c "SELECT COUNT(*) FROM trends;"`
4. **Verify data**: Run `\dt` and `SELECT * FROM trends LIMIT 5;` in psql

---

**The persistence implementation is complete and ready to test!** 🚀