/**
 * Screenshot utility for E2E tests
 *
 * Provides functions to capture and save screenshots during test execution.
 * Screenshots are organized in timestamp-based folders for easy navigation.
 */

import { Page } from 'puppeteer';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { ScreenshotOptions, ScreenshotMetadata } from './types';

/**
 * Base directory for storing screenshots
 */
const SCREENSHOTS_BASE_DIR = path.resolve(process.cwd(), 'tests', 'screenshots');

/**
 * Current test session folder (timestamp-based)
 */
let currentSessionFolder: string | null = null;

/**
 * Get current timestamp in YYYY-MM-DD_HH-MM-SS format
 */
function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

/**
 * Create a new session folder with timestamp
 */
async function createSessionFolder(): Promise<string> {
  const timestamp = getTimestamp();
  const folderPath = path.join(SCREENSHOTS_BASE_DIR, timestamp);

  try {
    await fs.mkdir(folderPath, { recursive: true });
    currentSessionFolder = folderPath;
    return folderPath;
  } catch (error) {
    throw new Error(`Failed to create session folder: ${error}`);
  }
}

/**
 * Get or create the current session folder
 */
async function getSessionFolder(): Promise<string> {
  if (!currentSessionFolder) {
    return await createSessionFolder();
  }
  return currentSessionFolder;
}

/**
 * Sanitize filename to remove invalid characters
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/**
 * Takes a screenshot of the current page or element
 *
 * @param page - Puppeteer page instance
 * @param name - Name for the screenshot file
 * @param options - Screenshot capture options
 * @returns Screenshot metadata including path and timestamp
 *
 * @example
 * ```typescript
 * // Full page screenshot
 * const meta = await takeScreenshot(page, 'dashboard-loaded', { fullPage: true });
 *
 * // Element screenshot
 * const element = await page.$('.vehicle-card');
 * await takeScreenshot(page, 'vehicle-card', { element });
 *
 * // Custom clip region
 * await takeScreenshot(page, 'header', {
 *   clip: { x: 0, y: 0, width: 1920, height: 100 }
 * });
 * ```
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options: ScreenshotOptions = {}
): Promise<ScreenshotMetadata> {
  try {
    // Get or create session folder
    const sessionFolder = await getSessionFolder();

    // Sanitize the filename
    const sanitizedName = sanitizeFilename(name);
    const timestamp = new Date().toISOString();
    const filename = `${sanitizedName}.png`;
    const fullPath = path.join(sessionFolder, filename);

    // Get viewport size
    const viewport = page.viewport();
    const viewportData = {
      width: viewport?.width || 1920,
      height: viewport?.height || 1080,
    };

    // Get current URL
    const url = page.url();

    // Prepare screenshot options
    const screenshotOptions: any = {
      path: fullPath,
      type: options.type || 'png',
      ...options,
    };

    // Remove element from options if present (handled separately)
    if (options.element) {
      delete screenshotOptions.element;
      await options.element.screenshot(screenshotOptions);
    } else {
      await page.screenshot(screenshotOptions);
    }

    // Return metadata
    const metadata: ScreenshotMetadata = {
      name: sanitizedName,
      path: filename,
      timestamp,
      folder: path.basename(sessionFolder),
      fullPath,
      url,
      viewport: viewportData,
    };

    return metadata;
  } catch (error) {
    throw new Error(`Failed to take screenshot '${name}': ${error}`);
  }
}

/**
 * Take a full page screenshot
 *
 * @param page - Puppeteer page instance
 * @param name - Name for the screenshot file
 * @returns Screenshot metadata
 */
export async function takeFullPageScreenshot(
  page: Page,
  name: string
): Promise<ScreenshotMetadata> {
  return takeScreenshot(page, name, { fullPage: true });
}

/**
 * Take a screenshot of a specific element
 *
 * @param page - Puppeteer page instance
 * @param selector - CSS selector for the element
 * @param name - Name for the screenshot file
 * @returns Screenshot metadata
 */
export async function takeElementScreenshot(
  page: Page,
  selector: string,
  name: string
): Promise<ScreenshotMetadata> {
  const element = await page.$(selector);

  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  return takeScreenshot(page, name, { element });
}

/**
 * Take multiple screenshots with different names
 *
 * @param page - Puppeteer page instance
 * @param screenshots - Array of screenshot configs
 * @returns Array of screenshot metadata
 *
 * @example
 * ```typescript
 * await takeMultipleScreenshots(page, [
 *   { name: 'full-page', options: { fullPage: true } },
 *   { name: 'header', selector: 'header' },
 *   { name: 'footer', selector: 'footer' }
 * ]);
 * ```
 */
export async function takeMultipleScreenshots(
  page: Page,
  screenshots: Array<{
    name: string;
    selector?: string;
    options?: ScreenshotOptions;
  }>
): Promise<ScreenshotMetadata[]> {
  const results: ScreenshotMetadata[] = [];

  for (const config of screenshots) {
    try {
      let metadata: ScreenshotMetadata;

      if (config.selector) {
        metadata = await takeElementScreenshot(page, config.selector, config.name);
      } else {
        metadata = await takeScreenshot(page, config.name, config.options);
      }

      results.push(metadata);
    } catch (error) {
      console.error(`Failed to take screenshot '${config.name}':`, error);
    }
  }

  return results;
}

/**
 * Reset the session folder (starts a new session)
 * Call this at the beginning of a new test suite
 */
export async function resetSession(): Promise<string> {
  currentSessionFolder = null;
  return await createSessionFolder();
}

/**
 * Get the current session folder path
 */
export function getCurrentSessionFolder(): string | null {
  return currentSessionFolder;
}

/**
 * Ensure screenshots directory exists
 */
export async function ensureScreenshotsDir(): Promise<void> {
  try {
    await fs.mkdir(SCREENSHOTS_BASE_DIR, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create screenshots directory: ${error}`);
  }
}
