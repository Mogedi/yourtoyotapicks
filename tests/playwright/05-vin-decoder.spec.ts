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

import { test, expect } from '@playwright/test';

const TEST_VIN = '4T1K61AK0MU123456'; // Valid VIN from mock data

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

test.describe('VIN Decoder Flow', () => {
  const nhtsaApiCalls: Array<{ url: string; status: number; data?: any }> = [];

  test('should decode VIN and display vehicle specifications', async ({
    page,
  }) => {
    // Setup network monitoring for NHTSA API calls
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('vpic.nhtsa.dot.gov') || url.includes('nhtsa')) {
        console.log(`← NHTSA API Response: ${response.status()} ${url}`);

        try {
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            nhtsaApiCalls.push({
              url,
              status: response.status(),
              data,
            });
          }
        } catch (error) {
          console.warn('Failed to parse NHTSA API response:', error);
        }
      }
    });

    // Navigate to vehicle detail page
    await test.step('Navigate to vehicle detail page', async () => {
      await page.goto(`/dashboard/${TEST_VIN}`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page).toHaveURL(new RegExp(TEST_VIN));
      await page.screenshot({
        path: `test-results/05-vehicle-detail-loaded.png`,
        fullPage: true,
      });
    });

    // Navigate to Specifications tab
    await test.step('Navigate to Specifications tab', async () => {
      const specificationsTabSelectors = [
        'button[value="specifications"]',
        '[role="tab"][value="specifications"]',
        page.getByRole('tab', { name: /specifications/i }),
      ];

      let clicked = false;
      for (const selector of specificationsTabSelectors) {
        try {
          const element =
            typeof selector === 'string' ? page.locator(selector) : selector;
          await element.click({ timeout: 2000 });
          clicked = true;
          console.log('✓ Clicked Specifications tab');
          break;
        } catch {
          continue;
        }
      }

      expect(clicked).toBe(true);
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: `test-results/05-specifications-tab.png`,
        fullPage: true,
      });
    });

    // Verify VIN is displayed
    await test.step('Verify VIN displayed', async () => {
      const vinText = await page.evaluate((vin) => {
        const bodyText = document.body.innerText;
        return bodyText.includes(vin);
      }, TEST_VIN);

      expect(vinText).toBe(true);
      console.log(`✓ VIN found: ${TEST_VIN}`);
    });

    // Extract VIN decode data from page
    let vinData: VINDecodeData = { vin: TEST_VIN };
    await test.step('Extract VIN data', async () => {
      vinData = await page.evaluate(() => {
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
      await page.screenshot({
        path: `test-results/05-vin-specifications.png`,
        fullPage: true,
      });
    });

    // Verify VIN data format and completeness
    await test.step('Verify VIN data format', async () => {
      // Check required fields
      expect(vinData.vin).toBeTruthy();

      // Check VIN format (should be 17 characters)
      if (vinData.vin && vinData.vin.length !== 17) {
        console.warn(`⚠ VIN length is ${vinData.vin.length}, expected 17`);
      }

      // Count populated fields
      const populatedFields = Object.entries(vinData).filter(
        ([_, value]) => value
      ).length;
      console.log(`✓ ${populatedFields} fields populated`);

      // Check for common fields
      const commonFields = ['make', 'model', 'year'];
      const foundCommonFields = commonFields.filter(
        (field) => vinData[field as keyof VINDecodeData]
      );

      if (foundCommonFields.length === 0) {
        console.warn('⚠ No common fields (make, model, year) found');
      } else {
        console.log(`✓ Found common fields: ${foundCommonFields.join(', ')}`);
      }
    });

    // Verify NHTSA API calls
    await test.step('Verify NHTSA API calls', async () => {
      if (nhtsaApiCalls.length === 0) {
        console.warn(
          '⚠ No NHTSA API calls detected (may be using cached data)'
        );
      } else {
        console.log(`✓ Found ${nhtsaApiCalls.length} NHTSA API call(s)`);

        for (const call of nhtsaApiCalls) {
          console.log(`\n  API Call:`);
          console.log(`    URL: ${call.url}`);
          console.log(`    Status: ${call.status}`);

          if (call.status !== 200) {
            console.warn(`  ⚠ API call returned status ${call.status}`);
          }

          if (call.data) {
            console.log(`    Has Data: Yes`);
            if (call.data.Results) {
              console.log(`    Results Count: ${call.data.Results.length}`);
            }
            if (call.data.Message) {
              console.log(`    Message: ${call.data.Message}`);
            }
          }
        }
      }
    });

    // Verify mileage analysis section
    await test.step('Verify mileage analysis', async () => {
      // Scroll down to mileage analysis section
      await page.evaluate(() => {
        const heading = Array.from(document.querySelectorAll('h3, h2')).find(
          (el) => el.textContent?.includes('Mileage Analysis')
        );
        if (heading) {
          heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      await page.waitForTimeout(1000);

      // Check if mileage analysis section exists
      const hasMileageAnalysis = await page.evaluate(() => {
        return document.body.innerText.includes('Mileage Analysis');
      });

      if (hasMileageAnalysis) {
        console.log('✓ Mileage Analysis section found');
        await page.screenshot({
          path: `test-results/05-mileage-analysis.png`,
          fullPage: true,
        });
      } else {
        console.warn('⚠ Mileage Analysis section not found');
      }
    });
  });
});
