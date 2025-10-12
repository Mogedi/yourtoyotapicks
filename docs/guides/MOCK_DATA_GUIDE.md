# Mock Data Generator - Usage Guide

This guide explains how to use the mock data generator for testing the YourToyotaPicks application.

## Overview

The mock data system provides **32 realistic vehicle listings** with a mix of passing and failing criteria to thoroughly test filtering and display functionality.

## Files Created

1. **`lib/mock-data.ts`** - Mock data generator with 32 realistic Toyota/Honda vehicle listings
2. **`app/api/listings/seed/route.ts`** - API endpoint to insert mock data into Supabase
3. **`scripts/seed-database.sh`** - Convenience script for seeding the database

## Mock Data Statistics

### Total Listings: 32

#### By Filter Status:
- **Passing (Good Cars)**: 12 listings
- **Failing**: 20 listings broken down as:
  - Price failures (>$35,000): 6 listings
  - High mileage (>120,000 miles): 4 listings
  - Multiple accidents (2+): 3 listings
  - Too many owners (3+): 3 listings
  - Rental/Fleet vehicles: 2 listings
  - Rust belt states: 2 listings

#### By Make:
- **Toyota**: 19 listings
- **Honda**: 14 listings (error in previous count, actually 13)

#### By Model:
- RAV4: 5 listings
- Camry: 5 listings
- CR-V: 4 listings
- Accord: 4 listings
- Corolla: 3 listings
- Civic: 3 listings
- Pilot: 2 listings
- Highlander: 2 listings
- 4Runner: 2 listings
- HR-V: 1 listing
- C-HR: 1 listing

## How to Use

### Method 1: Using the Shell Script (Easiest)

```bash
# 1. Start your Next.js dev server
npm run dev

# 2. Run the seed script
./scripts/seed-database.sh

# To keep existing listings and add mock data:
./scripts/seed-database.sh --keep-existing
```

### Method 2: Using cURL

```bash
# Clear existing data and insert mock data (default)
curl -X POST http://localhost:3000/api/listings/seed \
  -H "Content-Type: application/json" \
  -d '{"clearExisting": true}'

# Keep existing data and add mock data
curl -X POST http://localhost:3000/api/listings/seed \
  -H "Content-Type: application/json" \
  -d '{"clearExisting": false}'

# Check seed status (GET request)
curl http://localhost:3000/api/listings/seed
```

### Method 3: Using JavaScript/TypeScript

```typescript
// In a client component or API route
const response = await fetch('/api/listings/seed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    clearExisting: true, // or false to keep existing data
  }),
});

const result = await response.json();
console.log(result);
```

### Method 4: Using Postman/Thunder Client

1. Create a POST request to `http://localhost:3000/api/listings/seed`
2. Set header: `Content-Type: application/json`
3. Body (raw JSON):
   ```json
   {
     "clearExisting": true
   }
   ```
4. Send request

