import { test, expect } from '@playwright/test';

test.describe('Procurement Checkout Page Workflow', () => {
  const timestamp = Date.now();
  const b2cEmail = `checkout_b2c_${timestamp}@example.com`;
  const b2bEmail = `checkout_b2b_${timestamp}@example.com`;
  const b2cPhone = '7' + String(timestamp).slice(-9);
  const b2bPhone = '6' + String(timestamp + 1).slice(-9);
  const password = 'Password123';

  test.beforeAll(async ({ request }) => {
    // Clear any existing test accounts using the same email or GSTIN to prevent unique constraint failures
    await request.post('http://localhost:5000/api/test/cleanup', {
      data: {
        email: b2cEmail,
        gstNumber: '29CFJPR5489A1ZY'
      }
    });
    await request.post('http://localhost:5000/api/test/cleanup', {
      data: {
        email: b2bEmail
      }
    });
  });

  test('B2B Checkout Flow - GSTIN, Saved Address, Billing Address Toggle, Coupon', async ({ page }) => {
    // 1. Register a B2B Business user
    await page.goto('/#/auth?tab=register');
    await page.click('text=Business (B2B)');
    await page.fill('input[placeholder*="29GGGGG1314R9Z6"]', '29CFJPR5489A1ZY');
    await page.click('button:has-text("Verify GST")');
    await page.waitForSelector('text=GST Verified');

    await page.fill('input[placeholder="Contact Name"]', 'B2B Checkout User');
    await page.fill('input[placeholder="name@company.com"]', b2bEmail);
    await page.fill('input[placeholder="9999988888"]', b2bPhone);
    await page.fill('input[placeholder="Min 6 characters"]', password);
    await page.fill('input[placeholder="Retype password"]', password);
    await page.click('button[type="submit"]:has-text("Create Business Account")');
    
    await page.waitForSelector('text=Verify Your Email');
    await page.fill('input[placeholder="0 0 0 0 0 0"]', '123456');
    await page.click('button:has-text("Verify Email")');
    
    // Verify success and navigate to business dashboard
    await expect(page.locator('text=Business Account Created')).toBeVisible();
    await page.goto('/#/business-dashboard');
    await expect(page).toHaveURL(/.*#\/business-dashboard/);

    // 2. Add an item to the cart
    await page.goto('/#/materials');
    await page.fill('input[placeholder*="Search cement, steel"]', 'Ambuja Cement');
    await page.click('h4:has-text("Ambuja Cement")');
    await page.click('#standardActions button:has-text("Add to Cart")');

    // 3. Navigate to Checkout page
    await page.goto('/#/checkout');
    await expect(page.locator('text=Procurement Checkout')).toBeVisible();

    // 4. Verify GSTIN input is disabled and filled with profile GSTIN
    const gstinInput = page.locator('input[name="gstNumber"]');
    await expect(gstinInput).toBeDisabled();
    await expect(gstinInput).toHaveValue('29CFJPR5489A1ZY');
    await expect(page.locator('text=Verified B2B GSTIN')).toBeVisible();

    // 5. Select Saved Address from Profile and verify autofill
    const shippingSelect = page.locator('select:has-text("Choose a saved address")');
    await shippingSelect.selectOption({ label: 'Default: Flat 402, Block A, Prestige Shantiniketan, Whitefield, Bengaluru - 560048' });

    // Verify fields auto-fill and split properly (suburb name preserved)
    await expect(page.locator('input[name="addressLine1"]')).toHaveValue('Flat 402, Block A, Prestige Shantiniketan, Whitefield');
    await expect(page.locator('input[name="city"]')).toHaveValue('Bengaluru');
    await expect(page.locator('input[name="state"]')).toHaveValue('Karnataka');
    await expect(page.locator('input[name="zipCode"]')).toHaveValue('560048');

    // 6. Test Billing Address Toggle (Uncheck "Billing address is same as shipping address")
    const billingCheckbox = page.locator('input[name="billingSameAsShipping"]');
    await expect(billingCheckbox).toBeChecked();
    
    // Uncheck it
    await billingCheckbox.uncheck();
    await expect(billingCheckbox).not.toBeChecked();

    // Verify Billing Address Details section appears
    await expect(page.locator('text=Billing Address Details')).toBeVisible();

    // Select Saved Address for Billing
    const billingSelect = page.locator('select:has-text("Choose a saved address to autofill")').last();
    await billingSelect.selectOption({ label: 'Address #2: Site B, 24th Main, HSR Layout, Sector 2, Bengaluru - 560102' });

    // Verify billing fields auto-fill and split properly
    await expect(page.locator('input[name="billingAddressLine1"]')).toHaveValue('Site B, 24th Main, HSR Layout, Sector 2');
    await expect(page.locator('input[name="billingCity"]')).toHaveValue('Bengaluru');
    await expect(page.locator('input[name="billingState"]')).toHaveValue('Karnataka');
    await expect(page.locator('input[name="billingZipCode"]')).toHaveValue('560102');

    // 7. Verify only B2B offers are shown, select ARCUS10 B2B Coupon
    await expect(page.locator('text=ARCUS10')).toBeVisible();
    await expect(page.locator('text=WELCOME5')).not.toBeVisible();

    // Apply ARCUS10
    await page.click('text=ARCUS10');
    await expect(page.locator('text=Coupon ARCUS10 applied successfully!')).toBeVisible();

    // Check discount appears in Summary
    await expect(page.locator('text=Coupon Discount')).toBeVisible();

    // 8. Test Modify quantity on checkout page
    const originalSummaryTotal = await page.locator('text=Total (Incl. Taxes)').locator('xpath=following-sibling::span').textContent();
    
    // Click add quantity
    await page.click('span.material-symbols-outlined:has-text("add")');
    
    // Wait for total to update
    await page.waitForTimeout(500);
    const updatedSummaryTotal = await page.locator('text=Total (Incl. Taxes)').locator('xpath=following-sibling::span').textContent();
    expect(originalSummaryTotal).not.toEqual(updatedSummaryTotal);

    // 9. Place Order
    await page.click('button[type="submit"]:has-text("Place Order")');

    // Verify Success Screen loads
    await expect(page).toHaveURL(/.*#\/checkout\/success/);
    await expect(page.locator('text=Order Placed Successfully!')).toBeVisible();
  });

  test('B2C Checkout Flow - GSTIN Muted, B2C Coupons', async ({ page }) => {
    // 1. Register a B2C Individual user
    await page.goto('/#/auth?tab=register');
    await page.click('text=Retail');
    await page.fill('input[placeholder="John Doe"]', 'B2C Checkout User');
    await page.fill('input[placeholder="name@gmail.com"]', b2cEmail);
    await page.fill('input[placeholder="9999988888"]', b2cPhone);
    await page.fill('input[placeholder="Min 6 characters"]', password);
    await page.fill('input[placeholder="Retype password"]', password);
    await page.fill('input[placeholder="Bangalore"]', 'Bengaluru');
    await page.fill('input[placeholder="Karnataka"]', 'Karnataka');
    await page.check('input[type="checkbox"]');
    await page.click('button[type="submit"]:has-text("Create Account")');
    
    await page.waitForSelector('text=Verify Your Email');
    await page.fill('input[placeholder="0 0 0 0 0 0"]', '123456');
    await page.click('button:has-text("Verify Email")');
    
    await expect(page.locator('text=Welcome to ARCUS')).toBeVisible();
    await page.goto('/#/account');
    await expect(page).toHaveURL(/.*#\/account/);

    // 2. Add an item to the cart
    await page.goto('/#/materials');
    await page.fill('input[placeholder*="Search cement, steel"]', 'ACC Cement');
    await page.click('h4:has-text("ACC Cement")');
    await page.click('#standardActions button:has-text("Add to Cart")');

    // 3. Go to checkout
    await page.goto('/#/checkout');

    // 4. Verify GSTIN block is visually muted and cannot be focused
    const gstinBlock = page.locator('div:has(label:text("GSTIN for B2B Invoice"))').last();
    await expect(gstinBlock).toHaveClass(/opacity-60/);
    await expect(gstinBlock).toHaveClass(/pointer-events-none/);

    // 5. Verify only B2C offers are shown
    await expect(page.locator('text=WELCOME5')).toBeVisible();
    await expect(page.locator('text=ARCUS10')).not.toBeVisible();

    // 6. Fill mandatory address fields manually and submit
    await page.fill('input[name="addressLine1"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Bengaluru');
    await page.fill('input[name="state"]', 'Karnataka');
    await page.fill('input[name="zipCode"]', '560001');

    // Apply WELCOME5 coupon
    await page.click('text=WELCOME5');
    await expect(page.locator('text=Coupon WELCOME5 applied successfully!')).toBeVisible();

    // Place Order
    await page.click('button[type="submit"]:has-text("Place Order")');

    // Verify Success Screen loads
    await expect(page).toHaveURL(/.*#\/checkout\/success/);
    await expect(page.locator('text=Order Placed Successfully!')).toBeVisible();
  });
});
