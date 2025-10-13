# Implementation Plan: YourToyotaPicks MVP

## 🎯 Goal
Build a fully functional car search automation tool with web dashboard using **100% free resources** initially, with incremental features that can be tested independently.

---

## 🆓 Free Resources Stack

| Component | Tool | Free Tier Limits | Notes |
|-----------|------|------------------|-------|
| **Frontend** | Next.js 15 + TypeScript | Unlimited | Open source |
| **Styling** | Tailwind CSS + shadcn/ui | Unlimited | Open source |
| **Hosting** | Vercel | 100GB bandwidth, 100 serverless functions | Plenty for personal use |
| **Database** | Supabase | 500MB storage, 50K rows | ~5000 car listings |
| **VIN Decode** | NHTSA vPIC API | Unlimited, free forever | Government API |
| **Test Data** | Auto.dev API | 1000 calls/month free | For initial testing |
| **Email** | Resend | 100 emails/day free | For notifications later |
| **Version Control** | GitHub | Unlimited private repos | Standard |

**Total Monthly Cost: $0** (until you need paid APIs for production data)

---

## 📊 Project Structure

```
yourtoyotapicks/
├── app/                      # Next.js 15 App Router
│   ├── page.tsx             # Landing/Dashboard
│   ├── dashboard/
│   │   ├── page.tsx         # Main dashboard
│   │   └── [vin]/page.tsx   # Vehicle detail view
│   ├── api/
│   │   ├── listings/        # Get listings
│   │   ├── vin-check/       # VIN validation
│   │   └── cron/            # Daily job
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── VehicleCard.tsx      # Car listing card
│   ├── VehicleList.tsx      # List view
│   ├── FilterBar.tsx        # Filters
│   └── VehicleDetail.tsx    # Detail view
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── vin-decoder.ts       # NHTSA API integration
│   ├── filters.ts           # Filter logic
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utilities
├── config/
│   └── search-settings.json # User preferences
├── public/                   # Static assets
├── CLAUDE.md                # (existing)
├── TECHNICAL_SPEC.md        # (existing)
├── overview.md              # (existing)
└── IMPLEMENTATION_PLAN.md   # This file
```

---

## 🚀 Implementation Phases

### **Phase 1: Foundation Setup** (Features 1-3)
**Goal**: Get basic Next.js app running with database connection

### **Phase 2: Data Layer** (Features 4-6)
**Goal**: VIN decoder + filter engine + mock data

### **Phase 3: Dashboard UI** (Features 7-10)
**Goal**: Complete dashboard with all views and interactions

### **Phase 4: Automation** (Features 11-12)
**Goal**: Cron jobs and notification system

---

## ✅ Feature Breakdown & Progress Tracker

### Phase 1: Foundation Setup

#### ✅ Feature 1: Initialize Next.js Project
**Status**: ⬜ Not Started
**Estimated Time**: 15 minutes
**Parallelization**: None (must complete first)

**Tasks**:
- [ ] Run `npx create-next-app@latest yourtoyotapicks` with TypeScript, Tailwind, App Router
- [ ] Install dependencies: `shadcn/ui`, `@supabase/supabase-js`, `date-fns`, `lucide-react`
- [ ] Set up `components/ui` folder for shadcn components
- [ ] Create basic folder structure (lib/, components/, config/)
- [ ] Test dev server runs: `npm run dev`

**Deliverable**: Working Next.js app at `localhost:3000`

**Commands**:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install @supabase/supabase-js lucide-react date-fns
npx shadcn@latest init
```

---

#### ✅ Feature 2: Set Up Supabase Database
**Status**: ⬜ Not Started
**Estimated Time**: 20 minutes
**Parallelization**: Can run in parallel with Feature 3

**Tasks**:
- [ ] Create Supabase account (free tier)
- [ ] Create new project: "yourtoyotapicks"
- [ ] Copy connection strings to `.env.local`
- [ ] Create `curated_listings` table via SQL editor
- [ ] Create `search_logs` table
- [ ] Set up Row Level Security (RLS) policies (public read for now)
- [ ] Test connection from Next.js

**Deliverable**: Connected database with tables created

**SQL Schema** (use this in Supabase SQL Editor):
```sql
-- See TECHNICAL_SPEC.md for full schema
CREATE TABLE curated_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin VARCHAR(17) NOT NULL UNIQUE,
  make VARCHAR(20) NOT NULL CHECK (make IN ('Toyota', 'Honda')),
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 2015 AND year <= 2025),
  price INTEGER NOT NULL CHECK (price >= 10000 AND price <= 20000),
  mileage INTEGER NOT NULL CHECK (mileage <= 160000),
  -- ... (see full schema in TECHNICAL_SPEC.md)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_curated_make_model ON curated_listings(make, model);
