# Quick Start - Seed Database

## TL;DR

```bash
# Start dev server
npm run dev

# Seed database with 32 mock listings
./scripts/seed-database.sh
```

## What You Get

- **32 realistic vehicle listings**
  - 12 excellent listings (pass all filters)
  - 20 failing listings (test edge cases)
- Mix of Toyota (19) and Honda (13) models
- Variety of years, prices, mileages, and conditions

## Test Scenarios

| Filter Criteria | Should Show |
|----------------|-------------|
| All filters OFF | 32 listings |
| Price ≤ $35,000 | 26 listings |
| Mileage ≤ 120,000 | 28 listings |
| Max 2 owners | 29 listings |
| No accidents | 29 listings |
| No rental/fleet | 30 listings |
| No rust belt | 30 listings |
| **ALL filters ON** | **12 listings** |

## cURL Commands

```bash
# Seed (clear and insert)
curl -X POST http://localhost:3000/api/listings/seed \
  -H "Content-Type: application/json" \
  -d '{"clearExisting": true}'

# Seed (keep existing)
curl -X POST http://localhost:3000/api/listings/seed \
  -H "Content-Type: application/json" \
  -d '{"clearExisting": false}'

# Check status
curl http://localhost:3000/api/listings/seed
```

## Distribution Details

### By Model
- RAV4: 5 | Camry: 5 | CR-V: 4 | Accord: 4
- Corolla: 3 | Civic: 3 | Pilot: 2 | Highlander: 2
- 4Runner: 2 | HR-V: 1 | C-HR: 1

### By Failure Type
- Price > $35,000: 6 listings
- Mileage > 120k: 4 listings
- 2+ accidents: 3 listings
- 3+ owners: 3 listings
- Rental/fleet: 2 listings
- Rust belt: 2 listings

## Full Documentation

See `MOCK_DATA_GUIDE.md` for complete details.
