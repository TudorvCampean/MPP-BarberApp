import { test, expect } from '@playwright/test';

test.describe('EliteCuts E2E - Complete Auth Flow', () => {
    
    // Generăm un email unic la fiecare rulare a testului pentru a evita erorile de "email deja folosit"
    const uniqueEmail = `tester_${Date.now()}@playwright.com`;
    const testPassword = 'StrongPassword123!';

    test('Should successfully register, logout, and login', async ({ page }) => {
        // ==========================================
        // 1. REGISTER FLOW
        // ==========================================
        await page.goto('/');
        
        // Folosim ID-ul exact din componenta PresentationView.vue
        await page.click('[data-testid="presentation-register"]');

        // Completăm formularul
        await page.fill('input[type="text"]', 'E2E Tester');
        await page.fill('input[type="email"]', uniqueEmail);

        // Deoarece avem două input-uri de parolă (Password și Confirm), le luăm pe amândouă
        const passwordInputs = page.locator('input[type="password"]');
        await passwordInputs.nth(0).fill(testPassword);
        await passwordInputs.nth(1).fill(testPassword);

        await page.click('button[type="submit"]');

        // Verificăm succesul: a intrat în aplicație și vede butonul de Logout
        const logoutBtn = page.locator('[data-testid="table-logout"]');
        await expect(logoutBtn).toBeVisible({ timeout: 10000 });


        // ==========================================
        // 2. LOGOUT FLOW
        // ==========================================
        await logoutBtn.click();

        // Verificăm că a fost aruncat înapoi la pagina de prezentare
        const loginBtn = page.locator('[data-testid="presentation-sign-in"]');
        await expect(loginBtn).toBeVisible();


        // ==========================================
        // 3. LOGIN FLOW (Fail + Success)
        // ==========================================
        await loginBtn.click();

        // A. Logare cu credențiale greșite
        await page.fill('input[type="email"]', uniqueEmail);
        await page.fill('input[type="password"]', 'wrong_pass_here');
        await page.click('button[type="submit"]');

        // Așteptăm să apară o eroare roșie în UI (clasa Tailwind pt text de eroare)
        await expect(page.locator('.text-red-500, .text-red-400')).toBeVisible();

        // B. Logare cu credențiale corecte
        // Curățăm câmpul de parolă (îl selectăm, ștergem și scriem parola bună)
        await page.fill('input[type="password"]', testPassword);
        await page.click('button[type="submit"]');

        // Verificăm că a reintrat în cont cu succes
        await expect(page.locator('[data-testid="table-logout"]')).toBeVisible({ timeout: 10000 });
    });
});