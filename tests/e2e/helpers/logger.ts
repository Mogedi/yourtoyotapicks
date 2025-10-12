import chalk from 'chalk';
import type { ScreenshotMetadata } from './types';

export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  screenshots: ScreenshotMetadata[];
  errors: string[];
  steps: TestStep[];
}

export interface TestStep {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

/**
 * Log test start
 */
export function logTestStart(testName: string): void {
  console.log(chalk.blue.bold(`\n\n▶ Starting test: ${testName}`));
  console.log(chalk.gray('─'.repeat(60)));
}

/**
 * Log test step
 */
export function logStep(stepName: string): void {
  console.log(chalk.cyan(`  → ${stepName}`));
}

/**
 * Log success
 */
export function logSuccess(message: string): void {
  console.log(chalk.green(`  ✓ ${message}`));
}

/**
 * Log error
 */
export function logError(message: string): void {
  console.log(chalk.red(`  ✗ ${message}`));
}

/**
 * Log warning
 */
export function logWarning(message: string): void {
  console.log(chalk.yellow(`  ⚠ ${message}`));
}

/**
 * Log info
 */
export function logInfo(message: string): void {
  console.log(chalk.gray(`    ${message}`));
}

/**
 * Log test result summary
 */
export function logTestResult(result: TestResult): void {
  console.log(chalk.gray('─'.repeat(60)));

  if (result.passed) {
    console.log(
      chalk.green.bold(`✓ ${result.testName} PASSED`) +
        chalk.gray(` (${result.duration}ms)`)
    );
  } else {
    console.log(
      chalk.red.bold(`✗ ${result.testName} FAILED`) +
        chalk.gray(` (${result.duration}ms)`)
    );
  }

  console.log(chalk.gray(`  Screenshots: ${result.screenshots.length}`));

  if (result.errors.length > 0) {
    console.log(chalk.red(`  Errors: ${result.errors.length}`));
    result.errors.forEach((error) => {
      console.log(chalk.red(`    - ${error}`));
    });
  }

  console.log('');
}

/**
 * Format duration in ms to readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Create a test result object
 */
export function createTestResult(
  testName: string,
  passed: boolean,
  duration: number,
  screenshots: ScreenshotMetadata[] = [],
  errors: string[] = [],
  steps: TestStep[] = []
): TestResult {
  return {
    testName,
    passed,
    duration,
    screenshots,
    errors,
    steps,
  };
}

/**
 * Create a test step object
 */
export function createTestStep(
  name: string,
  passed: boolean,
  duration: number,
  error?: string
): TestStep {
  return {
    name,
    passed,
    duration,
    error,
  };
}
