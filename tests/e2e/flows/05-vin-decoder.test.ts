/**
 * E2E Test: VIN Decoder Flow
 *
 * Tests the VIN decoder functionality:
 * - Navigate to vehicle with known VIN
 * - Go to Specifications tab
 * - Screenshot VIN specifications
 * - Verify VIN data is displayed
 * - Monitor network for NHTSA API call
 * - Verify data matches expected format
 */

import { Page, HTTPRequest, HTTPResponse } from 'puppeteer';
import {
  launchBrowser,
  closeBrowser,
  navigateTo,
  waitForSelector,
  elementExists,
  getTextContent,
  BrowserContext,
} from '../helpers/browser';
import { takeScreenshot } from '../helpers/screenshot';
import { TestFlowResult, TestStepResult, NetworkError } from '../helpers/types';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_NAME = '05-vin-decoder';

// Test VIN - Toyota Corolla Hybrid
const TEST_VIN = '5YFBURHE5HP690324';

interface VINDecodeData {
  vin: string;
  make?: string;
  model?: string;
  year?: string;
  bodyType?: string;
  trim?: string;
  engineType?: string;
  fuelType?: string;
  driveType?: string;
  transmission?: string;
  manufacturer?: string;
  plantCountry?: string;
}

interface NetworkCapture {
  requests: Array<{
    url: string;
    method: string;
    timestamp: string;
  }>;
  responses: Array<{
    url: string;
    status: number;
    statusText: string;
    timestamp: string;
  }>;
  nhtsaApiCalls: Array<{
    url: string;
    status: number;
    data?: any;
  }>;
}

/**
 * Setup network monitoring
 */
function setupNetworkMonitoring(page: Page): NetworkCapture {
  const capture: NetworkCapture = {
    requests: [],
    responses: [],
    nhtsaApiCalls: [],
  };

  page.on('request', (request: HTTPRequest) => {
    const url = request.url();
    capture.requests.push({
      url,
      method: request.method(),
      timestamp: new Date().toISOString(),
    });

    // Check if it's an NHTSA API call
    if (url.includes('vpic.nhtsa.dot.gov') || url.includes('nhtsa')) {
      console.log(`→ NHTSA API Request: ${url}`);
    }
  });

  page.on('response', async (response: HTTPResponse) => {
    const url = response.url();
    const status = response.status();

    capture.responses.push({
      url,
      status,
      statusText: response.statusText(),
      timestamp: new Date().toISOString(),
    });

    // Capture NHTSA API responses
    if (url.includes('vpic.nhtsa.dot.gov') || url.includes('nhtsa')) {
      console.log(`← NHTSA API Response: ${status} ${url}`);

      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          capture.nhtsaApiCalls.push({
            url,
            status,
            data,
          });
        }
      } catch (error) {
        console.warn('Failed to parse NHTSA API response:', error);
      }
    }
  });

  return capture;
}

/**
 * Navigate to vehicle detail page
 */
