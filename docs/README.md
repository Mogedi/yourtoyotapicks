# YourToyotaPicks Documentation

Complete documentation for the YourToyotaPicks project.

## 📖 Table of Contents

### 🚀 Getting Started

- **[Quick Start Guide](setup/QUICK_START.md)** - Get up and running in 5 minutes
- **[Quick Start with Seed Data](setup/QUICK_START_SEED.md)** - Using mock data for development

### ⚙️ Setup & Configuration

- **[Database Setup](setup/DATABASE_SETUP.md)** - Supabase schema and configuration
- **[Deployment Guide](setup/DEPLOYMENT.md)** - Deploy to Vercel
- **[Email Configuration](setup/EMAIL_QUICK_START.md)** - Email notification setup

### 🎨 Features

#### Implemented Features
- **[Car Images System](CAR_IMAGES_IMPLEMENTATION.md)** - Real car images with IMAGIN.studio API
- **[Vehicle Detail Page](features/FEATURE_9_VEHICLE_DETAIL.md)** - 5-angle gallery and comprehensive info
- **[Error Detection System](ERROR_WATCH_SYSTEM.md)** - Automated error capture for development
- **[Error Capture Guide](ERROR_CAPTURE_GUIDE.md)** - How to capture and fix all error types

#### Automation Features (Planned)
- **[Feature 11: Cron Job System](features/FEATURE_11_CRON_JOB.md)** - Automated data ingestion
- **[Feature 12: Email Notifications](features/FEATURE_12_EMAIL_NOTIFICATIONS.md)** - Daily/weekly digests
  - [Feature 12 Summary](features/FEATURE_12_SUMMARY.md)

### 📚 Guides

- **[Mock Data Guide](guides/MOCK_DATA_GUIDE.md)** - Working with test data (32 vehicles with real images)
- **[Implementation Plan](guides/IMPLEMENTATION_PLAN.md)** - Overall project roadmap

### 🧪 Testing

- **[UI Testing Plan](testing/UI_TESTING_PLAN.md)** - E2E testing strategy
- **[UI Testing Guide](testing/UI_TESTING_README.md)** - Running and writing tests

### 📐 Architecture

- **[Technical Specification](TECHNICAL_SPEC.md)** - Detailed technical design
- **[Project Overview](overview.md)** - High-level product vision

## 🗂️ Documentation Structure

```
docs/
├── README.md                          # This file
├── CAR_IMAGES_IMPLEMENTATION.md       # Car image system documentation
├── ERROR_WATCH_SYSTEM.md              # Automated error detection
├── ERROR_CAPTURE_GUIDE.md             # Error capture guide
├── setup/                             # Setup and configuration guides
│   ├── QUICK_START.md
│   ├── QUICK_START_SEED.md
│   ├── DATABASE_SETUP.md
│   ├── DEPLOYMENT.md
│   └── EMAIL_QUICK_START.md
├── features/                          # Feature implementation docs
│   ├── FEATURE_9_VEHICLE_DETAIL.md    # Vehicle detail page
│   ├── FEATURE_11_CRON_JOB.md         # Cron job system
│   └── FEATURE_12_*.md                # Email notifications
├── guides/                            # How-to guides
│   ├── MOCK_DATA_GUIDE.md
│   └── IMPLEMENTATION_PLAN.md
├── testing/                           # Testing documentation
│   ├── UI_TESTING_PLAN.md
│   └── UI_TESTING_README.md
├── TECHNICAL_SPEC.md                  # Technical architecture
└── overview.md                        # Product vision
```

## 🎯 Quick Reference

### For New Contributors

1. Start with [Quick Start Guide](setup/QUICK_START.md)
2. Review [Technical Specification](TECHNICAL_SPEC.md)
3. Check [Mock Data Guide](guides/MOCK_DATA_GUIDE.md) for development
4. Read [UI Testing Guide](testing/UI_TESTING_README.md) before contributing

### For Feature Development

1. Check [Implementation Plan](guides/IMPLEMENTATION_PLAN.md) for roadmap
2. Review related feature docs in `features/`
3. Follow patterns in existing code
4. Add tests following [UI Testing Plan](testing/UI_TESTING_PLAN.md)

### For Deployment

1. Follow [Deployment Guide](setup/DEPLOYMENT.md)
2. Set up [Database](setup/DATABASE_SETUP.md)
3. Configure [Email](setup/EMAIL_QUICK_START.md) (optional)

### For Development

1. Use [Error Watch System](ERROR_WATCH_SYSTEM.md) to catch issues automatically
2. Run `npm run watch:errors` for live error detection
3. Type `/fix-errors` to have Claude analyze and fix errors
4. Check [Error Capture Guide](ERROR_CAPTURE_GUIDE.md) for all error types

## 📊 Project Status

### ✅ Completed
- Dashboard UI with filtering
- Vehicle detail pages with **5-angle image gallery**
- **Real car images** from IMAGIN.studio API (free)
- Review system with ratings and notes
- Mock data system (**32 unique vehicles** with real images)
- **E2E test suite** (3 tests, all passing)
- **Automated error detection** (`npm run watch:errors`)
- **Zero console errors** in production
- Responsive design with Tailwind CSS + shadcn/ui

### 🚧 In Progress
- Supabase database integration (client configured, not connected)

### 📝 Planned
- Cron job system for daily updates
- Email notification system
- API integration (Marketcheck/Auto.dev)
- VIN history checks (VinAudit)
- Multi-region support
- User authentication

## 🔗 Related Files

- **Root README**: `/README.md` - Project overview and quick start
- **Claude Guide**: `/CLAUDE.md` - AI assistant instructions (comprehensive project guide)
- **Environment**: `/.env.local.example` - Environment variable template

## 💡 Tips

- All documentation uses relative links for easy navigation
- Code examples are provided where applicable
- Car images load automatically from IMAGIN.studio API (no config needed)
- Error detection runs automatically with `npm run watch:errors`
- Type `/fix-errors` in Claude to analyze and fix test failures
- Keep documentation updated when implementing features

## 🤝 Contributing to Documentation

When adding new features:
1. Create feature documentation in `docs/features/`
2. Add setup instructions in `docs/setup/` if needed
3. Update this index
4. Link from root README if it's a major feature
5. Update [CLAUDE.md](../CLAUDE.md) for Claude context

## 📧 Questions?

- Check existing documentation first
- Review code comments in `/components` and `/lib`
- See test files in `/tests/e2e/flows/` for usage examples
- Check [CLAUDE.md](../CLAUDE.md) for comprehensive project overview
