import puppeteer, { Browser, Page } from 'puppeteer';

export interface BrowserContext {
  browser: Browser;
  page: Page;
}

/**
 * Launch a new browser instance
 */
export async function launchBrowser(): Promise<BrowserContext> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  return { browser, page };
}

/**
 * Close browser instance
 */
export async function closeBrowser(context: BrowserContext): Promise<void> {
  if (context.page) {
    await context.page.close();
  }
  if (context.browser) {
    await context.browser.close();
  }
}

/**
 * Navigate to a URL with error handling
 */
export async function navigateTo(
  page: Page,
  url: string,
  timeout: number = 30000
): Promise<void> {
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout,
  });
}

/**
 * Wait for selector with timeout
 */
export async function waitForSelector(
  page: Page,
  selector: string,
  timeout: number = 10000
): Promise<void> {
  await page.waitForSelector(selector, { timeout });
}

/**
 * Click element by selector
 */
export async function clickElement(
  page: Page,
  selector: string
): Promise<void> {
  await page.waitForSelector(selector);
  await page.click(selector);
}

/**
 * Get element count
 */
export async function getElementCount(
  page: Page,
  selector: string
): Promise<number> {
  const elements = await page.$$(selector);
  return elements.length;
}

/**
 * Get element text content
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string | null> {
  const element = await page.$(selector);
  if (!element) return null;

  return await page.evaluate((el) => el.textContent, element);
}

/**
 * Type into input field
 */
export async function typeIntoField(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  await page.waitForSelector(selector);
  await page.type(selector, text);
}

/**
 * Clear input field
 */
export async function clearField(
  page: Page,
  selector: string
): Promise<void> {
  await page.waitForSelector(selector);
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
}

/**
 * Wait for navigation
 */
export async function waitForNavigation(
  page: Page,
  timeout: number = 10000
): Promise<void> {
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout });
}

/**
 * Get current URL
 */
export function getCurrentUrl(page: Page): string {
  return page.url();
}

/**
 * Check if element exists
 */
export async function elementExists(
  page: Page,
  selector: string
): Promise<boolean> {
  const element = await page.$(selector);
  return element !== null;
}

/**
 * Get all console errors (excluding expected Supabase errors)
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];

  // Expected errors to ignore (Supabase not configured)
  const ignoredErrors = [
    'Failed to load resource: the server responded with a status of 404',
    'Failed to load resource: net::ERR_NAME_NOT_RESOLVED',
    'Error fetching listings',
    'Error in getListings',
    'Error fetching listing by VIN',
    'Error in getListingByVin',
    'placeholder.supabase.co',
  ];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const errorText = msg.text();
      // Only add error if it's not in the ignore list
      const isIgnored = ignoredErrors.some(ignored => errorText.includes(ignored));
      if (!isIgnored) {
        errors.push(errorText);
      }
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return errors;
}
