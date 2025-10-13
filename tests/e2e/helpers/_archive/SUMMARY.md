# YourToyotaPicks E2E Test Helpers - Summary

## Overview

A comprehensive suite of test utilities for the YourToyotaPicks UI testing system, providing screenshot capture, error detection, and common test helpers.

**Total Code:** ~1,750 lines of TypeScript
**Files Created:** 9 files
**Status:** ✓ Ready for use

---

## Files Created

### 1. `/tests/e2e/helpers/types.ts` (3.3 KB)
**TypeScript type definitions for all test utilities**

**Key Types:**
- `ScreenshotOptions`, `ScreenshotMetadata` - Screenshot configuration and metadata
- `ConsoleError`, `NetworkError`, `VisualError`, `JavaScriptError` - Error types
- `ErrorReport` - Aggregated error report structure
- `TestFlowResult`, `TestStepResult` - Test result structures
- `DashboardLoadState`, `VehicleDetailState` - Page state types
- `WaitOptions`, `RetryOptions` - Configuration options
- `VehicleCardData` - Vehicle card information

**Purpose:** Provides strict TypeScript typing for all test utilities, ensuring type safety and better IDE support.

---

### 2. `/tests/e2e/helpers/screenshot.ts` (6.6 KB)
**Screenshot capture and management system**

**Key Functions:**
- `takeScreenshot(page, name, options)` - Flexible screenshot capture
- `takeFullPageScreenshot(page, name)` - Convenience method for full page
- `takeElementScreenshot(page, selector, name)` - Element-specific screenshots
- `takeMultipleScreenshots(page, configs)` - Batch screenshot capture
- `resetSession()` - Start new screenshot session
- `getCurrentSessionFolder()` - Get current session folder path
- `ensureScreenshotsDir()` - Ensure directory exists

**Features:**
- **Timestamp-based organization:** Creates folders like `2025-10-12_14-30-45`
- **Automatic folder creation:** No manual setup required
- **Sanitized filenames:** Removes invalid characters from names
- **Rich metadata:** Returns path, timestamp, viewport, URL, etc.
- **Multiple capture modes:** Full page, element, custom clip regions

**Usage Example:**
```typescript
import { takeScreenshot, resetSession } from './helpers';

await resetSession();
const screenshot = await takeScreenshot(page, 'dashboard-loaded', {
  fullPage: true
});
console.log(`Screenshot saved: ${screenshot.fullPath}`);
```

---

### 3. `/tests/e2e/helpers/error-detector.ts` (10 KB)
**Comprehensive error detection and monitoring system**

**Main Class: `ErrorDetector`**

**Methods:**
- `start()` - Begin monitoring page for errors
- `stop()` - Stop monitoring and generate report
- `addVisualError(description, selector, screenshot)` - Manual visual error logging
- `addScreenshot(metadata)` - Add screenshot to report
- `getAllErrors()` - Get all detected errors
- `hasErrors()` - Check if errors detected
- `getErrorCount()` - Get total error count
- `exportToJSON(outputDir)` - Export report to JSON file
- `printSummary()` - Print console summary
- `reset()` - Clear all errors

**Monitors:**
- ✓ Console errors and warnings
- ✓ Network failures (4xx, 5xx status codes)
- ✓ JavaScript runtime errors
- ✓ Request failures
- ✓ Response times

**Usage Example:**
```typescript
import { ErrorDetector } from './helpers';

const detector = new ErrorDetector(page, 'my-test');
await detector.start();

// Run your tests...

const report = await detector.stop();
console.log(`Found ${report.totalErrors} errors`);

if (report.totalErrors > 0) {
  await detector.exportToJSON();
  detector.printSummary();
}
```

**Report Structure:**
```json
{
  "testName": "my-test",
  "startTime": "2025-10-12T14:30:45.123Z",
  "endTime": "2025-10-12T14:31:12.456Z",
  "duration": 27333,
  "totalErrors": 2,
  "errors": {
    "console": [...],
    "network": [...],
    "visual": [...],
    "javascript": [...]
  },
  "screenshots": [...],
  "url": "http://localhost:3000/dashboard"
}
```

---

### 4. `/tests/e2e/helpers/test-utils.ts` (14 KB)
**Common test helper functions and utilities**

**Key Constants:**
```typescript
SELECTORS = {
  DASHBOARD: { HEADER, FILTER_BAR, VEHICLE_LIST, VEHICLE_CARD, ... },
  VEHICLE_CARD: { CONTAINER, IMAGE, TITLE, PRICE, MILEAGE, ... },
  VEHICLE_DETAIL: { CONTAINER, HEADER, IMAGE_GALLERY, ... },
  FILTER_BAR: { SEARCH_INPUT, MAKE_SELECT, MODEL_SELECT, ... },
  COMMON: { BUTTON, LINK, INPUT, SELECT, ... }
}
```

