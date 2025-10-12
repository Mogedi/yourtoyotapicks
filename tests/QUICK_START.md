# Quick Start Guide - E2E Tests

## Installation

```bash
# Install ts-node if not already installed
npm install --save-dev ts-node

# Verify installation
npm list ts-node
```

## Running Tests

### 1. Start the Application

```bash
# Terminal 1: Start Next.js app
npm run dev

# Wait for: "Ready on http://localhost:3001"
```

### 2. Run Tests

```bash
# Terminal 2: Run all tests
npm run test:e2e

# Or run individual tests:
npm run test:e2e:01  # Landing to Dashboard
npm run test:e2e:02  # Dashboard Filtering
npm run test:e2e:03  # Vehicle Details
```

## What to Expect

### Console Output

You'll see colorful, step-by-step output:

```
▶ Starting test: 01-landing-to-dashboard
────────────────────────────────────────
  → Launching browser
  ✓ Browser launched
  → Navigating to landing page
  ✓ Loaded: http://localhost:3001
  → Taking screenshot of landing page
  ✓ Screenshot saved: ...
  ...
────────────────────────────────────────
✓ 01-landing-to-dashboard PASSED (8453ms)
  Screenshots: 2
```

### Screenshots

Find screenshots in:
```
tests/screenshots/[timestamp]/
  ├── landing-page.png
  ├── dashboard-loaded.png
  ├── initial-state.png
  └── ...
```

## Test Summary

| Test | Purpose | Screenshots |
|------|---------|-------------|
| 01 | Landing → Dashboard navigation | 2 |
| 02 | Filter functionality | 5 |
| 03 | Vehicle details & tabs | 8+ |

## Troubleshooting

### Port 3001 Not Available

Change `BASE_URL` in test files:
```typescript
// tests/e2e/flows/*.test.ts
const BASE_URL = 'http://localhost:3000'; // or your port
```

### Chrome/Puppeteer Issues

```bash
# Install Chrome dependencies (Ubuntu/Debian)
sudo apt-get install -y chromium-browser

# Or install Chromium
npx puppeteer browsers install chrome
```

### Debug Mode

Edit `tests/e2e/helpers/browser.ts`:
```typescript
headless: false,  // Show browser
slowMo: 250,     // Slow down actions
```

## Documentation

- **Full Guide**: `tests/e2e/README.md`
- **Implementation Summary**: `tests/TEST_IMPLEMENTATION_SUMMARY.md`
- **Helper Documentation**: `tests/e2e/helpers/README.md`

## Common Commands

```bash
# Run all tests
npm run test:e2e

# Run specific test
npm run test:e2e:01

# Direct execution
npx ts-node tests/e2e/flows/01-landing-to-dashboard.test.ts

# View screenshots
open tests/screenshots/$(ls -t tests/screenshots | head -1)
```

## Quick Test Check

Run this to verify setup:

```bash
# 1. Check dependencies
npm list puppeteer ts-node chalk

# 2. Check app is running
curl http://localhost:3001

# 3. Run first test
npm run test:e2e:01
```

If all steps succeed, you're ready to run the full suite!