CREATE INDEX idx_curated_created ON curated_listings(created_at DESC);
```

**🔄 PARALLEL OPPORTUNITY**: Run Feature 2 and Feature 3 simultaneously with separate sub-agents

---

#### ✅ Feature 3: Create Basic Dashboard Layout
**Status**: ⬜ Not Started
**Estimated Time**: 30 minutes
**Parallelization**: Can run in parallel with Feature 2

**Tasks**:
- [ ] Install shadcn components: `button`, `card`, `badge`, `input`, `select`
- [ ] Create root layout with header/nav
- [ ] Create `/dashboard` page with empty state
- [ ] Add basic navigation (Home, Dashboard, Settings)
- [ ] Create loading and error states
- [ ] Test responsive design (mobile/desktop)

**Deliverable**: Empty dashboard page with navigation

**shadcn Components to Install**:
```bash
npx shadcn@latest add button card badge input select
npx shadcn@latest add dropdown-menu avatar separator
```

**🔄 PARALLEL OPPORTUNITY**: Run Feature 2 and Feature 3 simultaneously with separate sub-agents

---

### Phase 2: Data Layer

#### ✅ Feature 4: Implement NHTSA VIN Decoder Integration
**Status**: ⬜ Not Started
**Estimated Time**: 25 minutes
**Parallelization**: None (needed for Feature 5)

**Tasks**:
- [ ] Create `lib/vin-decoder.ts` with NHTSA API client
- [ ] Implement `decodeVIN(vin: string)` function
- [ ] Add TypeScript types for VIN response
- [ ] Create error handling for invalid VINs
- [ ] Add unit tests
- [ ] Create API route: `/api/vin-check/[vin]`

**Deliverable**: Working VIN decoder API endpoint

**Code Structure**:
```typescript
// lib/vin-decoder.ts
export async function decodeVIN(vin: string): Promise<VINData> {
  const response = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
  );
  // Parse and return
}

// app/api/vin-check/[vin]/route.ts
export async function GET(request: Request, { params }) {
  const vinData = await decodeVIN(params.vin);
  return Response.json(vinData);
}
```

**Test URL**: `http://localhost:3000/api/vin-check/5YFBURHE5HP123456`

---

#### ✅ Feature 5: Build Filter Engine
**Status**: ⬜ Not Started
**Estimated Time**: 45 minutes
**Parallelization**: Can build while Feature 6 runs in parallel

**Tasks**:
- [ ] Create `lib/filters.ts` with all filter functions
- [ ] Implement `filterByPrice()`, `filterByMileage()`, `filterByAge()`
- [ ] Implement `calculateMileageRating()` (excellent/good/acceptable)
- [ ] Implement `checkRustBeltState()`
- [ ] Implement `calculatePriorityScore()`
- [ ] Add TypeScript types for all filter functions
- [ ] Create comprehensive unit tests
- [ ] Document filter logic with JSDoc comments

**Deliverable**: Complete filter engine with tests

**Code Structure**:
```typescript
// lib/filters.ts
export interface FilterCriteria {
  priceMin: number;
  priceMax: number;
  yearMin: number;
  mileagePerYearIdeal: number;
  mileagePerYearMax: number;
  maxOwners: number;
  // ...
}

export function applyFilters(
  listing: RawListing,
  criteria: FilterCriteria
): { pass: boolean; reasons: string[] } {
  // Return pass/fail with reasons
}

export function calculateMileageRating(
  mileage: number,
  age: number
): 'excellent' | 'good' | 'acceptable' {
  // Logic from TECHNICAL_SPEC.md
}
```

**🔄 PARALLEL OPPORTUNITY**: Build filter engine while Feature 6 generates mock data

---

#### ✅ Feature 6: Create Mock Data Generator
**Status**: ⬜ Not Started
**Estimated Time**: 30 minutes
**Parallelization**: Can run in parallel with Feature 5

