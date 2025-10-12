# Database Setup Guide - YourToyotaPicks

This guide will walk you through setting up the Supabase database for the YourToyotaPicks project.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- Git repository cloned locally

## Step 1: Create a Supabase Project

1. **Go to Supabase Dashboard**
   - Visit https://app.supabase.com
   - Click "New Project"

2. **Configure Your Project**
   - **Organization**: Select or create an organization
   - **Project Name**: `yourtoyotapicks` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users (e.g., `us-east-1` for East Coast)
   - **Pricing Plan**: Start with the Free tier ($0/month)

3. **Wait for Project Setup**
   - This usually takes 1-2 minutes
   - You'll be redirected to your project dashboard when ready

## Step 2: Get Your API Keys

1. **Navigate to Project Settings**
   - Click the gear icon in the sidebar
   - Go to "API" section

2. **Copy Your Keys**
   You'll need three values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: Starts with `eyJhbG...` (safe for client-side)
   - **service_role key**: Starts with `eyJhbG...` (keep secret, server-only)

3. **Update Your Environment Variables**
   ```bash
   # Copy the example file
   cp .env.local.example .env.local

   # Edit .env.local with your actual values
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your_service_role_key
   ```

## Step 3: Run the Database Schema

1. **Open SQL Editor**
   - In your Supabase dashboard, click "SQL Editor" in the sidebar
   - Click "New Query"

2. **Copy the Schema File**
   - Open `/lib/database.sql` in your code editor
   - Copy the entire contents

3. **Paste and Execute**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" or press `Cmd/Ctrl + Enter`
   - You should see "Success. No rows returned" (this is expected)

4. **Verify Tables Were Created**
   - Click "Table Editor" in the sidebar
   - You should see two tables:
     - `curated_listings`
     - `search_logs`

## Step 4: Verify RLS Policies

1. **Check Row Level Security**
   - Go to "Authentication" → "Policies"
   - Verify you see policies for:
     - `curated_listings` (2 policies)
     - `search_logs` (2 policies)

2. **Test Public Read Access**
   - The policies allow public read access (no authentication required)
   - Service role has full access for the cron job

## Step 5: Install Supabase Client

The Supabase JavaScript client should already be installed. If not:

```bash
npm install @supabase/supabase-js
```

## Step 6: Test the Connection

Create a test script to verify everything works:

```typescript
// test-db.ts
import { testConnection, getDatabaseHealth } from './lib/supabase';

async function test() {
  console.log('Testing database connection...');

  const isConnected = await testConnection();
  console.log('Connected:', isConnected);

  if (isConnected) {
    const health = await getDatabaseHealth();
    console.log('Database Health:', health);
  }
}

test();
```

Run it:
```bash
npx tsx test-db.ts
```

Expected output:
```
Testing database connection...
Connected: true
Database Health: {
  connected: true,
  listingCount: 0,
  recentListingCount: 0,
  lastSearchDate: undefined
}
```

## Database Schema Overview

### Table: `curated_listings`

Stores all vehicles that pass the filtering pipeline.

**Key Fields:**
- `vin`: Unique vehicle identification number (17 characters)
- `make`, `model`, `year`: Vehicle identification
- `price`, `mileage`: Core filter criteria
- `age_in_years`, `mileage_per_year`: Auto-calculated fields
- `mileage_rating`: `excellent` | `good` | `acceptable`
- `title_status`: Always `clean` (enforced by CHECK constraint)
- `accident_count`: Always `0` (enforced by CHECK constraint)
- `owner_count`: Always `1` or `2` (enforced by CHECK constraint)
- `priority_score`: Model-based ranking (1-10)
- `images_url`: JSONB array of image URLs
- `vin_decode_data`, `vin_history_data`: JSONB with full API responses

**Indexes:**
- VIN (unique)
- Make/Model combination
- Price, Mileage, Year
- Priority score + mileage (for default sorting)
- Created date (for recent listings)
- Reviewed status

### Table: `search_logs`

Tracks daily search execution metrics.

**Key Fields:**
- `search_date`: Date of the search execution
- `total_listings_fetched`: Raw count from API
- `listings_after_basic_filter`: After price/mileage/year filters
- `listings_after_vin_validation`: After NHTSA VIN check
- `listings_after_history_check`: After VinAudit check
- `final_curated_count`: Actual vehicles stored
- `api_cost_usd`: Estimated API costs for the run
- `execution_time_seconds`: Performance tracking
- `error_count`, `error_details`: Debugging information

## Using the Database

### In Your Application

Import the helper functions:

```typescript
import {
  getListings,
  getListingByVin,
  getListingById,
  insertListing,
  updateListing,
  markAsReviewed,
  getRecentListings,
  getListingStats,
  insertSearchLog,
  getSearchLogs,
  getSearchStats
} from '@/lib/supabase';
```