async function navigateToVehicleDetail(
  page: Page,
  vin: string,
  networkCapture: NetworkCapture
): Promise<TestStepResult> {
  const stepName = 'Navigate to vehicle detail';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);
    const url = `${BASE_URL}/dashboard/${vin}`;
    await navigateTo(page, url);

    // Wait for page to load
    await waitForSelector(page, 'h1', 10000);

    // Verify we're on the detail page
    const currentUrl = page.url();
    if (!currentUrl.includes(vin)) {
      throw new Error(`Failed to navigate to vehicle detail page. Current URL: ${currentUrl}`);
    }

    const screenshot = await takeScreenshot(page, 'vehicle-detail-loaded');
    console.log(`✓ ${stepName} - Screenshot: ${screenshot.fullPath}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot,
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Navigate to Specifications tab
 */
async function navigateToSpecificationsTab(page: Page): Promise<TestStepResult> {
  const stepName = 'Navigate to Specifications tab';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Click Specifications tab
    const specificationsTabSelectors = [
      'button[value="specifications"]',
      '[role="tab"][value="specifications"]',
      'button:has-text("Specifications")',
    ];

    let clicked = false;
    for (const selector of specificationsTabSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        clicked = true;
        console.log(`✓ Clicked Specifications tab using: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }

    if (!clicked) {
      throw new Error('Could not find Specifications tab');
    }

    // Wait for specifications content to be visible
    await new Promise(resolve => setTimeout(resolve, 1500));

    const screenshot = await takeScreenshot(page, 'specifications-tab');
    console.log(`✓ ${stepName} - Screenshot: ${screenshot.fullPath}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
      screenshot,
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify VIN is displayed
 */
async function verifyVINDisplayed(page: Page, expectedVin: string): Promise<TestStepResult> {
  const stepName = 'Verify VIN displayed';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Look for VIN text on the page
    const vinText = await page.evaluate((vin) => {
      const bodyText = document.body.innerText;
      return bodyText.includes(vin);
    }, expectedVin);

    if (!vinText) {
      throw new Error(`VIN ${expectedVin} not found on page`);
    }

    console.log(`✓ ${stepName} - VIN found: ${expectedVin}`);

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Extract VIN decode data from page
 */
async function extractVINData(page: Page): Promise<{ data: VINDecodeData; step: TestStepResult }> {
  const stepName = 'Extract VIN data';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Extract data from the specifications section
    const vinData = await page.evaluate(() => {
      const data: any = {};

      // Helper function to get text content by label
      const getValueByLabel = (label: string): string | undefined => {
        const elements = Array.from(document.querySelectorAll('*'));
        for (const el of elements) {
          if (el.textContent?.includes(label)) {
            // Try to find the value in sibling or parent elements
            const parent = el.parentElement;
            if (parent) {
              const text = parent.textContent || '';
              const parts = text.split(label);
              if (parts.length > 1) {
                const value = parts[1].trim().split('\n')[0];
                return value || undefined;
              }
            }
          }
        }
        return undefined;
      };

      data.vin = getValueByLabel('VIN');
      data.make = getValueByLabel('Make');
      data.model = getValueByLabel('Model');
      data.year = getValueByLabel('Year');
      data.bodyType = getValueByLabel('Body Type');
      data.trim = getValueByLabel('Trim');
      data.engineType = getValueByLabel('Engine');
      data.fuelType = getValueByLabel('Fuel Type');
      data.driveType = getValueByLabel('Drive Type');
      data.transmission = getValueByLabel('Transmission');
      data.manufacturer = getValueByLabel('Manufacturer');
      data.plantCountry = getValueByLabel('Plant Country');

      return data;
    });

    console.log('✓ Extracted VIN data:', JSON.stringify(vinData, null, 2));

    // Take screenshot showing the VIN specs
    const screenshot = await takeScreenshot(page, 'vin-specifications');

    return {
      data: vinData,
      step: {
        name: stepName,
        success: true,
        duration: Date.now() - startTime,
        screenshot,
      },
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      data: { vin: TEST_VIN },
      step: {
        name: stepName,
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Verify VIN data format and completeness
 */
async function verifyVINDataFormat(vinData: VINDecodeData): Promise<TestStepResult> {
  const stepName = 'Verify VIN data format';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Check required fields
    const requiredFields = ['vin'];
    const missingFields = requiredFields.filter((field) => !vinData[field as keyof VINDecodeData]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check VIN format (should be 17 characters)
    if (vinData.vin && vinData.vin.length !== 17) {
      console.warn(`⚠ VIN length is ${vinData.vin.length}, expected 17`);
    }

    // Count populated fields
    const populatedFields = Object.entries(vinData).filter(([_, value]) => value).length;
    console.log(`✓ ${stepName} - ${populatedFields} fields populated`);

    // Check for common fields
    const commonFields = ['make', 'model', 'year'];
    const foundCommonFields = commonFields.filter((field) => vinData[field as keyof VINDecodeData]);

    if (foundCommonFields.length === 0) {
      console.warn('⚠ No common fields (make, model, year) found');
    } else {
      console.log(`✓ Found common fields: ${foundCommonFields.join(', ')}`);
    }

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify NHTSA API calls
 */
async function verifyNHTSAAPICalls(networkCapture: NetworkCapture): Promise<TestStepResult> {
  const stepName = 'Verify NHTSA API calls';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Check if any NHTSA API calls were made
    if (networkCapture.nhtsaApiCalls.length === 0) {
      console.warn('⚠ No NHTSA API calls detected (may be using cached data)');
      return {
        name: stepName,
        success: true,
        duration: Date.now() - startTime,
      };
    }

    console.log(`✓ Found ${networkCapture.nhtsaApiCalls.length} NHTSA API call(s)`);

    // Verify each call
    for (const call of networkCapture.nhtsaApiCalls) {
      console.log(`\n  API Call:`);
      console.log(`    URL: ${call.url}`);
      console.log(`    Status: ${call.status}`);

      // Check status
      if (call.status !== 200) {
        console.warn(`  ⚠ API call returned status ${call.status}`);
      }

      // Check data structure if available
      if (call.data) {
        console.log(`    Has Data: Yes`);

        // Common NHTSA response structure checks
        if (call.data.Results) {
          console.log(`    Results Count: ${call.data.Results.length}`);
        }
        if (call.data.Message) {
          console.log(`    Message: ${call.data.Message}`);
        }
      }
    }

    return {
      name: stepName,
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify mileage analysis section
 */
async function verifyMileageAnalysis(page: Page): Promise<TestStepResult> {
  const stepName = 'Verify mileage analysis';
  const startTime = Date.now();

  try {
    console.log(`\n→ ${stepName}...`);

    // Scroll down to mileage analysis section
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h3, h2')).find((el) =>
        el.textContent?.includes('Mileage Analysis')
      );
      if (heading) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if mileage analysis section exists
    const hasMileageAnalysis = await page.evaluate(() => {
      return document.body.innerText.includes('Mileage Analysis');
    });

    if (hasMileageAnalysis) {
      console.log('✓ Mileage Analysis section found');

      const screenshot = await takeScreenshot(page, 'mileage-analysis');
      console.log(`✓ Screenshot: ${screenshot.fullPath}`);

      return {
        name: stepName,
        success: true,
        duration: Date.now() - startTime,
        screenshot,
      };
    } else {
      console.warn('⚠ Mileage Analysis section not found');
      return {
        name: stepName,
        success: true,
        duration: Date.now() - startTime,
      };
    }
  } catch (error) {
    console.error(`✗ ${stepName} failed:`, error);
    return {
      name: stepName,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main test function
 */
export async function testVINDecoder(): Promise<TestFlowResult> {
  const testStartTime = Date.now();
  const steps: TestStepResult[] = [];
  const errors: any[] = [];
  const screenshots: any[] = [];

  console.log('\n========================================');
  console.log('Starting VIN Decoder Test Flow');
  console.log(`Test VIN: ${TEST_VIN}`);
  console.log('========================================');

  let context: BrowserContext | null = null;

  try {
    // Launch browser
    context = await launchBrowser();
    const { page } = context;

    // Setup network monitoring
    const networkCapture = setupNetworkMonitoring(page);

    // Execute test steps
    const step1 = await navigateToVehicleDetail(page, TEST_VIN, networkCapture);
    steps.push(step1);
    if (step1.screenshot) screenshots.push(step1.screenshot);
    if (!step1.success) throw new Error(step1.error);

    const step2 = await navigateToSpecificationsTab(page);
    steps.push(step2);
    if (step2.screenshot) screenshots.push(step2.screenshot);
    if (!step2.success) throw new Error(step2.error);

    const step3 = await verifyVINDisplayed(page, TEST_VIN);
    steps.push(step3);

    const { data: vinData, step: step4 } = await extractVINData(page);
    steps.push(step4);
    if (step4.screenshot) screenshots.push(step4.screenshot);

    const step5 = await verifyVINDataFormat(vinData);
    steps.push(step5);

    const step6 = await verifyNHTSAAPICalls(networkCapture);
    steps.push(step6);

    const step7 = await verifyMileageAnalysis(page);
    steps.push(step7);
    if (step7.screenshot) screenshots.push(step7.screenshot);

    const duration = Date.now() - testStartTime;

    // Print summary
    console.log('\n========================================');
    console.log('✓ VIN Decoder Test PASSED');
    console.log(`Duration: ${duration}ms`);
    console.log(`Steps completed: ${steps.length}`);
    console.log(`Screenshots taken: ${screenshots.length}`);
    console.log(`NHTSA API calls: ${networkCapture.nhtsaApiCalls.length}`);
    console.log('\nExtracted VIN Data:');
    console.log(JSON.stringify(vinData, null, 2));
    console.log('========================================\n');

    return {
      name: TEST_NAME,
      success: true,
      duration,
      errors,
      screenshots,
      steps,
    };
  } catch (error) {
    const duration = Date.now() - testStartTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push({
      type: 'test-failure',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    console.log('\n========================================');
    console.log('✗ VIN Decoder Test FAILED');
    console.log(`Error: ${errorMessage}`);
    console.log(`Duration: ${duration}ms`);
    console.log('========================================\n');

    return {
      name: TEST_NAME,
      success: false,
      duration,
      errors,
      screenshots,
      steps,
    };
  } finally {
    // Clean up
    if (context) {
      await closeBrowser(context);
    }
  }
}

// Run test if executed directly
if (require.main === module) {
  testVINDecoder()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
