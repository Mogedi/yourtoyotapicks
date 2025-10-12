/**
 * Error Detection System for E2E Tests
 *
 * Monitors page for console errors, network failures, and visual errors.
 * Aggregates all errors and exports detailed reports.
 */

import { Page, HTTPRequest, HTTPResponse, ConsoleMessage } from 'puppeteer';
import { promises as fs } from 'fs';
import * as path from 'path';
import type {
  TestError,
  ConsoleError,
  NetworkError,
  VisualError,
  JavaScriptError,
  ErrorReport,
  ScreenshotMetadata,
} from './types';

/**
 * ErrorDetector class for monitoring page errors
 *
 * @example
 * ```typescript
 * const detector = new ErrorDetector(page, 'dashboard-test');
 * await detector.start();
 *
 * // Run your tests...
 *
 * const report = await detector.stop();
 * console.log(`Found ${report.totalErrors} errors`);
 * ```
 */
export class ErrorDetector {
  private page: Page;
  private testName: string;
  private startTime: Date;
  private endTime: Date | null = null;

  private consoleErrors: ConsoleError[] = [];
  private networkErrors: NetworkError[] = [];
  private visualErrors: VisualError[] = [];
  private javascriptErrors: JavaScriptError[] = [];
  private screenshots: ScreenshotMetadata[] = [];

  private isMonitoring = false;
  private networkRequests: Map<string, { request: HTTPRequest; startTime: number }> = new Map();

  constructor(page: Page, testName: string) {
    this.page = page;
    this.testName = testName;
    this.startTime = new Date();
  }

  /**
   * Start monitoring the page for errors
   */
  async start(): Promise<void> {
    if (this.isMonitoring) {
      throw new Error('Error detector is already monitoring');
    }

    this.isMonitoring = true;
    this.startTime = new Date();

    // Listen for console messages
    this.page.on('console', this.handleConsoleMessage.bind(this));

    // Listen for page errors
    this.page.on('pageerror', this.handlePageError.bind(this));

    // Listen for request failures
    this.page.on('requestfailed', this.handleRequestFailed.bind(this));

    // Listen for responses (to track network errors)
    this.page.on('response', this.handleResponse.bind(this));

    // Track request timing
    this.page.on('request', this.handleRequest.bind(this));
  }

  /**
   * Stop monitoring and return the error report
   */
  async stop(): Promise<ErrorReport> {
    this.isMonitoring = false;
    this.endTime = new Date();

    // Remove all listeners
    this.page.removeAllListeners('console');
    this.page.removeAllListeners('pageerror');
    this.page.removeAllListeners('requestfailed');
    this.page.removeAllListeners('response');
    this.page.removeAllListeners('request');

    return this.generateReport();
  }

  /**
   * Handle console messages
   */
  private handleConsoleMessage(msg: ConsoleMessage): void {
    const type = msg.type();

    // Note: Puppeteer ConsoleMessage type is 'error', not 'warning'
    // We'll capture 'error' and 'warn' types
    if (type === 'error') {
      const error: ConsoleError = {
        type: 'console',
        level: 'error',
        message: msg.text(),
        timestamp: new Date().toISOString(),
        url: msg.location().url || this.page.url(),
        stackTrace: msg.stackTrace().length > 0 ? JSON.stringify(msg.stackTrace()) : undefined,
      };

      this.consoleErrors.push(error);
    } else if (type === 'warn') {
      const error: ConsoleError = {
        type: 'console',
        level: 'warning',
        message: msg.text(),
        timestamp: new Date().toISOString(),
        url: msg.location().url || this.page.url(),
        stackTrace: msg.stackTrace().length > 0 ? JSON.stringify(msg.stackTrace()) : undefined,
      };

      this.consoleErrors.push(error);
    }
  }

  /**
   * Handle page JavaScript errors
   */
  private handlePageError(error: Error): void {
    const jsError: JavaScriptError = {
      type: 'javascript',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
    };

    this.javascriptErrors.push(jsError);
  }

  /**
   * Handle failed requests
   */
  private handleRequestFailed(request: HTTPRequest): void {
    const failure = request.failure();

    const networkError: NetworkError = {
      type: 'network',
      url: request.url(),
      status: 0,
      statusText: 'Request Failed',
      method: request.method(),
      timestamp: new Date().toISOString(),
      failureText: failure?.errorText || 'Unknown error',
    };

    this.networkErrors.push(networkError);
  }

