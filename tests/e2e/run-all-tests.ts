/**
 * Test runner for all E2E flows
 *
 * Executes all test flows in sequence and reports results
 */

import chalk from 'chalk';
import { runTest as runLandingToDashboard } from './flows/01-landing-to-dashboard.test';
import { runTest as runDashboardFiltering } from './flows/02-dashboard-filtering.test';
import { runTest as runVehicleDetails } from './flows/03-vehicle-details.test';
import type { TestResult } from './helpers';

interface TestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  totalScreenshots: number;
  results: TestResult[];
}

/**
 * Run all E2E tests
 */
async function runAllTests(): Promise<TestSuiteResult> {
  console.log(chalk.bold.blue('\n' + '='.repeat(70)));
  console.log(chalk.bold.blue('  YourToyotaPicks E2E Test Suite'));
  console.log(chalk.bold.blue('='.repeat(70) + '\n'));

  const results: TestResult[] = [];
  const startTime = Date.now();

  // Run tests in sequence
  const tests = [
    { name: '01-landing-to-dashboard', fn: runLandingToDashboard },
    { name: '02-dashboard-filtering', fn: runDashboardFiltering },
    { name: '03-vehicle-details', fn: runVehicleDetails },
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push(result);
    } catch (error) {
      console.error(chalk.red(`Fatal error in ${test.name}:`), error);
      results.push({
        testName: test.name,
        passed: false,
        duration: 0,
        screenshots: [],
        errors: [`Fatal error: ${error}`],
        steps: [],
      });
    }

    // Brief pause between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const totalDuration = Date.now() - startTime;

  // Calculate summary
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.filter((r) => !r.passed).length;
  const totalScreenshots = results.reduce(
    (sum, r) => sum + r.screenshots.length,
    0
  );

  const summary: TestSuiteResult = {
    totalTests: results.length,
    passedTests,
    failedTests,
    totalDuration,
    totalScreenshots,
    results,
  };

  return summary;
}

/**
 * Print test suite summary
 */
function printSummary(summary: TestSuiteResult): void {
  console.log(chalk.bold.blue('\n' + '='.repeat(70)));
  console.log(chalk.bold.blue('  Test Suite Summary'));
  console.log(chalk.bold.blue('='.repeat(70) + '\n'));

  // Overall stats
  console.log(chalk.bold('Overall Results:'));
  console.log(
    chalk.gray('  Total Tests: ') +
      chalk.white(summary.totalTests)
  );
  console.log(
    chalk.gray('  Passed: ') +
      chalk.green(summary.passedTests)
  );
  console.log(
    chalk.gray('  Failed: ') +
      (summary.failedTests > 0
        ? chalk.red(summary.failedTests)
        : chalk.green(summary.failedTests))
  );
  console.log(
    chalk.gray('  Total Duration: ') +
      chalk.white(`${(summary.totalDuration / 1000).toFixed(2)}s`)
  );
  console.log(
    chalk.gray('  Total Screenshots: ') +
      chalk.white(summary.totalScreenshots)
  );

  // Individual test results
  console.log(chalk.bold('\nIndividual Test Results:'));
  summary.results.forEach((result) => {
    const status = result.passed
      ? chalk.green('PASS')
      : chalk.red('FAIL');
    const duration = chalk.gray(`(${result.duration}ms)`);
    const screenshots = chalk.gray(
      `- ${result.screenshots.length} screenshots`
    );

    console.log(`  ${status} ${result.testName} ${duration} ${screenshots}`);

    if (!result.passed && result.errors.length > 0) {
      result.errors.forEach((error) => {
        console.log(chalk.red(`    ✗ ${error}`));
      });
    }
  });

  // Final verdict
  console.log();
  if (summary.failedTests === 0) {
    console.log(chalk.green.bold('✓ All tests passed!'));
  } else {
    console.log(
      chalk.red.bold(
        `✗ ${summary.failedTests} test(s) failed`
      )
    );
  }

  console.log(chalk.bold.blue('\n' + '='.repeat(70) + '\n'));
}

/**
 * Main execution
 */
async function main() {
  try {
    const summary = await runAllTests();
    printSummary(summary);

    // Exit with appropriate code
    process.exit(summary.failedTests > 0 ? 1 : 0);
  } catch (error) {
    console.error(chalk.red.bold('\nFatal error running test suite:'));
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { runAllTests, printSummary };
