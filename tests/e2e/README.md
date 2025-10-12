# YourToyotaPicks E2E Tests

Automated end-to-end tests for the YourToyotaPicks application using Puppeteer.

## Overview

This test suite validates core user flows through the application:

1. **Landing to Dashboard** - Navigate from homepage to dashboard
2. **Dashboard Filtering** - Test vehicle filtering functionality
3. **Vehicle Details** - Navigate to detail pages and interact with tabs
4. **Review System** - Test complete review workflow with ratings and notes
5. **VIN Decoder** - Test VIN decoding and specifications display
6. **Error States** - Test error handling, loading states, and edge cases

## Prerequisites

- Node.js installed
- Application running on `http://localhost:3001`
- Dependencies installed (`npm install`)

## Test Structure

```
tests/e2e/
├── flows/                          # Test flow implementations
│   ├── 01-landing-to-dashboard.test.ts
│   ├── 02-dashboard-filtering.test.ts
│   └── 03-vehicle-details.test.ts
├── helpers/                        # Shared utilities
│   ├── browser.ts                 # Browser automation helpers
│   ├── screenshot.ts              # Screenshot utilities
│   ├── logger.ts                  # Test logging
│   ├── types.ts                   # TypeScript definitions
│   └── index.ts                   # Exports
├── screenshots/                    # Generated screenshots (timestamped)
├── run-all-tests.ts               # Test suite runner
└── README.md                      # This file
```

## Running Tests

### Run All Tests

```bash
# Using npm script (if added to package.json)
npm run test:e2e

# Using ts-node directly
npx ts-node tests/e2e/run-all-tests.ts
```

### Run Individual Tests

```bash
# Test 1: Landing to Dashboard
npx ts-node tests/e2e/flows/01-landing-to-dashboard.test.ts

# Test 2: Dashboard Filtering
npx ts-node tests/e2e/flows/02-dashboard-filtering.test.ts

# Test 3: Vehicle Details
npx ts-node tests/e2e/flows/03-vehicle-details.test.ts
```

## Test Details

### 01: Landing to Dashboard

**Purpose**: Verify basic navigation from landing page to dashboard

**Steps**:
1. Navigate to `http://localhost:3001`
2. Screenshot landing page
3. Click "View Dashboard" button
4. Wait for navigation
5. Screenshot dashboard
6. Verify 32+ vehicle cards exist
7. Check for console errors

**Expected Screenshots**: 2
- `landing-page.png`
- `dashboard-loaded.png`

**Success Criteria**:
- Landing page loads successfully
- Dashboard button is clickable
- Navigation to `/dashboard` completes
- At least 32 vehicle cards are displayed
- No JavaScript console errors

---

### 02: Dashboard Filtering

**Purpose**: Verify vehicle filtering functionality

**Steps**:
1. Navigate to dashboard
2. Screenshot initial state
3. Apply Make filter (Toyota)
4. Screenshot after filter
5. Apply Model filter (RAV4)
6. Screenshot after filter
7. Apply Price filter (max $20000)
8. Screenshot after filter
9. Click Clear Filters
10. Screenshot reset state

**Expected Screenshots**: 5
- `initial-state.png`
- `after-make-filter.png`
- `after-model-filter.png`
- `after-price-filter.png`
- `after-clear-filters.png`

**Success Criteria**:
- Filters are present and interactive
- Filters reduce vehicle count appropriately
- Clear filters button restores full list
- No JavaScript console errors

**Notes**:
- Test adapts to different filter implementations (dropdowns, inputs, buttons)
- Warns if filters are not found rather than failing

---

### 03: Vehicle Details

**Purpose**: Verify vehicle detail page navigation and tabs

**Steps**:
1. Navigate to dashboard
2. Click first vehicle card
3. Screenshot detail page
4. Verify URL contains VIN/identifier
5. Click each tab (Review, Specs, History, Filters, Details)
6. Screenshot each tab
7. Verify content loads
8. Navigate back to dashboard
9. Verify return navigation

**Expected Screenshots**: 8+
- `vehicle-detail-page.png`
- `tab-overview.png`
- `tab-review.png`
- `tab-specs.png`
- `tab-history.png`
- `tab-filters.png`
- `tab-details.png`
- `back-to-dashboard.png`

**Success Criteria**:
- Vehicle cards are clickable
- Detail page loads with unique URL
- Tabs are present and switchable
- Content displays in each tab
- Back navigation returns to dashboard
- No JavaScript console errors

**Notes**:
- Test adapts to find tabs using multiple selector strategies
- Warns for missing tabs rather than failing

---

## Screenshots

Screenshots are automatically saved to `tests/screenshots/` in timestamped folders:

