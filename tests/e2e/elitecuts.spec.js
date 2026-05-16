import { test, expect } from '@playwright/test';

test.describe('EliteCuts E2E - Auth Flow', () => {

    test('Should allow a new user to register', async ({ page }) => {
        // 1. Navigate to the main page
        await page.goto('/');

        // 2. Click the Register toggle/button
        await page.click('text=Register');

        // 3. Fill the form with a unique email to prevent duplicate entry errors
        const uniqueEmail = `test_${Date.now()}@playwright.com`;

        await page.fill('input[type="text"]', 'Playwright Tester');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.fill('input[placeholder*="Confirm"]', 'password123');

        // 4. Submit the form
        await page.click('button[type="submit"]');

        // 5. Verify successful registration by checking for the Logout button
        await expect(page.locator('button:has-text("Logout")')).toBeVisible({ timeout: 10000 });
    });

    test('Should test login failure and successful login', async ({ page }) => {
        await page.goto('/');

        // Test with invalid credentials
        await page.fill('input[type="email"]', 'nonexistent@example.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Verify error message appears
        await expect(page.locator('text=Login failed').first()).toBeVisible();

        // Test with valid credentials (assuming this user exists in DB via seeders)
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password');
        await page.click('button[type="submit"]');

        // Verify successful login
        await expect(page.locator('button:has-text("Logout")')).toBeVisible();
    });
});