**Page State Functions:**
- `waitForDashboardLoad(page, options)` - Wait for dashboard with validation
- `waitForVehicleDetail(page, options)` - Wait for detail page with validation
- `waitForNetworkIdle(page, timeout)` - Wait for network activity

**Element Interaction:**
- `getVehicleCards(page)` - Get all cards with extracted data
- `clickVehicleCard(page, index)` - Click specific card and wait for navigation
- `waitForElement(page, selector, timeout)` - Wait for single element
- `waitForElements(page, selectors, timeout)` - Wait for multiple elements
- `elementExists(page, selector)` - Check element existence

**Text & Attributes:**
- `getTextContent(page, selector)` - Get element text
- `getAttribute(page, selector, attribute)` - Get element attribute
- `typeText(page, selector, text, delay)` - Type with realistic delay
- `clearAndType(page, selector, text)` - Clear and type new text

**Utility Functions:**
- `retry(fn, options)` - Retry with exponential backoff
- `scrollToElement(page, selector)` - Scroll to element
- `setViewport(page, width, height)` - Set viewport size
- `getViewport(page)` - Get current viewport

**Usage Example:**
```typescript
import { waitForDashboardLoad, getVehicleCards, SELECTORS } from './helpers';

// Wait for dashboard
const state = await waitForDashboardLoad(page);
console.log(`Loaded ${state.vehicleCount} vehicles`);

// Get all vehicle cards
const cards = await getVehicleCards(page);
for (const card of cards) {
  console.log(`${card.year} ${card.make} ${card.model}`);
}

// Retry flaky operations
await retry(async () => {
  const element = await page.$(SELECTORS.VEHICLE_CARD.CONTAINER);
  if (!element) throw new Error('Not found');
  return element;
}, { retries: 5 });
```

---

### 5. `/tests/e2e/helpers/index.ts` (866 B)
**Central export point for all helpers**

Exports all functions and types from:
- `types.ts`
- `screenshot.ts`
- `error-detector.ts`
- `test-utils.ts`
- `browser.ts`
- `logger.ts`

**Usage:**
```typescript
// Import everything from one place
import {
  takeScreenshot,
  ErrorDetector,
  waitForDashboardLoad,
  SELECTORS,
  retry,
} from './helpers';
```

---

### 6. `/tests/e2e/helpers/README.md` (13 KB)
**Comprehensive documentation and usage guide**

Contains:
- Detailed function descriptions
- Usage examples for each utility
- Best practices
- Screenshot organization details
- Error report format
- Complete test flow examples

---

### 7. `/tests/e2e/helpers/example-usage.ts` (9.5 KB)
**Practical examples demonstrating all features**

**Includes 4 Complete Examples:**

1. **Basic Dashboard Test** - Simple navigation and validation
2. **Vehicle Card Interaction** - Card extraction and detail navigation
3. **Error Detection and Retry** - Error monitoring with retry logic
4. **Complete Flow** - End-to-end test with all features

**Run Examples:**
```bash
ts-node tests/e2e/helpers/example-usage.ts
```

---

### 8. `/tests/e2e/helpers/browser.ts` (3.1 KB - Pre-existing)
**Browser management utilities**

Additional helper functions for browser operations.

---

### 9. `/tests/e2e/helpers/logger.ts` (2.6 KB - Pre-existing)
**Logging utilities**

Formatted console output for test execution.

---

## Key Features

### Screenshot Management
- ✓ Timestamp-based folder organization
- ✓ Automatic directory creation
- ✓ Multiple capture modes (full page, element, clip)
- ✓ Rich metadata tracking
- ✓ Session-based organization

### Error Detection
- ✓ Console error monitoring
- ✓ Network failure tracking (4xx, 5xx)
- ✓ JavaScript error capture
- ✓ Request failure detection
- ✓ Response time tracking
- ✓ Manual visual error logging
- ✓ JSON report export
- ✓ Console summary output

### Test Utilities
- ✓ Centralized selector constants
- ✓ Page state validation functions
- ✓ Vehicle card extraction and interaction
- ✓ Retry with exponential backoff
- ✓ Element waiting and checking
- ✓ Text input helpers
- ✓ Viewport management

---

## Directory Structure

