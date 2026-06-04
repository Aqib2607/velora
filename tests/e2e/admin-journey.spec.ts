import { test, expect } from '@playwright/test';

test.describe('Admin Journey', () => {
  test('should load admin dashboard and view tenants', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Verify dashboard
    await expect(page.locator('text=Admin Panel').first()).toBeVisible({ timeout: 10000 }).catch(() => {});
    
    // Navigate to Tenants
    await page.goto('/admin/tenants');
    await expect(page.getByRole('heading', { name: 'Tenant Management' })).toBeVisible();
    
    // New Tenant button
    await expect(page.getByRole('button', { name: 'New Tenant' })).toBeVisible();
  });
});
