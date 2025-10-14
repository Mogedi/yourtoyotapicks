# YourToyotaPicks Documentation

Complete documentation for the YourToyotaPicks project.

## 📖 Table of Contents

### 🚀 Getting Started

- **[Quick Start Guide](setup/QUICK_START.md)** - Get up and running in 5 minutes
- **[Quick Start with Seed Data](setup/QUICK_START_SEED.md)** - Using mock data for development

### 📚 Learnings & Best Practices

**Start here for comprehensive guidance:**

- **[Learnings Index](learnings/README.md)** - Quick reference by task (testing, refactoring, database work)
- **[Testing Best Practices](learnings/TESTING_BEST_PRACTICES.md)** - Test-first workflow, E2E patterns, React hydration
- **[Layer Separation Principles](architecture/LAYER_SEPARATION_PRINCIPLES.md)** - Data vs UI rules (critical!)
- **[V2 Migration Lessons](architecture/V2_MIGRATION_LESSONS.md)** - Learn from 5 major bugs (saves 7+ hours)
- **[Database Design Patterns](architecture/DATABASE_DESIGN_PATTERNS.md)** - Raw vs computed data, versioning
- **[Feature Addition Checklist](development/FEATURE_ADDITION_CHECKLIST.md)** - Step-by-step feature workflow

**Time Investment**: 50 minutes reading | **Time Saved**: 8-14+ hours per feature/refactor

### ⚙️ Setup & Configuration

- **[Database Setup](setup/DATABASE_SETUP.md)** - Supabase schema and configuration
- **[Deployment Guide](setup/DEPLOYMENT.md)** - Deploy to Vercel
- **[Email Configuration](setup/EMAIL_QUICK_START.md)** - Email notification setup

### 🎨 Features

#### Implemented Features

- **[Car Images System](features/CAR_IMAGES_IMPLEMENTATION.md)** - Real car images with IMAGIN.studio API
- **[Vehicle Detail Page](features/FEATURE_9_VEHICLE_DETAIL.md)** - 5-angle gallery and comprehensive info
- **[Error Detection System](features/ERROR_WATCH_SYSTEM.md)** - Automated error capture for development
- **[Error Capture Guide](features/ERROR_CAPTURE_GUIDE.md)** - How to capture and fix all error types

#### Automation Features (Planned)

- **[Feature 11: Cron Job System](features/FEATURE_11_CRON_JOB.md)** - Automated data ingestion
- **[Feature 12: Email Notifications](features/FEATURE_12_EMAIL_NOTIFICATIONS.md)** - Daily/weekly digests
  - [Feature 12 Summary](features/FEATURE_12_SUMMARY.md)

### 📚 Guides

- **[Mock Data Guide](guides/MOCK_DATA_GUIDE.md)** - Working with test data (32 vehicles with real images)
- **[Implementation Plan](guides/IMPLEMENTATION_PLAN.md)** - Overall project roadmap

### 🧪 Testing

- **[Testing Best Practices](learnings/TESTING_BEST_PRACTICES.md)** - Test-first workflow, service layer testing, E2E patterns
- See **[Learnings Index](learnings/README.md)** for comprehensive testing guidance

### 📐 Architecture & Technical

- **[Technical Specification](architecture/TECHNICAL_SPECIFICATION.md)** - Detailed technical design
- **[Data Sources](architecture/DATA_SOURCES.md)** - Data ingestion strategy and API integration
- **[Layer Separation Principles](architecture/LAYER_SEPARATION_PRINCIPLES.md)** - Data vs UI rules (critical!)
- **[V2 Migration Lessons](architecture/V2_MIGRATION_LESSONS.md)** - Bugs and fixes from V2.0 refactor
- **[Database Design Patterns](architecture/DATABASE_DESIGN_PATTERNS.md)** - DB patterns and migrations

### 🎨 UX & Design

- **[UX Principles](ux/UX_PRINCIPLES.md)** - Core UX philosophy and design guidelines
  - The 5-Second Clarity Rule
  - Quality Tiers (Top Pick, Good Buy, Caution)
  - AI Summary guidelines
  - Progressive Disclosure patterns

### 🛠️ Development

- **[Development Tools Setup](development/DEVELOPMENT_TOOLS_SETUP.md)** - Development environment configuration
- **[Feature Addition Checklist](development/FEATURE_ADDITION_CHECKLIST.md)** - Step-by-step workflow for adding features
- See **[Learnings Index](learnings/README.md)** for all learnings and best practices

### 📦 Archives

- **[Migration Docs Archive](_archive/migrations/)** - Completed October 2025 refactoring work
- **[Research Archive](_archive/research/)** - Completed research and analysis documents

## 🗂️ Documentation Structure

