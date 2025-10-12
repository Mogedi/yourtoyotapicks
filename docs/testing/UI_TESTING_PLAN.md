# 🧪 UI Testing Plan with Puppeteer

## Overview

Automated end-to-end UI testing for YourToyotaPicks using Puppeteer to:
- Test all user flows
- Capture screenshots at each step
- Detect console errors
- Generate visual test reports
- Enable automated debugging

---

## 🎯 Goals

1. **Test All Critical Flows**
   - Landing page → Dashboard navigation
   - Dashboard filtering and sorting
   - Vehicle card → Detail page navigation
   - Review system (add review, save, verify)
   - VIN decoder API integration
   - Error states and edge cases

2. **Screenshot Management**
   - Organized by timestamp (human-readable)
   - One folder per test run
   - Screenshots at each step
   - Before/after comparisons
   - Error state captures

3. **Error Detection**
   - Console errors (JavaScript errors)
   - Network errors (failed API calls)
   - Visual regressions
   - Broken links/buttons
   - Missing elements

4. **Automated Fixes**
   - Parse screenshots for error messages
   - Identify failing selectors
   - Generate fix suggestions
   - Re-run tests after fixes

---

## 📋 Implementation Approach

### Option 1: Standalone Puppeteer Script (Recommended)
**Pros:**
- Simple, no MCP server needed
- Direct control over browser
- Easy to debug
- Fast execution

**Cons:**
- Manual test execution
- No real-time monitoring

**Use Case:** Best for development and CI/CD

### Option 2: MCP Server with Puppeteer
**Pros:**
- Real-time test execution
- Interactive debugging
- Can be triggered from Claude
- Persistent browser sessions

**Cons:**
- More complex setup
- Requires MCP server running
- Overkill for simple tests

**Use Case:** Best for continuous testing during development

### Option 3: Hybrid Approach (Recommended for This Project)
**Pros:**
- Standalone scripts for automation
- MCP integration for interactive debugging
- Best of both worlds

**Implementation:**
- Standalone test runner script
- Optional MCP server for advanced features
- Screenshots saved locally
- Can be triggered manually or via CI/CD

---

## 🏗️ Architecture

```
yourtoyotapicks/
├── tests/
│   ├── e2e/
│   │   ├── flows/
│   │   │   ├── 01-landing-to-dashboard.test.ts
│   │   │   ├── 02-dashboard-filtering.test.ts
│   │   │   ├── 03-vehicle-details.test.ts
│   │   │   ├── 04-review-system.test.ts
│   │   │   ├── 05-vin-decoder.test.ts
│   │   │   └── 06-error-states.test.ts
│   │   ├── helpers/
│   │   │   ├── screenshot.ts
│   │   │   ├── error-detector.ts
│   │   │   └── test-utils.ts
│   │   └── run-all-tests.ts
│   └── screenshots/
│       └── [YYYY-MM-DD_HH-MM-SS]/
│           ├── 01-landing-page.png
│           ├── 02-dashboard-loaded.png
│           ├── 03-filter-applied.png
│           ├── 04-vehicle-detail.png
│           ├── 05-review-added.png
│           ├── errors.json
│           └── test-report.html
├── scripts/
│   ├── run-ui-tests.sh
│   └── analyze-screenshots.ts
└── package.json (updated with Puppeteer)
```

---

## 📦 Dependencies to Install

```json
{
  "devDependencies": {
    "puppeteer": "^23.0.0",
    "puppeteer-core": "^23.0.0",
    "@types/puppeteer": "^7.0.4",
    "pixelmatch": "^6.0.0",
    "pngjs": "^7.0.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.1"
  }
}
```

---

## 🧪 Test Scenarios

### Test 1: Landing Page → Dashboard
**Steps:**
1. Navigate to http://localhost:3001
2. Screenshot: Landing page
3. Verify "View Dashboard" button exists
4. Click button
5. Wait for navigation
6. Screenshot: Dashboard loaded
7. Verify vehicle cards appear
8. Check console for errors

**Expected:**
- No console errors
- Dashboard shows 32 vehicles
- URL is /dashboard

---

### Test 2: Dashboard Filtering
**Steps:**
1. Start on dashboard
2. Screenshot: Initial state (all vehicles)
3. Filter by Make: "Toyota"
4. Screenshot: After Toyota filter
5. Verify only Toyota vehicles shown
6. Filter by Model: "RAV4"
7. Screenshot: After RAV4 filter
8. Verify only RAV4 vehicles shown
9. Set price max: $20,000
10. Screenshot: After price filter
11. Verify price filtering works
12. Click "Clear Filters"
13. Screenshot: After clear
14. Verify all vehicles shown again

**Expected:**
- Filters apply correctly
- Result count updates
- No console errors
- Clear filters resets state

---

### Test 3: Vehicle Detail Navigation
**Steps:**
1. Start on dashboard
2. Screenshot: Dashboard with vehicles
3. Click first vehicle card
4. Wait for navigation
5. Screenshot: Detail page loaded
6. Verify URL contains VIN
7. Verify tabs exist (Review, Specs, History, etc.)
8. Click each tab
9. Screenshot: Each tab view
10. Verify tab content loads
11. Click "Back to Dashboard"
12. Screenshot: Back on dashboard

