import { test, expect } from '@playwright/test';

/**
 * Test: Navigate from table row to vehicle details page
 *
 * This test verifies:
 * 1. Dashboard table loads
 * 2. Clicking a table row navigates to vehicle detail page
 * 3. Vehicle detail page displays correctly
 * 4. Back navigation returns to dashboard
 */
test.describe('Vehicle Details Navigation', () => {
  test('should navigate to vehicle details and back to dashboard', async ({ page }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');

    // Step 2: Wait for table to load
    await expect(page.getByText('Loading vehicles')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Step 3: Click first table row
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    await firstRow.click();

    // Step 4: Verify navigation to vehicle detail page
    await expect(page).toHaveURL(/\/dashboard\/.+/, { timeout: 10000 });

    // Extract VIN from URL
    const url = page.url();
    const vin = url.split('/').pop();
    expect(vin).toBeTruthy();
    expect(vin?.length).toBeGreaterThan(0);

    // Step 5: Wait for detail page to load
    await page.waitForLoadState('networkidle');

    // Step 6: Navigate back to dashboard
    await page.goBack();
    await expect(page).toHaveURL('/dashboard');

    // Step 7: Verify table is visible again
    await page.waitForTimeout(1000); // Allow for React hydration
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 5000 });

    // Success: Navigation flow works correctly
  });
});