```
tests/screenshots/
└── 2025-10-12_14-30-45/           # Timestamp folder
    ├── landing-page.png
    ├── dashboard-loaded.png
    ├── initial-state.png
    └── ...
```

Each screenshot includes:
- Full page capture
- Metadata (URL, viewport, timestamp)
- Sanitized filename

## Error Detection

Tests automatically detect and report:

- **Console Errors**: JavaScript errors in browser console
- **Page Errors**: Unhandled exceptions on page
- **Navigation Failures**: Failed page loads or redirects
- **Missing Elements**: Expected UI components not found
- **Assertion Failures**: Test expectations not met

## Configuration

### Changing Base URL

Edit the `BASE_URL` constant in each test file:

```typescript
const BASE_URL = 'http://localhost:3001'; // Change port if needed
```

### Adjusting Timeouts

Browser and selector timeouts can be adjusted in helper functions:

```typescript
// In browser.ts
export async function navigateTo(
  page: Page,
  url: string,
  timeout: number = 30000  // Adjust this value
): Promise<void>
```

### Browser Options

Browser launch options can be modified in `helpers/browser.ts`:

```typescript
const browser = await puppeteer.launch({
  headless: true,        // Set to false for debugging
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ],
});
```

## Debugging

### Run Tests with Visible Browser

Edit `helpers/browser.ts` and set `headless: false`:

```typescript
const browser = await puppeteer.launch({
  headless: false,  // Changed from true
  // ...
});
```

### Slow Down Execution

Add `slowMo` option for easier debugging:

```typescript
const browser = await puppeteer.launch({
  headless: false,
  slowMo: 100,  // Adds 100ms delay between operations
  // ...
});
```

### Check Screenshots

Screenshots are saved after each major step. Review them in:
```
tests/screenshots/<timestamp>/
```

## Adding New Tests

### Create New Test File

1. Create file in `tests/e2e/flows/`:
   ```bash
   touch tests/e2e/flows/04-my-new-test.test.ts
   ```

2. Use this template:

```typescript
import {
  launchBrowser,
  closeBrowser,
  navigateTo,
  takeFullPageScreenshot,
  logTestStart,
  logStep,
  logSuccess,
  logError,
  logTestResult,
  createTestResult,
  type BrowserContext,
  type TestResult,
  type ScreenshotMetadata,
} from '../helpers';

const TEST_NAME = '04-my-new-test';
const BASE_URL = 'http://localhost:3001';

export async function runTest(): Promise<TestResult> {
  const startTime = Date.now();
  const screenshots: ScreenshotMetadata[] = [];
  const errors: string[] = [];
  let context: BrowserContext | null = null;

  logTestStart(TEST_NAME);

  try {
    context = await launchBrowser();
    const { page } = context;

    // Your test steps here
    logStep('Doing something');
    await navigateTo(page, BASE_URL);
    logSuccess('Something completed');

    // Take screenshots
    const screenshot = await takeFullPageScreenshot(page, 'step-name');
    screenshots.push(screenshot);

    const duration = Date.now() - startTime;
    const result = createTestResult(
      TEST_NAME,
      errors.length === 0,
      duration,
      screenshots,
      errors
    );

    logTestResult(result);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Test failed: ${errorMessage}`);
    logError(errorMessage);

    const result = createTestResult(TEST_NAME, false, duration, screenshots, errors);
    logTestResult(result);
    return result;
  } finally {
    if (context) {
      await closeBrowser(context);
    }
  }
}

if (require.main === module) {
  runTest().then((result) => {
    process.exit(result.passed ? 0 : 1);
  });
}
```

3. Add to test runner (`run-all-tests.ts`):

```typescript
import { runTest as runMyNewTest } from './flows/04-my-new-test.test';

// In tests array:
const tests = [
  // ... existing tests
  { name: '04-my-new-test', fn: runMyNewTest },
];
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build

      - name: Start application
        run: npm start &

      - name: Wait for application
        run: npx wait-on http://localhost:3001

      - name: Run E2E tests
        run: npx ts-node tests/e2e/run-all-tests.ts

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: tests/screenshots/
```

## Troubleshooting

### "No vehicle cards found"

- Ensure application is running on correct port
- Check that database is seeded with vehicles
- Verify vehicle card selector in dashboard code

### "Navigation timeout"

- Increase timeout values in test
- Check network connectivity
- Verify application is fully started

### "Screenshot directory error"

- Ensure write permissions on `tests/screenshots/`
- Check disk space
- Verify path exists: `mkdir -p tests/screenshots`

### Chrome/Puppeteer Installation Issues

```bash
# Install Chromium dependencies (Ubuntu/Debian)
sudo apt-get install -y chromium-browser

