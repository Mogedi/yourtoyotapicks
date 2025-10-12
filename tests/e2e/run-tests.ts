/**
 * E2E Test Runner
 *
 * Runs all E2E tests and generates a comprehensive report
 */

import { testReviewSystem } from './flows/04-review-system.test';
import { testVINDecoder } from './flows/05-vin-decoder.test';
import { testErrorStates } from './flows/06-error-states.test';
import { TestFlowResult } from './helpers/types';

interface TestSuite {
  name: string;
  testFunction: () => Promise<TestFlowResult>;
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'Review System',
    testFunction: testReviewSystem,
  },
  {
    name: 'VIN Decoder',
    testFunction: testVINDecoder,
  },
  {
    name: 'Error States',
    testFunction: testErrorStates,
  },
];

/**
 * Run all test suites
 */
async function runAllTests(): Promise<void> {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    YourToyotaPicks E2E Tests                  ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

  const results: Array<TestFlowResult & { suiteName: string }> = [];
  const startTime = Date.now();

  // Run each test suite
  for (const suite of TEST_SUITES) {
    console.log(`\n🧪 Running Test Suite: ${suite.name}`);
    console.log('─────────────────────────────────────────────────────────────');

    try {
      const result = await suite.testFunction();
      results.push({
        ...result,
        suiteName: suite.name,
      });

      if (result.success) {
        console.log(`✓ ${suite.name} PASSED`);
      } else {
        console.log(`✗ ${suite.name} FAILED`);
      }
    } catch (error) {
      console.error(`✗ ${suite.name} CRASHED:`, error);
      results.push({
        name: suite.name,
        suiteName: suite.name,
        success: false,
        duration: 0,
        errors: [
          {
            type: 'crash',
            message: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
          },
        ],
        screenshots: [],
        steps: [],
      });
    }

    // Wait between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const totalDuration = Date.now() - startTime;

  // Print summary report
  printSummaryReport(results, totalDuration);

  // Exit with appropriate code
  const allPassed = results.every((r) => r.success);
  process.exit(allPassed ? 0 : 1);
}

/**
 * Print summary report
 */
function printSummaryReport(
  results: Array<TestFlowResult & { suiteName: string }>,
  totalDuration: number
): void {
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                         TEST SUMMARY                          ');
  console.log('═══════════════════════════════════════════════════════════════');

  // Overall statistics
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.success).length;
  const failedTests = totalTests - passedTests;
  const totalSteps = results.reduce((sum, r) => sum + r.steps.length, 0);
  const totalScreenshots = results.reduce((sum, r) => sum + r.screenshots.length, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  console.log('\n📊 Overall Statistics:');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`  Total Test Suites:     ${totalTests}`);
  console.log(`  Passed:                ${passedTests}`);
  console.log(`  Failed:                ${failedTests}`);
  console.log(`  Total Duration:        ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`  Total Steps:           ${totalSteps}`);
  console.log(`  Screenshots Captured:  ${totalScreenshots}`);
  console.log(`  Errors Detected:       ${totalErrors}`);

  // Individual test results
  console.log('\n📋 Test Results:');
  console.log('─────────────────────────────────────────────────────────────');

  results.forEach((result, index) => {
    const status = result.success ? '✓ PASS' : '✗ FAIL';
    const duration = (result.duration / 1000).toFixed(2);

    console.log(`\n  ${index + 1}. ${result.suiteName}`);
    console.log(`     Status:      ${status}`);
    console.log(`     Duration:    ${duration}s`);
    console.log(`     Steps:       ${result.steps.length}`);
    console.log(`     Screenshots: ${result.screenshots.length}`);

    if (result.errors.length > 0) {
      console.log(`     Errors:      ${result.errors.length}`);

      // Show first error
      if (result.errors[0]) {
        const firstError = result.errors[0];
        console.log(`     First Error: ${firstError.message || firstError.type}`);
      }
    }
  });

  // Failed tests details
  const failedResults = results.filter((r) => !r.success);
  if (failedResults.length > 0) {
    console.log('\n❌ Failed Tests Details:');
    console.log('─────────────────────────────────────────────────────────────');

    failedResults.forEach((result) => {
      console.log(`\n  ${result.suiteName}:`);

      result.errors.forEach((error, index) => {
        console.log(`    Error ${index + 1}:`);
        console.log(`      Type:    ${error.type}`);
        console.log(`      Message: ${error.message}`);
        if (error.url) {
          console.log(`      URL:     ${error.url}`);
        }
      });
    });
  }

  // Screenshots location
  if (totalScreenshots > 0) {
    console.log('\n📸 Screenshots:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('  Location: tests/screenshots/');
    console.log(`  Total: ${totalScreenshots} files`);
  }

  // Final result
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');

  if (failedTests === 0) {
    console.log('                  ✅ ALL TESTS PASSED                          ');
  } else {
    console.log(`                ❌ ${failedTests} TEST(S) FAILED                `);
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');
}

/**
 * Run specific test by name
 */
async function runSpecificTest(testName: string): Promise<void> {
  const suite = TEST_SUITES.find(
    (s) => s.name.toLowerCase() === testName.toLowerCase() || s.name.toLowerCase().includes(testName.toLowerCase())
  );

  if (!suite) {
    console.error(`❌ Test suite not found: ${testName}`);
    console.log('\nAvailable test suites:');
    TEST_SUITES.forEach((s) => console.log(`  - ${s.name}`));
    process.exit(1);
  }

  console.log(`\n🧪 Running Test Suite: ${suite.name}\n`);

  try {
    const result = await suite.testFunction();

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`                    ${suite.name} Results                       `);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Status:      ${result.success ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`  Duration:    ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`  Steps:       ${result.steps.length}`);
    console.log(`  Screenshots: ${result.screenshots.length}`);
    console.log(`  Errors:      ${result.errors.length}`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ Test crashed:`, error);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length > 0) {
  // Run specific test
  const testName = args[0];
  runSpecificTest(testName);
} else {
  // Run all tests
  runAllTests();
}
