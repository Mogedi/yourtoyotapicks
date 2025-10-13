// Export all helper functions and types
export * from './types';
export * from './screenshot';
export * from './logger';
export * from './error-detector';
export * from './config';

// Export from browser (some functions may overlap with test-utils)
export {
  launchBrowser,
  closeBrowser,
  navigateTo,
  waitForSelector,
  clickElement,
  getElementCount,
  typeIntoField,
  clearField,
  waitForNavigation,
  getCurrentUrl,
  collectConsoleErrors,
  type BrowserContext,
} from './browser';

// Export from test-utils (prefer these over browser.ts versions)
export {
  SELECTORS,
  waitForDashboardLoad,
  waitForVehicleDetail,
  getVehicleCards,
  clickVehicleCard,
  retry,
  waitForElement,
  waitForElements,
  elementExists,
  getTextContent,
  getAttribute,
  typeText,
  clearAndType,
  waitForNetworkIdle,
  scrollToElement,
  getViewport,
  setViewport,
} from './test-utils';
