/**
 * Test Utility Functions for E2E Tests
 *
 * Common helpers for waiting, element selection, and test operations.
 */

import { Page, ElementHandle } from 'puppeteer';
import type {
  WaitOptions,
  RetryOptions,
  VehicleCardData,
  DashboardLoadState,
  VehicleDetailState,
} from './types';

/**
 * Common CSS selectors used across tests
 */
export const SELECTORS = {
  // Dashboard page
  DASHBOARD: {
    HEADER: 'h1',
    FILTER_BAR: '[role="region"]', // Adjust based on actual implementation
    VEHICLE_LIST: '[data-testid="vehicle-list"]',
    VEHICLE_CARD: '[data-testid="vehicle-card"]',
    EMPTY_STATE: '[data-testid="empty-state"]',
    LOADING_SPINNER: '[data-testid="loading"]',
  },

  // Vehicle card
  VEHICLE_CARD: {
    CONTAINER: '.group', // Based on VehicleCard component
    IMAGE: 'img',
    TITLE: 'h3',
    PRICE: '[class*="font-bold"]',
    MILEAGE: '[class*="text-muted-foreground"]',
    LOCATION: 'svg.lucide-map-pin',
    VIEW_DETAILS_BUTTON: 'a[href*="/dashboard/"]',
    PRIORITY_BADGE: '[class*="bg-amber-500"]',
    RUST_WARNING: 'svg.lucide-alert-triangle',
    REVIEWED_BADGE: '[class*="bg-green-500"]',
  },

  // Vehicle detail page
  VEHICLE_DETAIL: {
    CONTAINER: '[data-testid="vehicle-detail"]',
    HEADER: 'h1',
    IMAGE_GALLERY: '[data-testid="image-gallery"]',
    PRICE: '[data-testid="price"]',
    MILEAGE: '[data-testid="mileage"]',
    VIN: '[data-testid="vin"]',
    LOCATION: '[data-testid="location"]',
    HISTORY_SECTION: '[data-testid="history"]',
    REVIEW_SECTION: '[data-testid="review-section"]',
    BACK_BUTTON: 'a[href="/dashboard"]',
  },

  // Filter bar
  FILTER_BAR: {
    SEARCH_INPUT: 'input[type="search"], input[placeholder*="Search"]',
    MAKE_SELECT: 'select[name="make"]',
    MODEL_SELECT: 'select[name="model"]',
    PRICE_MIN: 'input[name="priceMin"]',
    PRICE_MAX: 'input[name="priceMax"]',
    SORT_BY: 'select[name="sortBy"]',
    CLEAR_FILTERS: 'button:has-text("Clear")',
  },

  // Common
  COMMON: {
    BUTTON: 'button',
    LINK: 'a',
    INPUT: 'input',
    SELECT: 'select',
    LOADING: '[data-loading="true"]',
  },
};

/**
 * Default wait options
 */
const DEFAULT_WAIT_OPTIONS: WaitOptions = {
  timeout: 30000,
  waitUntil: 'networkidle2',
};

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  retries: 3,
  delay: 1000,
  timeout: 30000,
};

/**
 * Wait for dashboard to fully load
 *
 * @param page - Puppeteer page instance
 * @param options - Wait options
 * @returns Dashboard load state
 *
 * @example
 * ```typescript
 * const state = await waitForDashboardLoad(page);
 * console.log(`Loaded ${state.vehicleCount} vehicles`);
 * ```
 */
