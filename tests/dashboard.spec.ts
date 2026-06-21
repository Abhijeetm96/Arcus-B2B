import { test, expect } from '@playwright/test';

test.describe('User Account Dashboard and Profile Settings', () => {
  const password = 'Password123';
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    // Generate a unique email for each test to avoid "email already exists" errors
    testEmail = `dashboard_b2c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
    // Generate a unique phone number to avoid duplicate phone number errors
    const testPhone = '9' + String(Date.now() + Math.floor(Math.random() * 1000)).slice(-9);
    
    // Register and verify a B2C user to access settings
    await page.goto('/#/auth?tab=register');
    await page.click('text=Retail');
    await page.fill('input[placeholder="John Doe"]', 'Dashboard Tester');
    await page.fill('input[placeholder="name@gmail.com"]', testEmail);
    await page.fill('input[placeholder="9999988888"]', testPhone);
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
  });

  test('Manage Saved Delivery Addresses', async ({ page }) => {
    // Navigate to settings tab
    await page.click('button:has-text("Profile Settings")');

    // Setup dialog listener to fill the prompt
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Enter new delivery address:');
      await dialog.accept('Flat 99, 10th Cross, Koramangala, Bengaluru - 560034');
    });

    // Click Add New Address to trigger the prompt
    await page.click('button:has-text("Add New Address")');

    // Verify address is added and visible in the list
    const addressItem = page.locator('text=Flat 99, 10th Cross, Koramangala, Bengaluru - 560034');
    await expect(addressItem).toBeVisible();
  });

  test('Simulate Contact Phone and Email Changes via OTP', async ({ page }) => {
    await page.click('button:has-text("Profile Settings")');

    // 1. Test change email
    await page.click('button:has-text("Change Email")');
    const newEmailTs = Date.now();
    await page.fill('input[placeholder="enter new email"]', `newemail_${newEmailTs}@example.com`);
    await page.click('button:has-text("Send Verification OTP")');

    // Verify OTP field appears and submit test code
    await page.waitForSelector('text=Enter 6-Digit Email OTP');
    await page.fill('input[placeholder="0 0 0 0 0 0"]', '123456');
    await page.click('button:has-text("Verify & Save")');

    // Check updated email is displayed
    await expect(page.locator(`text=newemail_${newEmailTs}@example.com`)).toBeVisible();

    // 2. Test change phone
    await page.click('button:has-text("Change Phone")');
    const newPhone = '9' + String(Date.now() + 5000 + Math.floor(Math.random() * 1000)).slice(-9);
    await page.fill('input[placeholder="enter 10-digit number"]', newPhone);
    await page.click('button:has-text("Save Phone")');

    // Check updated phone is displayed
    await expect(page.locator(`text=${newPhone}`)).toBeVisible();
  });
});