**Tasks**:
- [ ] Create `lib/mock-data.ts` with realistic car data
- [ ] Generate 20-30 mock Toyota/Honda listings
- [ ] Include mix of passing/failing listings (to test filters)
- [ ] Add variety: different models, prices, mileages, VINs
- [ ] Create seed script to populate Supabase
- [ ] Add API route: `/api/listings/seed` (dev only)

**Deliverable**: Mock data in database for testing

**Code Structure**:
```typescript
// lib/mock-data.ts
export const mockListings: RawListing[] = [
  {
    vin: '5YFBURHE5HP123456',
    make: 'Toyota',
    model: 'RAV4',
    year: 2018,
    price: 16500,
    mileage: 95000,
    // ... full mock data
  },
  // ... 20-30 more
];

// app/api/listings/seed/route.ts
export async function POST() {
  // Insert mock data into Supabase
}
```

**🔄 PARALLEL OPPORTUNITY**: Run Feature 5 and Feature 6 simultaneously with separate sub-agents

---

### Phase 3: Dashboard UI

#### ✅ Feature 7: Build Vehicle Card Component
**Status**: ⬜ Not Started
**Estimated Time**: 40 minutes
**Parallelization**: Can run in parallel with Feature 8

**Tasks**:
- [ ] Create `components/VehicleCard.tsx`
- [ ] Display: image, make/model/year, price, mileage, location
- [ ] Add badges: mileage rating, owner count, priority
- [ ] Add flags: rust concern, excellent mileage
- [ ] Implement "View Details" button
- [ ] Add hover effects and responsive design
- [ ] Include placeholder image (if no image available)
- [ ] Test with various data states

**Deliverable**: Reusable VehicleCard component

**Design**:
```
┌─────────────────────────────────┐
│  [Car Image]                    │
│                                  │
│  2018 Toyota RAV4 XLE           │
│  $16,500 • 95K miles            │
│  📍 Silver Spring, MD (12 mi)   │
│                                  │
│  ✅ 1 Owner  ⭐ Excellent        │
│  🏆 Priority: High              │
│                                  │
│  [View Details →]               │
└─────────────────────────────────┘
```

**🔄 PARALLEL OPPORTUNITY**: Build VehicleCard while Feature 8 builds list logic

---

#### ✅ Feature 8: Create List View with Filtering/Sorting
**Status**: ⬜ Not Started
**Estimated Time**: 50 minutes
**Parallelization**: Can run in parallel with Feature 7

**Tasks**:
- [ ] Create `components/VehicleList.tsx`
- [ ] Create `components/FilterBar.tsx` with controls
- [ ] Implement client-side filtering (make, model, price range)
- [ ] Implement sorting (price, mileage, date added, priority)
- [ ] Add search by VIN or model
- [ ] Display result count: "Showing 5 vehicles"
- [ ] Add empty state: "No vehicles match your filters"
- [ ] Test with mock data

**Deliverable**: Functional list view with filters

**Filter Controls**:
- Make dropdown (Toyota, Honda, All)
- Model dropdown (RAV4, CR-V, etc.)
- Price range slider
- Mileage rating filter (Excellent, Good, All)
- Sort by dropdown

**🔄 PARALLEL OPPORTUNITY**: Run Feature 7 and Feature 8 simultaneously with separate sub-agents

---

#### ✅ Feature 9: Add Detailed Vehicle View Page
**Status**: ⬜ Not Started
**Estimated Time**: 45 minutes
**Parallelization**: None (needs Features 7 & 8 complete)

**Tasks**:
- [ ] Create `/dashboard/[vin]/page.tsx` dynamic route
- [ ] Display all vehicle details (full specs from VIN decode)
- [ ] Show VIN history summary (when available)
- [ ] Add image gallery (if multiple images)
- [ ] Display filter pass/fail details
- [ ] Add "View on Source" button → external listing
- [ ] Add "Check VIN" button → NHTSA or VinAudit link
- [ ] Implement back navigation to dashboard

**Deliverable**: Complete vehicle detail page

**Layout Sections**:
1. Hero: Large image + key stats
2. Specifications: Year, make, model, mileage, price
3. VIN Information: Decode results, history (if available)
4. Filter Results: Which filters passed/failed
5. Actions: View source, check VIN, mark as reviewed

---