# Or use bundled Chromium
npx puppeteer browsers install chrome
```

## Contributing

When adding tests:

1. Follow existing test structure
2. Use descriptive step names
3. Take screenshots at key points
4. Handle errors gracefully
5. Add clear success criteria
6. Document expected behavior

## License

Same as parent project.

---

## Advanced Test Flows (04-06)

### 04: Review System

**Purpose**: Test the complete review workflow including star ratings, notes, and persistence

**Steps**:
1. Navigate to vehicle detail page (VIN: 5YFBURHE5HP690324)
2. Click Review tab
3. Screenshot empty review form
4. Click 4 stars
5. Screenshot stars selected
6. Type notes: "Great vehicle for testing"
7. Check "Mark as Reviewed" checkbox
8. Click "Save Review" button
9. Screenshot after save
10. Verify success message
11. Navigate to Details tab
12. Verify review is displayed
13. Return to dashboard
14. Check for reviewed badge

**Expected Screenshots**: 9
- `vehicle-detail-loaded.png`
- `empty-review-form.png`
- `stars-selected-4.png`
- `notes-entered.png`
- `reviewed-checkbox-checked.png`
- `after-save.png`
- `details-tab-with-review.png`
- `back-to-dashboard.png`
- `dashboard-with-badge.png`

**Success Criteria**:
- Review form is accessible and functional
- Star rating interaction works
- Text notes can be entered
- Checkbox toggles correctly
- Save button triggers API call
- Success feedback is displayed
- Review appears in Details tab
- Dashboard shows reviewed badge

**What It Tests**:
- Form rendering and interaction
- Star rating component
- Text input handling
- Checkbox state management
- API integration (PATCH request)
- Success/error feedback
- Data persistence
- UI state updates across tabs

**Run Command**:
```bash
npm run test:e2e:04
# or
npm run test:e2e:review
```

---

### 05: VIN Decoder

**Purpose**: Test VIN decoding functionality and NHTSA API integration

**Test VIN**: `5YFBURHE5HP690324` (Toyota Corolla Hybrid)

**Steps**:
1. Navigate to vehicle with test VIN
2. Click Specifications tab
3. Screenshot VIN specifications
4. Verify VIN is displayed
5. Extract VIN decode data from page
6. Verify data format and completeness
7. Monitor network for NHTSA API calls
8. Check API response structure
9. Verify mileage analysis section
10. Screenshot mileage analysis

**Expected Screenshots**: 4
- `vehicle-detail-loaded.png`
- `specifications-tab.png`
- `vin-specifications.png`
- `mileage-analysis.png`

**Data Verified**:
- VIN (required, 17 characters)
- Make, Model, Year
- Body Type, Trim
- Engine Type, Fuel Type
- Drive Type, Transmission
- Manufacturer, Plant Country
- Mileage per year
- Mileage rating

**Network Monitoring**:
- Detects NHTSA API calls to `vpic.nhtsa.dot.gov`
- Captures request/response data
- Verifies response structure
- Handles cached data scenarios

**Success Criteria**:
- VIN is displayed correctly
- Specifications tab renders
- VIN decode data is extracted
- Required fields are present
- Data format is valid (17-char VIN, etc.)
- NHTSA API calls detected (or cached)
- Mileage analysis section shows
- No console errors

**What It Tests**:
- VIN display
- Tab navigation
- Data extraction from DOM
- VIN decode API integration
- Network request monitoring
- Data format validation
- Mileage calculations
- Empty/missing data handling

**Edge Cases Handled**:
- Missing VIN decode data
- Cached vs fresh API calls
- Incomplete data fields
- Variable DOM structure
- API timeout/failure

**Run Command**:
```bash
npm run test:e2e:05
# or
npm run test:e2e:vin
```

---

### 06: Error States

**Purpose**: Test error handling, loading states, and edge cases across the application

This test runs **6 sub-tests** to comprehensively test error scenarios.

#### Sub-Test 1: Invalid URL / 404 Error

**Steps**:
1. Navigate to invalid VIN (`INVALID123ABC4567`)
2. Wait for error page to load
3. Screenshot error page
4. Verify error message displayed
5. Check for back to dashboard link

**What It Tests**:
- 404 error handling
- Error page rendering
- User-friendly error messages
- Navigation recovery

**Expected Screenshots**: 1
- `invalid-url-error.png`

#### Sub-Test 2: Network Throttling

**Steps**:
1. Enable network throttling (Slow 3G: 500kb/s, 400ms latency)
2. Navigate to dashboard
3. Screenshot loading state
4. Verify loading indicators appear
5. Wait for content to load
6. Screenshot after loading
7. Disable throttling

**What It Tests**:
- Slow network handling
- Loading indicators
- Progressive loading
- Timeout handling
- User feedback during slow loads

**Expected Screenshots**: 2
- `loading-with-throttling.png`
- `after-loading-throttled.png`

#### Sub-Test 3: Loading States

**Steps**:
1. Clear browser cache
2. Navigate to dashboard quickly
3. Capture initial loading state
4. Detect skeleton loaders
5. Screenshot skeleton loaders
6. Wait for full load
7. Screenshot fully loaded state

**What It Tests**:
- Initial loading state
- Skeleton loaders
- Loading animations
- Progressive rendering
- Cache handling

**Expected Screenshots**: 3
- `initial-loading-state.png`
- `skeleton-loaders.png`
- `fully-loaded-state.png`

#### Sub-Test 4: Missing Data Scenarios

**Steps**:
1. Navigate to dashboard
2. Check for empty state messages
3. Screenshot current state
4. Test with restrictive filters
5. Verify "no results" handling

**What It Tests**:
- Empty state UI
- No results messaging
- Filter edge cases
- Graceful degradation

**Expected Screenshots**: 1-2
- `empty-state.png` or `dashboard-with-data.png`
- `with-filters.png` (if filters available)

#### Sub-Test 5: Console Errors

**Steps**:
1. Setup console error listeners
2. Visit dashboard
3. Visit valid vehicle detail
4. Visit invalid vehicle detail
5. Collect all console errors
6. Report error summary

**What It Tests**:
- JavaScript errors
- Console warnings
- Unhandled exceptions
- Error logging
- Error frequency

**Expected Screenshots**: 0-1
- `page-with-console-errors.png` (if errors found)

#### Sub-Test 6: Network Request Failures

**Steps**:
1. Setup network monitoring
2. Track failed requests
3. Track HTTP error responses (4xx, 5xx)
4. Navigate to various pages
5. Report network failures

**What It Tests**:
- Failed API calls
- Network errors
- HTTP error responses
- Error recovery
- Resilience

**Expected Screenshots**: 0-1
- `with-network-failures.png` (if failures found)

**Overall Success Criteria**:
- Error pages display correctly
- Loading states are visible
- Empty states are handled
- Console errors are tracked
- Network failures are monitored
- Application remains functional

**What It Tests**:
- Comprehensive error handling
- User experience during failures
- Loading state feedback
- Edge case resilience
- Error recovery mechanisms
- Network reliability

**Run Command**:
```bash
npm run test:e2e:06
# or
npm run test:e2e:errors
```

---

## Running All Advanced Tests

To run tests 04-06 together:

```bash
npm run test:e2e
```

This will execute all three advanced test flows and provide a comprehensive summary report.

## Test Output Example

```
═══════════════════════════════════════════════════════════════
                    YourToyotaPicks E2E Tests                  