### Example: Get All Listings

```typescript
const { data, total, hasMore } = await getListings({
  makes: ['Toyota'],
  priceMax: 18000,
  mileageMax: 100000,
  sortBy: 'priority',
  limit: 20
});
```

### Example: Get a Specific Vehicle

```typescript
const vehicle = await getListingByVin('JT2BF18K2X0123456');
```

### Example: Insert a New Listing (Cron Job)

```typescript
import { insertListing } from '@/lib/supabase';
import type { VehicleInsert } from '@/lib/types';

const newListing: VehicleInsert = {
  vin: 'JT2BF18K2X0123456',
  make: 'Toyota',
  model: 'RAV4',
  year: 2018,
  price: 16500,
  mileage: 95000,
  title_status: 'clean',
  accident_count: 0,
  owner_count: 1,
  is_rental: false,
  is_fleet: false,
  has_lien: false,
  flood_damage: false,
  state_of_origin: 'CA',
  is_rust_belt_state: false,
  current_location: 'Silver Spring, MD',
  distance_miles: 12,
  priority_score: 10,
  flag_rust_concern: false,
  source_platform: 'Marketcheck',
  source_url: 'https://example.com/listing',
  images_url: ['https://example.com/image1.jpg'],
  reviewed_by_user: false
};

const inserted = await insertListing(newListing);
```

### Example: Log a Search Run

```typescript
import { insertSearchLog } from '@/lib/supabase';

await insertSearchLog({
  search_date: new Date().toISOString().split('T')[0],
  total_listings_fetched: 150,
  listings_after_basic_filter: 45,
  listings_after_vin_validation: 32,
  listings_after_history_check: 8,
  final_curated_count: 8,
  api_calls_made: 40,
  api_cost_usd: 4.50,
  execution_time_seconds: 125.3,
  error_count: 0
});
```

## TypeScript Types

All database types are defined in `/lib/types.ts`:

- `Vehicle`: Complete listing record
- `ListingSummary`: Simplified view for cards/lists
- `VehicleInsert`: For inserting new records
- `VehicleUpdate`: For updating existing records
- `SearchLog`: Search execution log
- `FilterCriteria`: Query parameters
- `VINDecodeData`: NHTSA API response
- `VINHistoryData`: VinAudit API response

## Security Notes

### Row Level Security (RLS)

- **Public Read Access**: Anyone can view listings and search logs
- **Write Access**: Only the service role can insert/update/delete
- **Service Role**: Used by cron jobs and API routes (server-side only)

### Environment Variables

⚠️ **NEVER commit `.env.local` to git!**

- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` must ONLY be used server-side
- The service role bypasses all RLS policies

### API Routes

When creating API routes that write to the database:

```typescript
// app/api/cron/route.ts
import { getServiceRoleClient } from '@/lib/supabase';

export async function POST(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Use service role client for writes
  const supabase = getServiceRoleClient();

  // ... your cron job logic
}
```

## Monitoring & Maintenance

### View Database Activity

1. Go to Supabase Dashboard → "Database" → "Query Performance"
2. Monitor slow queries and optimize indexes if needed

### Check Table Sizes

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Backup Your Data

Supabase automatically backs up your database daily. To export manually:

1. Go to "Database" → "Backups"
2. Click "Download backup"

## Troubleshooting

### Connection Issues

**Problem**: "Missing Supabase environment variables"

**Solution**:
- Verify `.env.local` exists and has correct values
- Restart your dev server after changing environment variables

**Problem**: "Failed to fetch" or CORS errors

**Solution**:
- Check that your Supabase project URL is correct
- Verify the anon key matches your project
- Check Supabase dashboard for service outages

### RLS Policy Issues

**Problem**: "Row level security policy violation"

**Solution**:
- For read operations: Use the anon client (`supabase`)
- For write operations: Use `getServiceRoleClient()`
- Verify policies are enabled in the dashboard

### Insert Constraint Violations

**Problem**: "New row violates check constraint"

**Solution**:
- Check that `title_status` is exactly `'clean'`
- Verify `accident_count` is `0`
- Ensure `owner_count` is `1` or `2`
- Confirm `price` is between 10000 and 20000
- Verify `mileage` is ≤ 160000

## Next Steps

1. ✅ Database schema is set up
2. ✅ Environment variables are configured
3. ✅ TypeScript types are defined
4. ✅ Helper functions are ready

**Next tasks:**
- Set up data source API integrations (Marketcheck/Auto.dev)
- Implement VIN validation with NHTSA API
- Create the cron job for daily searches
- Build the dashboard UI to display listings

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

If you encounter issues:

1. Check the [Supabase Status Page](https://status.supabase.com/)
2. Review the [Supabase Community Forum](https://github.com/supabase/supabase/discussions)
3. Check your browser console and terminal for error messages
4. Verify your API keys are correct and not expired
