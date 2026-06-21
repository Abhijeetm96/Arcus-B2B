import { test, expect } from '@playwright/test';

test.describe('Authentication and Registration Flow', () => {
  const timestamp = Date.now();
  const b2cEmail = `b2c_${timestamp}@example.com`;
  const b2bEmail = `b2b_${timestamp}@example.com`;
  const b2cPhone = '9' + String(timestamp).slice(-9);
  const b2bPhone = '8' + String(timestamp + 1).slice(-9);
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

  test('B2C Individual Registration and Verification', async ({ page }) => {
    await page.goto('/#/auth?tab=register');
    
    // Choose Individual (Retail) card
    await page.click('text=Retail');
    
    // Fill form
    await page.fill('input[placeholder="John Doe"]', 'B2C Tester');
    await page.fill('input[placeholder="name@gmail.com"]', b2cEmail);
    await page.fill('input[placeholder="9999988888"]', b2cPhone);
    await page.fill('input[placeholder="Min 6 characters"]', password);
    await page.fill('input[placeholder="Retype password"]', password);
    await page.fill('input[placeholder="Bangalore"]', 'Bengaluru');
    await page.fill('input[placeholder="Karnataka"]', 'Karnataka');
    await page.check('input[type="checkbox"]'); // Agree to Terms

    // Submit
    await page.click('button[type="submit"]:has-text("Create Account")');

    // Verification step
    await page.waitForSelector('text=Verify Your Email');
    await page.fill('input[placeholder="0 0 0 0 0 0"]', '123456');
    await page.click('button:has-text("Verify Email")');

    // Verify success screen and then navigate to dashboard
    await expect(page.locator('text=Welcome to ARCUS')).toBeVisible();
    await page.goto('/#/account');
    await expect(page).toHaveURL(/.*#\/account/);
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=B2C Tester').first()).toBeVisible();
  });

  test('B2B Business Registration, GST Verification, and Verification', async ({ page }) => {
    await page.goto('/#/auth?tab=register');
    
    // Choose Business card
    await page.click('text=Business (B2B)');
    
    // Fill GSTIN and verify
    await page.fill('input[placeholder*="29GGGGG1314R9Z6"]', '29CFJPR5489A1ZY');
    await page.click('button:has-text("Verify GST")');
    
    // Verify GST info auto-populates and is displayed
    await page.waitForSelector('text=GST Verified');

    // Fill contact details
    await page.fill('input[placeholder="Contact Name"]', 'B2B Partner');
    await page.fill('input[placeholder="name@company.com"]', b2bEmail);
    await page.fill('input[placeholder="9999988888"]', b2bPhone);
    await page.fill('input[placeholder="Min 6 characters"]', password);
    await page.fill('input[placeholder="Retype password"]', password);

    // Submit
    await page.click('button[type="submit"]:has-text("Create Business Account")');

    // Verification step
    await page.waitForSelector('text=Verify Your Email');
    await page.fill('input[placeholder="0 0 0 0 0 0"]', '123456');
    await page.click('button:has-text("Verify Email")');

    // Verify success screen and then navigate to business dashboard
    await expect(page.locator('text=Business Account Created')).toBeVisible();
    await page.goto('/#/business-dashboard');
    await expect(page).toHaveURL(/.*#\/business-dashboard/);
    await expect(page.locator('text=Business Dashboard')).toBeVisible();
  });

  test('Login with Invalid Credentials', async ({ page }) => {
    await page.goto('/#/auth?tab=login');
    await page.fill('input[placeholder="e.g. name@company.com"]', 'invalid@example.com');
    await page.fill('input[placeholder="Enter password"]', 'wrongpassword');
    await page.click('button[type="submit"]:has-text("Login")');

    // Verify error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('Login with B2C Registered Account', async ({ page }) => {
    await page.goto('/#/auth?tab=login');
    await page.fill('input[placeholder="e.g. name@company.com"]', b2cEmail);
    await page.fill('input[placeholder="Enter password"]', password);
    await page.click('button[type="submit"]:has-text("Login")');

    await page.goto('/#/account');
    await expect(page).toHaveURL(/.*#\/account/);
  });
});
