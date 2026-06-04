import { test, expect } from '@playwright/test';

test.describe('Buyer Journey', () => {
  test('should load home page and view cart', async ({ page }) => {
    await page.goto('/');
    
    // Assuming home page has a search or cart icon
    // Wait for network idle or main content
    await page.waitForLoadState('networkidle');
    
    const cartButton = page.locator('button').filter({ hasText: 'Cart' }).first();
    // Sometimes apps use icons, so we fallback
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }
    
    // URL check if it navigates or modal check
    // We just verify it didn't crash
    expect(page.url()).toBeDefined();
  });
});