**Expected:**
- Navigation works
- All tabs load
- No broken images
- No console errors

---

### Test 4: Review System
**Steps:**
1. Navigate to vehicle detail
2. Click "Review" tab
3. Screenshot: Review form empty
4. Click 4 stars
5. Screenshot: Stars selected
6. Type notes: "Great vehicle, low mileage"
7. Screenshot: Notes entered
8. Check "Mark as Reviewed"
9. Screenshot: Checkbox checked
10. Click "Save Review"
11. Wait for success message
12. Screenshot: Success state
13. Go to "Details" tab
14. Screenshot: Review summary
15. Verify review data shown
16. Go back to dashboard
17. Screenshot: Dashboard with reviewed badge

**Expected:**
- Star rating works
- Notes save
- Success message appears
- Reviewed badge on card

---

### Test 5: VIN Decoder
**Steps:**
1. Navigate to dashboard
2. Open browser DevTools Network tab
3. Click vehicle with VIN: 5YFBURHE5HP690324
4. Go to "Specifications" tab
5. Screenshot: VIN specs loaded
6. Verify VIN decode data present
7. Check network for NHTSA API call
8. Verify API returns 200 OK

**Expected:**
- NHTSA API called
- VIN data displayed
- No API errors

---

### Test 6: Error States
**Steps:**
1. Test with invalid VIN
2. Test with missing vehicle (404)
3. Test with network disconnected
4. Test with slow 3G
5. Screenshot each error state

**Expected:**
- Graceful error handling
- User-friendly messages
- No crashes

---

## 📸 Screenshot Organization

### Folder Structure
```
tests/screenshots/
├── 2025-01-15_14-30-45/          # Test run timestamp
│   ├── 01-landing-page.png
│   ├── 02-dashboard-loaded.png
│   ├── 03-filter-toyota.png
│   ├── 04-filter-rav4.png
│   ├── 05-vehicle-detail.png
│   ├── 06-review-tab.png
│   ├── 07-review-saved.png
│   ├── errors.json               # All errors found
│   ├── test-report.html          # Visual report
│   └── metadata.json             # Test run info
├── 2025-01-15_15-22-10/          # Another test run
│   └── ...
└── latest/                        # Symlink to latest run
```

### Metadata Format
```json
{
  "timestamp": "2025-01-15T14:30:45.123Z",
  "readableTime": "2025-01-15_14-30-45",
  "testSuite": "Full E2E Suite",
  "duration": "45.2s",
  "totalTests": 6,
  "passed": 5,
  "failed": 1,
  "screenshots": 24,
  "errors": [
    {
      "test": "Test 4: Review System",
      "step": "Save Review",
      "type": "console.error",
      "message": "Failed to save review: Network error",
      "screenshot": "07-review-saved.png",
      "timestamp": "2025-01-15T14:32:10.456Z"
    }
  ]
}
```

---

## 🔍 Error Detection Strategy

### 1. Console Error Monitoring
```typescript
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    errors.push({
      type: 'console.error',
      message: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString(),
    });
  }
});
```

### 2. Network Error Monitoring
```typescript
page.on('requestfailed', (request) => {
  errors.push({
    type: 'network.failed',
    url: request.url(),
    method: request.method(),
    failure: request.failure()?.errorText,
  });
});
```

### 3. Visual Error Detection
- Parse screenshots for error text
- Look for red error boxes
- Check for "Error", "Failed", "404" text
- Detect missing images (broken image icons)

### 4. Element Missing Detection
```typescript
async function verifyElement(selector: string) {
  const element = await page.$(selector);
  if (!element) {
    errors.push({
      type: 'missing.element',
      selector,
      screenshot: await takeScreenshot('missing-element'),
    });
  }
}
```

---

## 🛠️ Test Utilities

### Screenshot Helper
```typescript
async function takeScreenshot(
  page: Page,
  name: string,
  options?: {
    fullPage?: boolean;
    element?: string;
    highlight?: string[];
  }
): Promise<string> {
  const timestamp = getTestRunTimestamp();
  const screenshotPath = `tests/screenshots/${timestamp}/${name}.png`;

  await page.screenshot({
    path: screenshotPath,
    fullPage: options?.fullPage ?? true,
  });

  return screenshotPath;
}
```

### Error Detector
```typescript
async function detectErrors(page: Page): Promise<Error[]> {
  const errors: Error[] = [];

  // Check for visible error messages
  const errorElements = await page.$$('[role="alert"], .error, .text-red-500');
  for (const element of errorElements) {
    const text = await element.textContent();
    if (text) {
      errors.push({
        type: 'ui.error',
        message: text,
        screenshot: await takeScreenshot(page, 'ui-error'),
      });
    }
  }

  return errors;
}
```

### Wait Helpers
```typescript
async function waitForDashboardLoad(page: Page) {
  await page.waitForSelector('[data-testid="vehicle-card"]', {
    timeout: 10000,
  });
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="vehicle-card"]').length > 0
  );
}
```

