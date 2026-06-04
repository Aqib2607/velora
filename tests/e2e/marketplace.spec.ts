import { test, expect } from '@playwright/test';

test('marketplace homepage loads and displays products', async ({ page }) => {
  await page.goto('/');

  // Expect title to contain Velora
  await expect(page).toHaveTitle(/Velora/);

  // Expect navbar to be visible
  await expect(page.locator('nav')).toBeVisible();

  // Expect featured products section to load
  await expect(page.locator('text=Featured Products').first()).toBeVisible();
});

test('user can search for products', async ({ page }) => {
  await page.goto('/');

  // Fill in search
  const searchInput = page.locator('input[type="search"]');
  await expect(searchInput).toBeVisible();
  
  await searchInput.fill('laptop');
  await searchInput.press('Enter');

  // Verify navigation to search results
  await expect(page).toHaveURL(/search/);
});
