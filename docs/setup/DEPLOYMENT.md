# YourToyotaPicks - Deployment Guide

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.local.example .env.local

# Generate a secure cron secret
openssl rand -base64 32

# Edit .env.local and add your values:
# - Supabase credentials
# - CRON_SECRET (from above)
# - Other settings
```

### 3. Run Database Setup
See `DATABASE_SETUP.md` for complete instructions.

### 4. Test Locally
```bash
# Start dev server
npm run dev

# In another terminal, test the cron job
./scripts/test-cron.sh
```

## Deploy to Vercel

### Prerequisites
- Vercel account (free tier works)
- Supabase project set up
- GitHub repository (optional but recommended)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
vercel login
```

### Step 2: Link Project
```bash
# From project directory
vercel link
```

### Step 3: Configure Environment Variables

**Option A: Via Vercel Dashboard**
1. Go to your project on vercel.com
2. Settings > Environment Variables
3. Add each variable for "Production":
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` (generate with `openssl rand -base64 32`)
   - `DATA_SOURCE` = `mock`
   - `SKIP_VIN_VALIDATION` = `true` (for testing)

**Option B: Via CLI**
```bash
# Add each variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add CRON_SECRET production
vercel env add DATA_SOURCE production
vercel env add SKIP_VIN_VALIDATION production
```

### Step 4: Deploy
```bash
# Deploy to production
vercel --prod

# Note your deployment URL (e.g., https://yourtoyotapicks.vercel.app)
```

### Step 5: Verify Cron Job
1. Go to Vercel Dashboard
2. Your Project > Cron Jobs
3. Verify that `api/cron/daily-search` is scheduled
4. Schedule: `0 6 * * *` (daily at 6 AM UTC)

### Step 6: Test Production Endpoint
```bash
# Replace with your actual URL and CRON_SECRET
curl -X POST https://yourtoyotapicks.vercel.app/api/cron/daily-search \
  -H "Authorization: Bearer your-cron-secret"

# Or use the test script
./scripts/test-cron.sh https://yourtoyotapicks.vercel.app
```

## Monitoring

### View Cron Job Logs
```bash
# Real-time logs
vercel logs --follow

# Or via Dashboard:
# Project > Deployments > Functions > api/cron/daily-search
```

### Check Database
```sql
-- Recent listings
SELECT
  make,
  model,
  year,
  price,
  mileage,
  created_at
FROM curated_listings
ORDER BY created_at DESC
LIMIT 10;

-- Search log history
SELECT
  search_date,
  total_listings_fetched,
  final_curated_count,
  execution_time_seconds,
  error_count
FROM search_logs
ORDER BY created_at DESC
LIMIT 10;
```

### Dashboard Access
Navigate to your deployed URL to view the dashboard:
```
https://yourtoyotapicks.vercel.app/dashboard
```

## Troubleshooting

### Cron Job Not Running
1. Check Vercel Dashboard > Cron Jobs
2. Verify `vercel.json` is in root directory
3. Check logs: `vercel logs`

### Database Connection Issues
1. Verify Supabase credentials in Vercel env vars
2. Check service role key has admin permissions
3. Test connection: `GET /api/cron/daily-search`

### No Listings Stored
1. Check filter criteria in `lib/filters.ts`
2. Run local test to see rejection reasons
3. Check search_logs table for error details

## Environment Variables Reference

### Required
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbG...` |
| `CRON_SECRET` | Secret for cron auth | `openssl rand -base64 32` |

### Optional (with defaults)
| Variable | Description | Default |
|----------|-------------|---------|
| `DATA_SOURCE` | Data source to use | `mock` |
| `SKIP_VIN_VALIDATION` | Skip VIN checks (dev only) | `true` |
| `NODE_ENV` | Environment | `development` |

## Cron Schedule

Default: Daily at 6 AM UTC (`0 6 * * *`)

To change, edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-search",
      "schedule": "0 6 * * *"  // Change this
    }
  ]
}
```

Common schedules:
- Every 12 hours: `0 */12 * * *`
- Every Monday at 8 AM: `0 8 * * 1`
- Twice daily (6 AM & 6 PM): `0 6,18 * * *`

## Costs

Current setup is **100% free**:
- ✅ Vercel: Free tier (cron jobs included)
- ✅ Supabase: Free tier (500 MB database)
- ✅ Mock Data: Free (unlimited)
- ✅ NHTSA API: Free (government API)
- ✅ Auto.dev API: Free tier (1000 calls/month)

## Next Steps

1. **Test with Real Data**
   - Implement Auto.dev API integration
   - Set `DATA_SOURCE=auto.dev`
   - Monitor API usage

2. **Add Notifications**
   - Email alerts for new listings
   - SMS for high-priority vehicles
   - Slack integration

3. **Enhance Monitoring**
   - Set up error alerts (Sentry)
   - Add performance monitoring
   - Create admin dashboard for cron stats

4. **Production Optimizations**
   - Add retry logic
   - Implement circuit breaker
   - Optimize database queries
   - Add caching layer

## Support

- Documentation: See `FEATURE_11_CRON_JOB.md`
- Issues: Check troubleshooting section
- Logs: `vercel logs` or Vercel Dashboard