#### ✅ Feature 10: Implement Review/Rating System
**Status**: ⬜ Not Started
**Estimated Time**: 35 minutes
**Parallelization**: None (needs Feature 9 complete)

**Tasks**:
- [ ] Add star rating component (1-5 stars)
- [ ] Add "Mark as Reviewed" checkbox
- [ ] Add notes textarea
- [ ] Create API route: `/api/listings/[vin]/review` (PATCH)
- [ ] Update Supabase record on review
- [ ] Add "Reviewed" badge to card component
- [ ] Filter by review status in list view

**Deliverable**: Working review system with persistence

**UI Elements**:
- Star rating (click to rate)
- "Mark as Reviewed" toggle
- Notes field (optional)
- "Save Review" button

---

### Phase 4: Automation

#### ✅ Feature 11: Create Vercel Cron Job for Daily Execution
**Status**: ⬜ Not Started
**Estimated Time**: 40 minutes
**Parallelization**: Can develop while Feature 12 runs in parallel

**Tasks**:
- [ ] Create `app/api/cron/daily-search/route.ts`
- [ ] Implement full pipeline (fetch → filter → VIN check → store)
- [ ] Add logging to `search_logs` table
- [ ] Configure `vercel.json` with cron schedule (daily 6 AM)
- [ ] Add CRON_SECRET env variable for security
- [ ] Test locally with manual API call
- [ ] Deploy to Vercel and verify cron runs

**Deliverable**: Automated daily search pipeline

**Vercel Cron Config** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-search",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Pipeline Flow**:
1. Fetch listings from API (Auto.dev free tier)
2. Apply all filters
3. Validate VINs with NHTSA
4. Store passing vehicles in Supabase
5. Log execution to `search_logs`

**🔄 PARALLEL OPPORTUNITY**: Build cron job while Feature 12 builds email system

---

#### ✅ Feature 12: Build Notification System (Email-Ready)
**Status**: ⬜ Not Started
**Estimated Time**: 45 minutes
**Parallelization**: Can run in parallel with Feature 11

**Tasks**:
- [ ] Install Resend SDK: `npm install resend`
- [ ] Create email templates (HTML + plaintext)
- [ ] Create `lib/email.ts` with send functions
- [ ] Create API route: `/api/notifications/send-digest`
- [ ] Implement daily/weekly digest logic
- [ ] Add user preferences to `config/search-settings.json`
- [ ] Test with Resend sandbox mode
- [ ] Trigger email when new high-priority vehicles found

**Deliverable**: Working email notification system

**Email Template** (Daily Digest):
```
Subject: 🚗 [3 New] Toyota/Honda Picks - Jan 15, 2025

Hi there,

Your daily search found 3 new vehicles:

1. 2018 Toyota RAV4 XLE - $16,500 | 95K miles
   View Details: [link]

2. 2019 Honda CR-V EX - $18,200 | 78K miles
   View Details: [link]

...

View Dashboard: [link]
```

**Resend Integration**:
```typescript
// lib/email.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailyDigest(vehicles: Vehicle[]) {
  await resend.emails.send({
    from: 'YourToyotaPicks <no-reply@yourtoyotapicks.com>',
    to: process.env.USER_EMAIL,
    subject: `🚗 [${vehicles.length} New] Toyota/Honda Picks`,
    html: generateEmailHTML(vehicles),
  });
}
```

**🔄 PARALLEL OPPORTUNITY**: Run Feature 11 and Feature 12 simultaneously with separate sub-agents

---

## 🎯 Milestone Checklist

### Milestone 1: Basic Infrastructure ✅
- [ ] Feature 1: Next.js project initialized
- [ ] Feature 2: Supabase database set up
- [ ] Feature 3: Dashboard layout created
- [ ] **Test**: Can view empty dashboard at `/dashboard`

### Milestone 2: Data Processing ✅
- [ ] Feature 4: VIN decoder working
- [ ] Feature 5: Filter engine complete
- [ ] Feature 6: Mock data in database
- [ ] **Test**: Can fetch and filter mock listings

### Milestone 3: Complete UI ✅
- [ ] Feature 7: Vehicle cards displaying correctly
- [ ] Feature 8: List view with filters/sorting
- [ ] Feature 9: Detail page with full specs
- [ ] Feature 10: Review system working
- [ ] **Test**: Can browse, filter, and review vehicles

