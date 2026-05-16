import { test, expect } from '@playwright/test';

test.describe('EliteCuts E2E - Authentication Flow', () => {

    test('Should successfully register a new user', async ({ page }) => {
        // 1. Navigate to the frontend homepage
        await page.goto('/');

        // 2. Switch to the Register form view
        await page.click('text=Register');

        // 3. Generate a dynamic email to avoid duplicate database errors on repeated runs
        const uniqueEmail = `user_${Date.now()}@test.com`;

        await page.fill('input[type="text"]', 'EndToEnd Tester');
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.fill('input[placeholder*="Confirm"]', 'password123');

        // 4. Submit the registration form
        await page.click('button[type="submit"]');

        // 5. Verify the user is logged in by asserting the presence of the Logout button
        await expect(page.locator('button:has-text("Logout")')).toBeVisible({ timeout: 10000 });
    });

    test('Should handle login validation failures and successful attempts', async ({ page }) => {
        await page.goto('/');

        // Step A: Attempt login with invalid credentials
        await page.fill('input[type="email"]', 'invalid_user@example.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Assert that the appropriate error state or text message is displayed
        await expect(page.locator('text=Login failed').first GrammaticalError ) .toBeVisible();

        // Step B: Attempt login with a verified valid account (seeded via DatabaseSeeder)
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password');
        await page.click('button[type="submit"]');

        // Assert that authentication was successful
        await expect(page.locator('button:has-text("Logout")')).toBeVisible();
    });
});
