import { test, expect } from '@playwright/test';

/**
 * Test: Navigate from landing page to dashboard (table view)
 *
 * This test verifies:
 * 1. Landing page loads correctly
 * 2. Navigation to dashboard works
 * 3. Dashboard table loads with vehicle data
 */
test.describe('Landing to Dashboard Navigation', () => {
  test('should navigate from landing page to dashboard and display vehicles', async ({ page }) => {
    // Step 1: Navigate to landing page
    await page.goto('/');

    // Step 2: Verify landing page elements
    await expect(page.locator('h1')).toContainText('YourToyotaPicks');

    // Step 3: Click "View Dashboard" button
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    await expect(dashboardLink).toBeVisible();
    await dashboardLink.click();

    // Step 4: Wait for navigation and verify URL
    await expect(page).toHaveURL(/\/dashboard/);

    // Step 5: Wait for table to load (no loading state)
    await expect(page.getByText('Loading vehicles')).not.toBeVisible({ timeout: 15000 });

    // Step 6: Verify table is visible
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });

    // Step 7: Verify table rows exist
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(25, { timeout: 5000 });

    // Success: Dashboard loaded with 25 table rows
  });
});