### Milestone 4: Automation ✅
- [ ] Feature 11: Daily cron job running
- [ ] Feature 12: Email notifications working
- [ ] **Test**: End-to-end pipeline runs successfully

---

## 🔄 Parallelization Strategy

### Parallel Block 1: Foundation Setup
- **Agent 1**: Feature 2 (Supabase setup)
- **Agent 2**: Feature 3 (Dashboard layout)
- **Why**: No dependencies between database and UI scaffolding

### Parallel Block 2: Data Layer
- **Agent 1**: Feature 5 (Filter engine)
- **Agent 2**: Feature 6 (Mock data generator)
- **Why**: Can develop filter logic independently of data generation

### Parallel Block 3: UI Components
- **Agent 1**: Feature 7 (Vehicle card component)
- **Agent 2**: Feature 8 (List view logic)
- **Why**: Card component and list logic are independent

### Parallel Block 4: Automation
- **Agent 1**: Feature 11 (Cron job)
- **Agent 2**: Feature 12 (Email system)
- **Why**: Cron logic and email templates are independent

---

## 🧪 Testing Strategy

### After Each Feature
- [ ] Unit tests for utility functions
- [ ] Manual testing in browser
- [ ] Check responsive design (mobile/tablet/desktop)
- [ ] Verify TypeScript types

### Integration Testing
- [ ] End-to-end: API → Database → UI
- [ ] Test with various data scenarios (0 results, 50+ results, edge cases)
- [ ] Performance testing (load time, API response time)

### Pre-Launch Checklist
- [ ] All features working independently
- [ ] Database schema optimized with indexes
- [ ] Error handling for all API calls
- [ ] Loading states for all async operations
- [ ] Environment variables documented
- [ ] README.md updated with setup instructions

---

## 📈 Progress Tracking

### Overall Progress
- **Phase 1**: 0/3 features complete (0%)
- **Phase 2**: 0/3 features complete (0%)
- **Phase 3**: 0/4 features complete (0%)
- **Phase 4**: 0/2 features complete (0%)
- **Total**: 0/12 features complete (0%)

### Estimated Timeline
- **Phase 1**: ~1.5 hours
- **Phase 2**: ~1.5 hours
- **Phase 3**: ~3 hours
- **Phase 4**: ~1.5 hours
- **Testing & Polish**: ~1 hour
- **Total**: ~8-10 hours of development time

---

## 🚀 Deployment Steps

### 1. GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit: YourToyotaPicks MVP"
git remote add origin https://github.com/yourusername/yourtoyotapicks.git
git push -u origin main
```

### 2. Vercel Deployment
- Connect GitHub repo to Vercel
- Add environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `RESEND_API_KEY`
  - `CRON_SECRET`
  - `USER_EMAIL`
- Deploy and verify cron job runs

### 3. Domain Setup (Optional)
- Add custom domain in Vercel
- Configure DNS records
- Enable HTTPS

---

## 🎓 Next Steps After MVP

### Upgrade to Production Data
1. Sign up for Marketcheck API (if budget allows)
2. Replace mock data with real API calls
3. Implement Auto.dev API integration (use free tier)
4. Add VinAudit API for full history checks

### Feature Enhancements
- Export to CSV/PDF
- SMS notifications via Twilio
- Advanced filtering (by features, dealer type)
- Price tracking over time
- Comparison tool (side-by-side)

### Scaling
- Add user authentication (Supabase Auth)
- Multi-user support
- Regional preferences
- More brands (Mazda, Subaru, Lexus)

---

## 📝 Notes

- All features are independently testable
- No feature requires paid services initially
- Can upgrade to paid APIs incrementally
- Focus on quality over speed
- Document as you build
- Commit after each feature completion

---

## 🆘 Troubleshooting

### Common Issues
- **Supabase connection fails**: Check `.env.local` has correct keys
- **VIN decoder returns 404**: Verify VIN format (17 characters, alphanumeric)
- **Cron job not running**: Check Vercel dashboard logs, verify CRON_SECRET
- **Email not sending**: Test Resend API key, check sandbox mode

### Getting Help
- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
- shadcn/ui: https://ui.shadcn.com
- NHTSA API: https://vpic.nhtsa.dot.gov/api

---

**Last Updated**: 2025-01-15
**Version**: 1.0
**Status**: Ready to implement