  /**
   * Handle HTTP responses to detect errors
   */
  private handleResponse(response: HTTPResponse): void {
    const status = response.status();
    const request = response.request();

    // Track response time
    const requestData = this.networkRequests.get(request.url());
    const responseTime = requestData
      ? Date.now() - requestData.startTime
      : undefined;

    // Detect HTTP errors (4xx, 5xx)
    if (status >= 400) {
      const networkError: NetworkError = {
        type: 'network',
        url: response.url(),
        status,
        statusText: response.statusText(),
        method: request.method(),
        timestamp: new Date().toISOString(),
        responseTime,
      };

      this.networkErrors.push(networkError);
    }

    // Clean up request tracking
    this.networkRequests.delete(request.url());
  }

  /**
   * Handle outgoing requests (for timing)
   */
  private handleRequest(request: HTTPRequest): void {
    this.networkRequests.set(request.url(), {
      request,
      startTime: Date.now(),
    });
  }

  /**
   * Manually add a visual error
   */
  addVisualError(description: string, selector?: string, screenshotPath?: string): void {
    const visualError: VisualError = {
      type: 'visual',
      description,
      selector,
      timestamp: new Date().toISOString(),
      screenshotPath,
    };

    this.visualErrors.push(visualError);
  }

  /**
   * Add a screenshot to the report
   */
  addScreenshot(screenshot: ScreenshotMetadata): void {
    this.screenshots.push(screenshot);
  }

  /**
   * Get all errors
   */
  getAllErrors(): TestError[] {
    return [
      ...this.consoleErrors,
      ...this.networkErrors,
      ...this.visualErrors,
      ...this.javascriptErrors,
    ];
  }

  /**
   * Check if any errors were detected
   */
  hasErrors(): boolean {
    return this.getAllErrors().length > 0;
  }

  /**
   * Get error count
   */
  getErrorCount(): number {
    return this.getAllErrors().length;
  }

  /**
   * Generate the error report
   */
  private generateReport(): ErrorReport {
    const endTime = this.endTime || new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    return {
      testName: this.testName,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      totalErrors: this.getErrorCount(),
      errors: {
        console: this.consoleErrors,
        network: this.networkErrors,
        visual: this.visualErrors,
        javascript: this.javascriptErrors,
      },
      screenshots: this.screenshots,
      url: this.page.url(),
    };
  }

  /**
   * Export error report to JSON file
   */
  async exportToJSON(outputDir?: string): Promise<string> {
    const report = this.generateReport();
    const dir = outputDir || path.join(process.cwd(), 'tests', 'reports');

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${this.testName}_${timestamp}.json`;
    const filepath = path.join(dir, filename);

    // Write report to file
    await fs.writeFile(filepath, JSON.stringify(report, null, 2), 'utf-8');

    return filepath;
  }

  /**
   * Print error summary to console
   */
  printSummary(): void {
    const report = this.generateReport();

    console.log('\n=== Error Detection Report ===');
    console.log(`Test: ${report.testName}`);
    console.log(`Duration: ${report.duration}ms`);
    console.log(`Total Errors: ${report.totalErrors}`);
    console.log(`\nBreakdown:`);
    console.log(`  Console Errors: ${report.errors.console.length}`);
    console.log(`  Network Errors: ${report.errors.network.length}`);
    console.log(`  Visual Errors: ${report.errors.visual.length}`);
    console.log(`  JavaScript Errors: ${report.errors.javascript.length}`);

    if (report.totalErrors > 0) {
      console.log('\n=== Error Details ===');

      // Print console errors
      if (report.errors.console.length > 0) {
        console.log('\nConsole Errors:');
        report.errors.console.forEach((error, index) => {
          console.log(`  ${index + 1}. [${error.level}] ${error.message}`);
        });
      }

      // Print network errors
      if (report.errors.network.length > 0) {
        console.log('\nNetwork Errors:');
        report.errors.network.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.method} ${error.url} - ${error.status} ${error.statusText}`);
        });
      }

      // Print visual errors
      if (report.errors.visual.length > 0) {
        console.log('\nVisual Errors:');
        report.errors.visual.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.description}`);
          if (error.selector) {
            console.log(`     Selector: ${error.selector}`);
          }
        });
      }

      // Print JavaScript errors
      if (report.errors.javascript.length > 0) {
        console.log('\nJavaScript Errors:');
        report.errors.javascript.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.message}`);
        });
      }
    }

    console.log('\n=============================\n');
  }

  /**
   * Reset the error detector (clear all errors)
   */
  reset(): void {
    this.consoleErrors = [];
    this.networkErrors = [];
    this.visualErrors = [];
    this.javascriptErrors = [];
    this.screenshots = [];
    this.networkRequests.clear();
    this.startTime = new Date();
    this.endTime = null;
  }
}

/**
 * Create and start an error detector
 */
export async function createErrorDetector(
  page: Page,
  testName: string
): Promise<ErrorDetector> {
  const detector = new ErrorDetector(page, testName);
  await detector.start();
  return detector;
}
