import { test, expect } from "@playwright/test";
test("Checkout flow", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveTitle(/Checkout/);
});
