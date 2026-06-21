import { test, expect } from '@playwright/test';

test.describe('Materials Hub Catalog and Cart Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Materials Catalog
    await page.goto('/#/materials');
  });

  test('Browse and Category Filtering', async ({ page }) => {
    // Check main title
    await expect(page.locator('text=Construction Materials For Every Project')).toBeVisible();

    // Verify category tabs exist
    await expect(page.locator('button:has-text("Cement")')).toBeVisible();
    await expect(page.locator('button:has-text("Steel")')).toBeVisible();

    // Click on paints tab
    await page.click('button:has-text("Paints")');

    // Verify only paint products are shown (e.g. Apex Ultima or Super Latex)
    await expect(page.locator('h4:has-text("Asian Paints Apex Ultima")')).toBeVisible();
    await expect(page.locator('h4:has-text("Tata Tiscon SD TMT")')).not.toBeVisible();
  });

  test('Catalog Search Functionality', async ({ page }) => {
    // Search for cement
    const searchInput = page.locator('input[placeholder*="Search cement, steel"]');
    await searchInput.fill('UltraTech');
    
    // Verify results
    await expect(page.locator('h4:has-text("UltraTech Cement")')).toBeVisible();
    await expect(page.locator('h4:has-text("Asian Paints Apex Ultima")')).not.toBeVisible();
  });

  test('Product Detail Page and Cart Operations', async ({ page }) => {
    // Search and click on ACC Cement
    const searchInput = page.locator('input[placeholder*="Search cement, steel"]');
    await searchInput.fill('ACC Cement');
    await page.click('h4:has-text("ACC Cement")');

    // Verify PDP loads
    await expect(page).toHaveURL(/.*#\/products\/acc-cement/);
    await expect(page.locator('text=ACC Gold OPC 43 Grade Cement')).toBeVisible();

    // Add to cart from PDP
    await page.click('#standardActions button:has-text("Add to Cart")');

    // Open Cart Drawer (click cart icon in navbar)
    // Wait, the cart drawer might open automatically or we click the cart icon in navbar
    const cartButton = page.locator('button:has-text("shopping_cart"), button .material-symbols-outlined:text("shopping_cart")').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }
    
    // Verify item is in cart drawer
    await expect(page.locator('text=ACC Cement').first()).toBeVisible();
    await expect(page.locator('text=Subtotal')).toBeVisible();
  });
});