---

## 📊 Test Report Generation

### HTML Report Structure
```html
<!DOCTYPE html>
<html>
<head>
  <title>UI Test Report - 2025-01-15_14-30-45</title>
  <style>/* Beautiful report styles */</style>
</head>
<body>
  <h1>YourToyotaPicks - UI Test Report</h1>
  <div class="summary">
    <div class="stat passed">5 Passed</div>
    <div class="stat failed">1 Failed</div>
    <div class="stat total">6 Total</div>
  </div>

  <div class="test-details">
    <h2>Test 1: Landing Page → Dashboard ✅</h2>
    <div class="screenshots">
      <img src="01-landing-page.png" />
      <img src="02-dashboard-loaded.png" />
    </div>

    <h2>Test 4: Review System ❌</h2>
    <div class="error">
      <pre>Failed to save review: Network error</pre>
      <img src="07-review-saved.png" />
    </div>
  </div>
</body>
</html>
```

---

## 🚀 Execution Plan

### Phase 1: Setup (30 minutes)
- [ ] Install Puppeteer and dependencies
- [ ] Create test folder structure
- [ ] Set up screenshot utilities
- [ ] Create error detection helpers

### Phase 2: Core Tests (1 hour)
- [ ] Test 1: Landing → Dashboard
- [ ] Test 2: Dashboard Filtering
- [ ] Test 3: Vehicle Detail Navigation
- [ ] Test 4: Review System

### Phase 3: Advanced Tests (30 minutes)
- [ ] Test 5: VIN Decoder
- [ ] Test 6: Error States
- [ ] Edge cases and error scenarios

### Phase 4: Reporting (30 minutes)
- [ ] Screenshot organization
- [ ] Error aggregation
- [ ] HTML report generation
- [ ] Test summary with pass/fail

### Phase 5: Automation (30 minutes)
- [ ] Shell script for easy execution
- [ ] Integration with npm scripts
- [ ] CI/CD ready (optional)
- [ ] MCP server (optional)

---

## ✅ Implementation Checklist

### Prerequisites
- [x] App running on http://localhost:3001
- [x] Mock data loaded (32 vehicles)
- [ ] Install Puppeteer
- [ ] Create test folder structure

### Test Implementation
- [ ] Landing page test
- [ ] Dashboard filtering test
- [ ] Vehicle detail navigation test
- [ ] Review system test
- [ ] VIN decoder test
- [ ] Error states test

### Screenshot Management
- [ ] Timestamp-based folders
- [ ] Screenshot helper function
- [ ] Metadata JSON generation
- [ ] Latest symlink

### Error Detection
- [ ] Console error listener
- [ ] Network error listener
- [ ] Visual error detection
- [ ] Missing element detection

### Reporting
- [ ] Error aggregation
- [ ] HTML report generator
- [ ] Test summary
- [ ] Pass/fail statistics

### Automation
- [ ] Shell script: `./scripts/run-ui-tests.sh`
- [ ] npm script: `npm run test:ui`
- [ ] Screenshot analyzer script
- [ ] Auto-fix suggestions

---

## 🎬 Usage Examples

### Run All Tests
```bash
npm run test:ui
# or
./scripts/run-ui-tests.sh
```

### Run Specific Test
```bash
npm run test:ui -- --test=review-system
```

### Run in Headless Mode (CI/CD)
```bash
npm run test:ui -- --headless
```

### Run with Slow Motion (Debugging)
```bash
npm run test:ui -- --slow-mo=100
```

### View Latest Report
```bash
open tests/screenshots/latest/test-report.html
```

---

## 🔧 Next Steps

1. **Choose approach**: Standalone Puppeteer (recommended for now)
2. **Install dependencies**: Add Puppeteer to package.json
3. **Create test structure**: Folders and helper files
4. **Implement Test 1**: Validate basic flow works
5. **Add screenshot utilities**: Timestamp folders, metadata
6. **Implement remaining tests**: Tests 2-6
7. **Build error detection**: Console, network, visual
8. **Generate reports**: HTML report with screenshots
9. **Create run script**: Easy execution
10. **Document usage**: README for tests

---

## 💡 Advanced Features (Optional)

- **Visual regression testing**: Compare screenshots to baseline
- **Performance metrics**: Page load times, rendering times
- **Accessibility testing**: ARIA labels, keyboard navigation
- **Mobile testing**: Test on different viewports
- **Video recording**: Record test execution
- **Interactive mode**: Pause on errors
- **Auto-healing selectors**: Update tests when UI changes
- **Parallel execution**: Run tests concurrently

---

## 📝 Deliverables

After implementation, you'll have:
- ✅ 6 automated E2E tests
- ✅ Screenshot capture at each step
- ✅ Timestamp-organized folders
- ✅ Error detection (console, network, visual)
- ✅ HTML test report
- ✅ JSON metadata
- ✅ Easy-to-run scripts
- ✅ Visual debugging capability

---

**Ready to implement?** Let me know if you want to proceed with this plan!