export async function waitForDashboardLoad(
  page: Page,
  options: WaitOptions = {}
): Promise<DashboardLoadState> {
  const opts = { ...DEFAULT_WAIT_OPTIONS, ...options };

  try {
    // Wait for the page header
    await page.waitForSelector(SELECTORS.DASHBOARD.HEADER, {
      timeout: opts.timeout,
    });

    // Wait for either vehicle list or empty state
    await Promise.race([
      page.waitForSelector(SELECTORS.VEHICLE_CARD.CONTAINER, {
        timeout: opts.timeout,
      }),
      page.waitForSelector(SELECTORS.DASHBOARD.EMPTY_STATE, {
        timeout: opts.timeout,
      }),
    ]).catch(() => {
      // Ignore timeout - we'll check the state below
    });

    // Check if loading spinner is gone
    await page.waitForFunction(
      (selector) => !document.querySelector(selector),
      { timeout: opts.timeout },
      SELECTORS.DASHBOARD.LOADING_SPINNER
    ).catch(() => {
      // Ignore if spinner selector doesn't exist
    });

    // Get vehicle count
    const vehicleCards = await page.$$(SELECTORS.VEHICLE_CARD.CONTAINER);
    const vehicleCount = vehicleCards.length;

    // Check if filters are present
    const hasFilters = (await page.$(SELECTORS.FILTER_BAR.SEARCH_INPUT)) !== null;

    return {
      loaded: true,
      vehicleCount,
      hasFilters,
      hasVehicles: vehicleCount > 0,
    };
  } catch (error) {
    return {
      loaded: false,
      vehicleCount: 0,
      hasFilters: false,
      hasVehicles: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Wait for vehicle detail page to load
 *
 * @param page - Puppeteer page instance
 * @param options - Wait options
 * @returns Vehicle detail state
 *
 * @example
 * ```typescript
 * const state = await waitForVehicleDetail(page);
 * console.log(`VIN: ${state.vin}`);
 * ```
 */
export async function waitForVehicleDetail(
  page: Page,
  options: WaitOptions = {}
): Promise<VehicleDetailState> {
  const opts = { ...DEFAULT_WAIT_OPTIONS, ...options };

  try {
    // Wait for the header
    await page.waitForSelector('h1', { timeout: opts.timeout });

    // Extract VIN from URL
    const url = page.url();
    const vinMatch = url.match(/\/dashboard\/([A-Z0-9]{17})/);
    const vin = vinMatch ? vinMatch[1] : undefined;

    // Check for images
    const images = await page.$$('img[alt*="Toyota"], img[alt*="Lexus"], img[src*="vehicle"]');
    const hasImages = images.length > 0;

    // Check for detail sections (looking for common elements)
    const hasDetails = (await page.$('[class*="price"], [class*="mileage"]')) !== null;

    // Check for history section
    const hasHistory = (await page.$('h2:has-text("History"), h3:has-text("History")')) !== null;

    return {
      loaded: true,
      vin,
      hasImages,
      hasDetails,
      hasHistory,
    };
  } catch (error) {
    return {
      loaded: false,
      hasImages: false,
      hasDetails: false,
      hasHistory: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get all vehicle cards on the page
 *
 * @param page - Puppeteer page instance
 * @returns Array of vehicle card data
 *
 * @example
 * ```typescript
 * const cards = await getVehicleCards(page);
 * console.log(`Found ${cards.length} vehicles`);
 * ```
 */
export async function getVehicleCards(page: Page): Promise<VehicleCardData[]> {
  const cardElements = await page.$$(SELECTORS.VEHICLE_CARD.CONTAINER);
  const cards: VehicleCardData[] = [];

  for (let i = 0; i < cardElements.length; i++) {
    const element = cardElements[i];

    // Try to extract VIN from the View Details link
    let vin: string | undefined;
    try {
      const link = await element.$(SELECTORS.VEHICLE_CARD.VIEW_DETAILS_BUTTON);
      if (link) {
        const href = await link.evaluate((el) => el.getAttribute('href'));
        const vinMatch = href?.match(/\/dashboard\/([A-Z0-9]{17})/);
        vin = vinMatch ? vinMatch[1] : undefined;
      }
    } catch (e) {
      // Ignore errors
    }

    // Try to extract make, model, year from title
    let make: string | undefined;
    let model: string | undefined;
    let year: string | undefined;
    try {
      const title = await element.$(SELECTORS.VEHICLE_CARD.TITLE);
      if (title) {
        const titleText = await title.evaluate((el) => el.textContent || '');
        const parts = titleText.trim().split(' ');
        if (parts.length >= 3) {
          year = parts[0];
          make = parts[1];
          model = parts.slice(2).join(' ');
        }
      }
    } catch (e) {
      // Ignore errors
    }

    // Try to extract price
    let price: string | undefined;
    try {
      const priceElement = await element.$(SELECTORS.VEHICLE_CARD.PRICE);
      if (priceElement) {
        price = await priceElement.evaluate((el) => el.textContent || '');
      }
    } catch (e) {
      // Ignore errors
    }

    cards.push({
      element,
      index: i,
      vin,
      make,
      model,
      year,
      price,
    });
  }

  return cards;
}

/**
 * Click a specific vehicle card
 *
 * @param page - Puppeteer page instance
 * @param index - Zero-based index of the card to click
 * @returns Promise that resolves when navigation completes
 *
 * @example
 * ```typescript
 * await clickVehicleCard(page, 0); // Click first card
 * await waitForVehicleDetail(page);
 * ```
 */
export async function clickVehicleCard(page: Page, index: number): Promise<void> {
  const cards = await getVehicleCards(page);

  if (index < 0 || index >= cards.length) {
    throw new Error(`Invalid card index: ${index}. Found ${cards.length} cards.`);
  }

  const card = cards[index];
  const button = await card.element.$(SELECTORS.VEHICLE_CARD.VIEW_DETAILS_BUTTON);

  if (!button) {
    throw new Error(`View Details button not found on card ${index}`);
  }

  // Click and wait for navigation
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    button.click(),
  ]);
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Function to retry
 * @param options - Retry options
 * @returns Result of the function
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   async () => {
 *     const element = await page.$('.dynamic-content');
 *     if (!element) throw new Error('Not found');
 *     return element;
 *   },
 *   { retries: 5, delay: 500 }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= (opts.retries || 0); attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < (opts.retries || 0)) {
        // Call onRetry callback if provided
        if (opts.onRetry) {
          opts.onRetry(attempt + 1, lastError);
        }

        // Wait before retrying (exponential backoff)
        const delay = (opts.delay || 1000) * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed with unknown error');
}

/**
 * Wait for element to be visible and stable
 *
 * @param page - Puppeteer page instance
 * @param selector - CSS selector
 * @param timeout - Timeout in milliseconds
 * @returns Element handle
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 30000
): Promise<ElementHandle | null> {
  await page.waitForSelector(selector, { visible: true, timeout });
  return page.$(selector);
}

/**
 * Wait for multiple elements to be visible
 *
 * @param page - Puppeteer page instance
 * @param selectors - Array of CSS selectors
 * @param timeout - Timeout in milliseconds
 */
export async function waitForElements(
  page: Page,
  selectors: string[],
  timeout = 30000
): Promise<void> {
  await Promise.all(
    selectors.map((selector) =>
      page.waitForSelector(selector, { visible: true, timeout })
    )
  );
}

/**
 * Check if element exists on page
 *
 * @param page - Puppeteer page instance
 * @param selector - CSS selector
 * @returns True if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const element = await page.$(selector);
  return element !== null;
}

/**
 * Get text content of an element
 *
 * @param page - Puppeteer page instance
 * @param selector - CSS selector
 * @returns Text content or null
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string | null> {
  const element = await page.$(selector);
  if (!element) return null;

  return element.evaluate((el) => el.textContent?.trim() || null);
}

/**
 * Get attribute value of an element
 *
 * @param page - Puppeteer page instance
 * @param selector - CSS selector
 * @param attribute - Attribute name
 * @returns Attribute value or null
 */
export async function getAttribute(
  page: Page,
  selector: string,
  attribute: string
): Promise<string | null> {
  const element = await page.$(selector);
  if (!element) return null;

  return element.evaluate((el, attr) => el.getAttribute(attr), attribute);
}

/**
 * Type text with realistic delay
 *
 * @param page - Puppeteer page instance
 * @param selector - CSS selector
 * @param text - Text to type
 * @param delay - Delay between keystrokes in ms
 */
export async function typeText(
  page: Page,
  selector: string,
  text: string,
  delay = 50
): Promise<void> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  await element.click();
  await page.keyboard.type(text, { delay });
}

/**
 * Clear input field and type new text
 *
 * @param page - Puppeteer page instance
 * @param selector - CSS selector
 * @param text - Text to type
 */
export async function clearAndType(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  await element.click({ clickCount: 3 }); // Select all
  await page.keyboard.press('Backspace');
  await page.keyboard.type(text);
}

/**
 * Wait for network to be idle
 *
 * @param page - Puppeteer page instance
 * @param timeout - Timeout in milliseconds
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout = 30000
): Promise<void> {
  await page.waitForNetworkIdle({ timeout });
}

/**
 * Scroll to element
 *
 * @param page - Puppeteer page instance
 * @param selector - CSS selector
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  await element.evaluate((el) => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Wait for scroll to complete
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Get viewport size
 *
 * @param page - Puppeteer page instance
 * @returns Viewport dimensions
 */
export function getViewport(page: Page): { width: number; height: number } {
  const viewport = page.viewport();
  return {
    width: viewport?.width || 1920,
    height: viewport?.height || 1080,
  };
}

/**
 * Set viewport size
 *
 * @param page - Puppeteer page instance
 * @param width - Viewport width
 * @param height - Viewport height
 */
export async function setViewport(
  page: Page,
  width: number,
  height: number
): Promise<void> {
  await page.setViewport({ width, height });
}
