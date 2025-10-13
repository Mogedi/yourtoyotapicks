# 🚗 YourToyotaPicks

> **Your trustworthy curator for finding the perfect Toyota or Honda**

YourToyotaPicks isn't just another car listing aggregator—it's an intelligent curator that shows you the best matches first, explains why they're good, and makes comparison effortless. Within 5 seconds of opening the dashboard, you'll know which cars are worth your time.

Built with Next.js, Supabase, and 100% free resources.

---

## ✨ Features

### 🎯 Core Philosophy: Signal over Noise

**The 5-Second Clarity Rule**: When you open the dashboard, within 5 seconds you'll:
1. Know which cars are your top picks
2. Understand why each one ranks highly
3. Be able to compare or act without hunting through noise

### Key Features

- 🏆 **Priority-First Curation** - Best matches shown first with AI-generated explanations
- 🎨 **Color-Coded Quality Tiers** - Green (Top Picks 80+), Yellow (Good 65-79), Gray (Caution <65)
- 📊 **Contextual Comparisons** - See "$1.2k below median", not just raw prices
- 🔍 **Smart Filtering** - 8 filter types that preserve priority sorting
- 🤖 **Transparent Scoring** - Hover to see exactly why each car ranks where it does
- 📧 **Email Digests** - Daily/weekly summaries of top matches
- 🔒 **VIN Validation** - Free NHTSA API integration
- 💯 **100% Free** - Runs entirely on free tier services

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free)
- Resend account (free, optional for emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/yourtoyotapicks.git
cd yourtoyotapicks

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# Copy lib/database.sql and run in Supabase SQL Editor

# Seed test data
./scripts/seed-database.sh

# Start development server
npm run dev
```

Visit http://localhost:3000 to see your dashboard!

---

## 📖 Documentation

**📚 [Complete Documentation Index](docs/README.md)** - All documentation organized by topic

### Quick Links
- **[Quick Start](docs/setup/QUICK_START.md)** - Get started in 5 minutes
- **[Technical Spec](docs/TECHNICAL_SPEC.md)** - Architecture and design
- **[Testing Guide](docs/testing/UI_TESTING_README.md)** - E2E testing
- **[CLAUDE.md](CLAUDE.md)** - AI assistant development guide

### Documentation Structure
- **Setup**: Database, deployment, email configuration
- **Features**: Detailed feature implementation docs
- **Guides**: How-to guides and tutorials
- **Testing**: E2E test plans and results

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Hosting** | Vercel |
| **Email** | Resend |
| **VIN API** | NHTSA vPIC (free) |
| **Automation** | Vercel Cron Jobs |

**Total Monthly Cost: $0** (free tier limits: 100 emails/day, 500MB database, 100GB bandwidth)

---

## 📊 Project Structure

```
yourtoyotapicks/
├── app/                  # Next.js App Router
│   ├── page.tsx          # Landing page
│   └── dashboard/        # Dashboard and vehicle details
├── components/           # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── FilterBar.tsx     # Vehicle filtering
│   ├── VehicleCard.tsx   # Vehicle cards
│   ├── VehicleList.tsx   # Vehicle grid
│   └── VehicleDetail.tsx # Detail view
├── lib/                  # Utilities and libraries
│   ├── supabase.ts       # Database client
│   ├── mock-data.ts      # 32 test vehicles
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
├── tests/                # E2E test suite
│   ├── e2e/flows/        # Puppeteer tests
│   └── screenshots/      # Test screenshots
├── docs/                 # Documentation (organized)
│   ├── setup/            # Setup guides
│   ├── features/         # Feature docs
│   ├── guides/           # How-to guides
│   └── testing/          # Test docs
├── config/               # Configuration files
└── scripts/              # Build and test scripts
```

---

## 🎯 How It Works

### 1. Intelligent Priority Scoring (Transparent Algorithm)

Every vehicle gets a 0-100 score based on weighted factors:
- **Title & Accident History** (25%): Clean title = +25
- **Mileage vs Year** (20%): Below average for age = +15
- **Price vs Market** (20%): Below median = +10
- **Distance** (15%): Within 50 mi = +10
- **Model Demand** (10%): RAV4/CR-V models = +5
- **Condition Signals** (10%): Well-maintained keywords = +3

**Transparency**: Hover over any score to see the exact breakdown.

### 2. Quality Tier Visualization

- 🟩 **Top Picks (80+)**: Green badges, shown first—these are the cream of the crop
- 🟨 **Good Buys (65-79)**: Yellow badges—solid options worth considering
- 🟥 **Caution (<65)**: Muted display, collapsible—proceed with care

### 3. AI-Generated Summaries

Each vehicle shows a 2-line explanation like:
> ✅ 1-owner • 📉 $1.8k below market • 🧰 Clean title • 🧊 Not from rust belt

### 4. Smart Filtering (Preserves Priority)

Auto-reject filters:
- Price: $10K-$20K range
- Year: 2015 or newer
- Title: Clean only
- Accidents: Zero tolerance
- Owners: Maximum 2
- Location: Non-rust belt preferred
- Brands: Toyota & Honda only

### 5. Email Digests
- 📧 Daily/weekly summaries
- 🎨 Beautiful HTML templates
- 🚀 Top 5 vehicles only (no noise)

---

## 🔧 Configuration

### Search Criteria
Edit `config/search-settings.json`:
```json
{
  "search_criteria": {
    "brands": ["Toyota", "Honda"],
    "price_min": 10000,
    "price_max": 20000,
    "radius_miles": 30
  }
}
```

### Email Notifications
Edit `config/notification-settings.json`:
```json
{
  "user_email": "your@email.com",
  "email_frequency": "daily",
  "min_priority_score": 70
}
```

---

## 📸 Screenshots

### Dashboard
Beautiful, responsive dashboard with filtering and sorting:
- Grid layout (1/2/3 columns responsive)
- 8 filter types
- 6 sort options
- Real-time updates

### Vehicle Detail Page
Complete vehicle information with:
- Image gallery
- VIN specifications
- Filter results
- Review section
- Action buttons

### Review System
Interactive rating system:
- Star ratings (1-5)
- Personal notes
- Review status badges
- Filtering by review status

---

## 🧪 Testing

### Run Tests
```bash
# Test the cron job
./scripts/test-cron.sh

# Test email notifications
node scripts/test-email.js daily

# Seed mock data
./scripts/seed-database.sh
```

### Manual Testing
1. Visit http://localhost:3000/dashboard
2. Apply filters and sorting
3. Click a vehicle to view details
4. Add a review with rating and notes
5. Check that the "Reviewed" badge appears

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
CRON_SECRET=your_secret
RESEND_API_KEY=your_resend_key
USER_EMAIL=your@email.com
DATA_SOURCE=mock
```

### Verify Cron Job
- Go to Vercel Dashboard → Cron Jobs
- Verify schedule: `0 6 * * *` (daily at 6 AM UTC)
- Check execution logs

---

## 💰 Cost Breakdown

| Service | Free Tier | Monthly Usage | Cost |
|---------|-----------|---------------|------|
| Vercel | 100GB bandwidth | ~5GB | $0 |
| Supabase | 500MB, 50K rows | ~360 rows/mo | $0 |
| Resend | 100 emails/day | ~30 emails/mo | $0 |
| NHTSA API | Unlimited | ~360 requests/mo | $0 |
| **Total** | | | **$0/month** |

---

## 🗺️ Roadmap

### MVP (Complete ✅)
- [x] Dashboard with filtering
- [x] VIN validation
- [x] Review system
- [x] Daily automation
- [x] Email notifications

### Phase 2 (Next)
- [ ] Real API integration (Auto.dev)
- [ ] VinAudit for full history
- [ ] Settings page
- [ ] CSV export
- [ ] Price tracking

### Phase 3 (Future)
- [ ] SMS notifications
- [ ] User authentication
- [ ] Saved searches
- [ ] Comparison tool
- [ ] Mobile app

---

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this for your own car hunting!

---

## 🙏 Acknowledgments

- **Next.js** - Amazing React framework
- **Supabase** - Best PostgreSQL platform
- **shadcn/ui** - Beautiful UI components
- **Vercel** - Seamless deployment
- **Resend** - Modern email API
- **NHTSA** - Free VIN decoder API

---

## 📞 Support

- **Issues**: Open an issue on GitHub
- **Docs**: See documentation files in the repo
- **Email**: your@email.com

---

## ⭐ Show Your Support

If this project helped you find your perfect car, give it a ⭐️!

---

**Built with ❤️ for car enthusiasts who value quality over quantity**