```
docs/
├── README.md                          # This file
├── CURRENT_OPEN_ISSUES.md             # Active issues and workarounds
│
├── learnings/                         # ⭐ Consolidated best practices
│   ├── README.md                      # Quick reference by task
│   └── TESTING_BEST_PRACTICES.md      # Test-first workflow, E2E patterns
│
├── setup/                             # Setup and configuration guides
│   ├── QUICK_START.md
│   ├── QUICK_START_SEED.md
│   ├── DATABASE_SETUP.md
│   ├── DEPLOYMENT.md
│   └── EMAIL_QUICK_START.md
│
├── features/                          # Feature implementation docs
│   ├── DASHBOARD_V2.md                # Dashboard V2 architecture
│   ├── FEATURE_9_VEHICLE_DETAIL.md    # Vehicle detail page
│   ├── FEATURE_11_CRON_JOB.md         # Cron job system
│   ├── FEATURE_12_*.md                # Email notifications
│   ├── CAR_IMAGES_IMPLEMENTATION.md   # Car image system
│   ├── ERROR_WATCH_SYSTEM.md          # Automated error detection
│   └── ERROR_CAPTURE_GUIDE.md         # Error capture guide
│
├── architecture/                      # Architectural decisions
│   ├── TECHNICAL_SPECIFICATION.md     # Technical design
│   ├── DATA_SOURCES.md                # Data ingestion strategy
│   ├── LAYER_SEPARATION_PRINCIPLES.md # Data vs UI rules
│   ├── V2_MIGRATION_LESSONS.md        # Bugs and fixes from V2.0
│   └── DATABASE_DESIGN_PATTERNS.md    # DB patterns and migrations
│
├── ux/                                # UX principles and guidelines
│   └── UX_PRINCIPLES.md               # Core UX philosophy
│
├── development/                       # Development guides
│   ├── DEVELOPMENT_TOOLS_SETUP.md
│   └── FEATURE_ADDITION_CHECKLIST.md
│
├── guides/                            # How-to guides
│   ├── MOCK_DATA_GUIDE.md
│   └── IMPLEMENTATION_PLAN.md
│
├── testing/                           # Testing documentation
│   └── (test results and screenshots)
│
└── _archive/                          # Historical documentation
    ├── migrations/                    # Completed refactoring work
    │   ├── README.md
    │   ├── DASHBOARD_IMPLEMENTATION_GAMEPLAN.md
    │   ├── DASHBOARD_IMPROVEMENTS_FEEDBACK.md
    │   ├── DASHBOARD_MIGRATION_COMPLETE.md
    │   ├── COMPONENT_REFACTORING_PHASE1.md
    │   ├── COMPONENT_REFACTORING_PHASE2.md
    │   ├── REFACTORING_SUMMARY.md
    │   └── ... (other migration docs)
    └── research/                      # Completed research
        ├── README.md
        ├── TOOLS_SETUP_SUMMARY.md
        ├── CODE_REVIEW_REFACTORING_SUGGESTIONS.md
        └── CONSTANTS_CONSOLIDATION_RESEARCH.md
```

## 🎯 Quick Reference

### For New Contributors

1. **Start here**: [Learnings Index](learnings/README.md) - 50 minutes reading saves 8-14+ hours
2. Review [Quick Start Guide](setup/QUICK_START.md)
3. Read [UX Principles](ux/UX_PRINCIPLES.md) to understand design philosophy
4. Check [Technical Specification](architecture/TECHNICAL_SPECIFICATION.md)
5. Review [Testing Best Practices](learnings/TESTING_BEST_PRACTICES.md)

### For Feature Development

1. **Read first**: [Feature Addition Checklist](development/FEATURE_ADDITION_CHECKLIST.md) - saves 5-7+ hours
2. Check [Implementation Plan](guides/IMPLEMENTATION_PLAN.md) for roadmap
3. Review [Layer Separation Principles](architecture/LAYER_SEPARATION_PRINCIPLES.md) - critical!
4. Review related feature docs in `features/`
5. Follow patterns in existing code
6. Write tests using [Testing Best Practices](learnings/TESTING_BEST_PRACTICES.md)

### For Deployment

1. Follow [Deployment Guide](setup/DEPLOYMENT.md)
2. Set up [Database](setup/DATABASE_SETUP.md)
3. Configure [Email](setup/EMAIL_QUICK_START.md) (optional)

### For Development

1. Use [Error Watch System](features/ERROR_WATCH_SYSTEM.md) to catch issues automatically
2. Run `npm run watch:errors` for live error detection
3. Type `/fix-errors` to have Claude analyze and fix errors
4. Check [Error Capture Guide](features/ERROR_CAPTURE_GUIDE.md) for all error types

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
