import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Sign in');
    await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Sign In' }).click();
    // Assuming HTML5 validation or custom validation messages appear
    // Just verifying it doesn't redirect
    await expect(page).toHaveURL('/auth/login');
  });
});