═══════════════════════════════════════════════════════════════

🧪 Running Test Suite: Review System
─────────────────────────────────────────────────────────────
========================================
Starting Review System Test Flow
========================================

→ Navigate to vehicle detail...
✓ Navigate to vehicle detail - Screenshot: /path/to/screenshot.png

→ Navigate to Review tab...
✓ Navigate to Review tab - Screenshot: /path/to/screenshot.png

... (more steps)

========================================
✓ Review System Test PASSED
Duration: 12345ms
Steps completed: 11
Screenshots taken: 9
========================================

✓ Review System PASSED

🧪 Running Test Suite: VIN Decoder
─────────────────────────────────────────────────────────────
... (test output)

🧪 Running Test Suite: Error States
─────────────────────────────────────────────────────────────
... (test output)

═══════════════════════════════════════════════════════════════
                         TEST SUMMARY                          
═══════════════════════════════════════════════════════════════

📊 Overall Statistics:
─────────────────────────────────────────────────────────────
  Total Test Suites:     3
  Passed:                3
  Failed:                0
  Total Duration:        45.67s
  Total Steps:           35
  Screenshots Captured:  22
  Errors Detected:       0

═══════════════════════════════════════════════════════════════
                  ✅ ALL TESTS PASSED                          
═══════════════════════════════════════════════════════════════
```

## Test Configuration

All tests share common configuration:

- **Base URL**: `http://localhost:3000` (override with `BASE_URL` env var)
- **Test VIN**: `5YFBURHE5HP690324` (Toyota Corolla Hybrid)
- **Viewport**: 1920x1080
- **Headless**: True (set to false for debugging)
- **Timeout**: 30 seconds default
- **Screenshots**: Auto-saved to `tests/screenshots/<timestamp>/`

## Tips for Success

1. **Ensure dev server is running**: `npm run dev`
2. **Use valid test data**: VIN `5YFBURHE5HP690324` should exist in database
3. **Review screenshots**: Check visual output for unexpected issues
4. **Monitor console output**: Watch for warnings and errors
5. **Run tests individually first**: Debug issues before running full suite
6. **Keep tests updated**: Update selectors when UI changes