## API Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Successfully seeded 32 listings",
  "stats": {
    "inserted": 32,
    "cleared": true,
    "mockDataStats": {
      "total": 32,
      "passing": 12,
      "failing": {
        "price": 6,
        "mileage": 4,
        "accidents": 3,
        "owners": 3,
        "rental_fleet": 2,
        "rust_belt": 2
      },
      "byMake": {
        "Toyota": 19,
        "Honda": 13
      },
      "byModel": {
        "RAV4": 5,
        "Camry": 5,
        "CR-V": 4,
        "Accord": 4,
        // ... etc
      }
    }
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Failed to insert mock listings",
  "error": "Detailed error message here"
}
```

## Example Mock Listings

### Excellent Listing Example (Passes All Filters):
```typescript
{
  vin: "4T1XXXXXXXXXXXXXXX",
  make: "Toyota",
  model: "RAV4",
  year: 2021,
  price: 26500,           // Under $35,000 ✓
  mileage: 28000,         // Low mileage ✓
  mileage_rating: "excellent",
  accident_count: 0,      // No accidents ✓
  owner_count: 1,         // Single owner ✓
  is_rental: false,       // Not a rental ✓
  is_fleet: false,        // Not a fleet ✓
  state_of_origin: "CA",
  is_rust_belt_state: false, // Clean state ✓
  // ... other fields
}
```

### Failed Listing Examples:

**Price Failure:**
```typescript
{
  model: "Highlander",
  year: 2022,
  price: 42500,  // Over $35,000 ✗
  mileage: 22000,
  accident_count: 0,
  owner_count: 1,
  // ... passes all other criteria
}
```

**High Mileage:**
```typescript
{
  model: "CR-V",
  year: 2017,
  price: 18500,
  mileage: 135000,  // Over 120,000 miles ✗
  accident_count: 0,
  owner_count: 2,
}
```

**Accident History:**
```typescript
{
  model: "RAV4",
  year: 2018,
  price: 21200,
  mileage: 68000,
  accident_count: 3,  // Multiple accidents ✗
  owner_count: 2,
}
```

**Too Many Owners:**
```typescript
{
  model: "Camry",
  year: 2018,
  price: 18900,
  mileage: 72000,
  accident_count: 0,
  owner_count: 4,  // More than 2 owners ✗
}
```

**Rental/Fleet:**
```typescript
{
  model: "Accord",
  year: 2020,
  price: 20500,
  mileage: 62000,
  accident_count: 0,
  owner_count: 1,
  is_rental: true,  // Former rental ✗
}
```

**Rust Belt:**
```typescript
{
  model: "CR-V",
  year: 2018,
  price: 19500,
  mileage: 68000,
  state_of_origin: "OH",
  is_rust_belt_state: true,  // Rust belt state ✗
  flag_rust_concern: true,
}
```

## Testing Filters

Use the mock data to test various filter combinations:

### Test Scenarios:

1. **Basic Filters:**
   - Price range: $15,000 - $35,000
   - Max mileage: 120,000
   - Should return 12 excellent listings

2. **Owner Filter:**
   - Max 2 owners
   - Should exclude 3 listings with 3+ owners

3. **Accident Filter:**
   - Max 1 accident
   - Should exclude 3 listings with 2+ accidents

4. **Rental/Fleet Filter:**
   - Exclude rental and fleet
   - Should exclude 2 listings

5. **Rust Belt Filter:**
   - Exclude rust belt states
   - Should exclude 2 listings from OH and MI

6. **Combined Filters:**
   - All filters enabled
   - Should return only the 12 excellent listings

7. **Make Filter:**
   - Toyota only: 19 listings
   - Honda only: 13 listings

8. **Model Filter:**
   - RAV4: 5 listings
   - Camry: 5 listings
   - CR-V: 4 listings
   - etc.

## Important Notes

1. **Development Only**: The seed endpoint is only available in development mode. It will return a 403 error in production.

2. **Data Persistence**: Mock data is inserted into your actual Supabase database. Use the `clearExisting: true` option to remove old test data.

3. **VIN Numbers**: VINs are randomly generated using realistic Toyota/Honda manufacturer codes (WMI). They follow the 17-character format but may not decode properly in VIN lookup services.

4. **Realistic Data**: All listings use realistic:
   - Vehicle models (current Toyota/Honda lineup)
   - Price ranges ($12,800 - $45,800)
   - Mileage ranges (8,000 - 152,000)
   - US locations and dealer names
   - Mix of model years (2016-2023)

5. **Priority Scores**: Listings have priority scores (0-100) based on how well they meet criteria. Excellent listings score 87-96, while failing listings score 28-68.

## Troubleshooting

### "Cannot reach API endpoint"
- Make sure your Next.js dev server is running: `npm run dev`
- Check that it's running on port 3000
- Try accessing http://localhost:3000 in your browser

### "Missing Supabase environment variables"
- Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- For seeding, also need `SUPABASE_SERVICE_ROLE_KEY`

### "Database connection error"
- Check Supabase project is running
- Verify credentials in `.env.local`
- Check network connection

### "Seed endpoint not allowed"
- Only works in development mode
- Set `NODE_ENV=development` or run with `npm run dev`

## Next Steps

After seeding the database:

1. View listings in your app
2. Test filter functionality
3. Verify sorting works correctly
4. Test pagination with 32 listings
5. Check individual listing detail pages
6. Test user rating and notes functionality

## Extending Mock Data

To add more listings or modify existing ones:

1. Edit `lib/mock-data.ts`
2. Add new listings to the `mockListings` array
3. Follow the existing structure and use the `VehicleInsert` type
4. Update `mockDataStats` if needed
5. Run the seed script again

## Questions?

Refer to:
- `lib/types.ts` - For Vehicle interface details
- `lib/supabase.ts` - For database operations
- Supabase documentation - For RLS and table structure