```
tests/
├── e2e/
│   ├── helpers/
│   │   ├── types.ts                 # Type definitions
│   │   ├── screenshot.ts            # Screenshot utilities
│   │   ├── error-detector.ts        # Error detection
│   │   ├── test-utils.ts            # Test helpers
│   │   ├── index.ts                 # Central exports
│   │   ├── browser.ts               # Browser management
│   │   ├── logger.ts                # Logging
│   │   ├── README.md                # Documentation
│   │   ├── example-usage.ts         # Usage examples
│   │   └── SUMMARY.md               # This file
│   ├── flows/                       # Test flow files (to be used)
│   └── reports/                     # Generated error reports
└── screenshots/
    └── 2025-10-12_14-30-45/        # Timestamp-based folders
        ├── dashboard-loaded.png
        ├── vehicle-detail.png
        └── ...
```

---

## Usage Quick Start

### 1. Import Helpers
```typescript
import {
  launchBrowser,
  closeBrowser,
  resetSession,
  ErrorDetector,
  waitForDashboardLoad,
  getVehicleCards,
  clickVehicleCard,
  takeScreenshot,
  SELECTORS,
} from './helpers';
```

### 2. Setup Test
```typescript
await resetSession();
const { browser, page } = await launchBrowser();
const detector = new ErrorDetector(page, 'my-test');
await detector.start();
```

### 3. Run Test
```typescript
await page.goto('http://localhost:3000/dashboard');
const state = await waitForDashboardLoad(page);
const screenshot = await takeScreenshot(page, 'loaded', { fullPage: true });
detector.addScreenshot(screenshot);
```

### 4. Cleanup
```typescript
const report = await detector.stop();
if (report.totalErrors > 0) {
  await detector.exportToJSON();
  detector.printSummary();
}
await closeBrowser({ browser, page });
```

---

## Complete Example

```typescript
import {
  launchBrowser,
  closeBrowser,
  resetSession,
  ErrorDetector,
  waitForDashboardLoad,
  getVehicleCards,
  clickVehicleCard,
  waitForVehicleDetail,
  takeScreenshot,
  retry,
} from './helpers';

async function runTest() {
  await resetSession();
  const context = await launchBrowser();
  const { browser, page } = context;
  const detector = new ErrorDetector(page, 'complete-test');

  try {
    await detector.start();

    // Navigate and wait
    await page.goto('http://localhost:3000/dashboard');
    const dashState = await waitForDashboardLoad(page);

    // Take screenshot
    const screenshot = await takeScreenshot(page, 'dashboard', { fullPage: true });
    detector.addScreenshot(screenshot);

    // Get vehicles
    const cards = await getVehicleCards(page);
    console.log(`Found ${cards.length} vehicles`);

    // Click first vehicle with retry
    await retry(() => clickVehicleCard(page, 0), { retries: 3 });

    // Validate detail page
    const detailState = await waitForVehicleDetail(page);
    if (!detailState.hasImages) {
      detector.addVisualError('No images found');
    }

    // Generate report
    const report = await detector.stop();
    if (report.totalErrors > 0) {
      await detector.exportToJSON();
      detector.printSummary();
    }

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    await takeScreenshot(page, 'failure', { fullPage: true });
    throw error;
  } finally {
    await closeBrowser(context);
  }
}

runTest().catch(console.error);
```

---

## Best Practices

1. **Always use error detection** - Catch issues early
2. **Take screenshots at key points** - Visual debugging is invaluable
3. **Use retry for flaky operations** - Network, element visibility
4. **Leverage selector constants** - Centralized maintenance
5. **Wait for proper page states** - Use `waitForDashboardLoad`, etc.
6. **Export error reports** - Keep history for analysis
7. **Reset session per test suite** - Organized screenshot folders
8. **Clean up resources** - Always close browser in `finally` block

---

## Next Steps

These helpers are now ready to be used in test flow files:

- `tests/e2e/flows/01-landing-to-dashboard.test.ts`
- `tests/e2e/flows/02-dashboard-filtering.test.ts`
- `tests/e2e/flows/03-vehicle-details.test.ts`
- Additional test flows...

All helpers export TypeScript types, provide comprehensive error handling, and follow best practices for E2E testing.

---

## Testing the Helpers

To test the helpers, run the example file:

```bash
# Start the development server first
npm run dev

# In another terminal, run the example
ts-node tests/e2e/helpers/example-usage.ts
```

---

## Documentation

- **Full API Documentation:** See `/tests/e2e/helpers/README.md`
- **Usage Examples:** See `/tests/e2e/helpers/example-usage.ts`
- **Type Definitions:** See `/tests/e2e/helpers/types.ts`

---

**Status:** ✓ Complete and ready for use
**TypeScript:** ✓ Fully typed with strict mode
**Documentation:** ✓ Comprehensive README and examples
**Code Quality:** ✓ Follows best practices

---

*Generated: 2025-10-12*
