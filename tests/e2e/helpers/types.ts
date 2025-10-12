/**
 * Type definitions for test utilities
 */

import type { ElementHandle, Page } from 'puppeteer';

/**
 * Screenshot capture options
 */
export interface ScreenshotOptions {
  fullPage?: boolean;
  element?: ElementHandle;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  omitBackground?: boolean;
  encoding?: 'base64' | 'binary';
  type?: 'png' | 'jpeg' | 'webp';
  quality?: number;
}

/**
 * Metadata for a captured screenshot
 */
export interface ScreenshotMetadata {
  name: string;
  path: string;
  timestamp: string;
  folder: string;
  fullPath: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
}

/**
 * Console error captured during test
 */
export interface ConsoleError {
  type: 'console';
  level: 'error' | 'warning';
  message: string;
  timestamp: string;
  url: string;
  stackTrace?: string;
}

/**
 * Network error captured during test
 */
export interface NetworkError {
  type: 'network';
  url: string;
  status: number;
  statusText: string;
  method: string;
  timestamp: string;
  responseTime?: number;
  failureText?: string;
}

/**
 * Visual error detected on page
 */
export interface VisualError {
  type: 'visual';
  description: string;
  selector?: string;
  timestamp: string;
  screenshotPath?: string;
}

/**
 * JavaScript error captured during test
 */
export interface JavaScriptError {
  type: 'javascript';
  message: string;
  stack?: string;
  timestamp: string;
  url: string;
}

/**
 * Union type for all error types
 */
export type TestError = ConsoleError | NetworkError | VisualError | JavaScriptError;

/**
 * Aggregated error report
 */
export interface ErrorReport {
  testName: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalErrors: number;
  errors: {
    console: ConsoleError[];
    network: NetworkError[];
    visual: VisualError[];
    javascript: JavaScriptError[];
  };
  screenshots: ScreenshotMetadata[];
  url: string;
}

/**
 * Test flow result
 */
export interface TestFlowResult {
  name: string;
  success: boolean;
  duration: number;
  errors: TestError[];
  screenshots: ScreenshotMetadata[];
  steps: TestStepResult[];
}

/**
 * Individual test step result
 */
export interface TestStepResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  screenshot?: ScreenshotMetadata;
}

/**
 * Wait options for page load
 */
export interface WaitOptions {
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
}

/**
 * Retry options for flaky operations
 */
export interface RetryOptions {
  retries?: number;
  delay?: number;
  timeout?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Vehicle card selector result
 */
export interface VehicleCardData {
  element: ElementHandle;
  index: number;
  vin?: string;
  make?: string;
  model?: string;
  year?: string;
  price?: string;
}

/**
 * Dashboard load state
 */
export interface DashboardLoadState {
  loaded: boolean;
  vehicleCount: number;
  hasFilters: boolean;
  hasVehicles: boolean;
  error?: string;
}

/**
 * Vehicle detail page state
 */
export interface VehicleDetailState {
  loaded: boolean;
  vin?: string;
  hasImages: boolean;
  hasDetails: boolean;
  hasHistory: boolean;
  error?: string;
}
