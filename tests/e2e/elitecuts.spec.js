import { expect, test } from '@playwright/test';

const COOKIE_NAME = 'elitecuts_browser_state_v1';

const getBrowserState = async (page) => {
    const cookies = await page.context().cookies();
    const cookie = cookies.find((entry) => entry.name === COOKIE_NAME);

    if (!cookie) return null;

    try {
        return JSON.parse(decodeURIComponent(cookie.value));
    } catch {
        return null;
    }
};

const nextDateInputValue = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
};

test.describe('Elite Cuts browser flows', () => {
    test('restores the last visited page from cookies after reload', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByTestId('presentation-open-calendar')).toBeVisible();
        await page.getByTestId('presentation-open-calendar').click();

        await expect(page.getByTestId('table-add-appointment')).toBeVisible();

        const stateAfterNavigate = await getBrowserState(page);
        expect(stateAfterNavigate?.lastPage).toBe('table');
        expect(stateAfterNavigate?.lastAction).toBe('navigate');

        await page.reload();
        await expect(page.getByTestId('table-add-appointment')).toBeVisible();
        await expect(page.getByTestId('table-view-table')).toHaveClass(/bg-slate-800/);
    });

    test('persists the selected table view mode in a cookie', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('presentation-open-calendar').click();

        await page.getByTestId('table-view-cards').click();
        await expect(page.getByText('Total Income')).toBeVisible();

        const stateAfterPreference = await getBrowserState(page);
        expect(stateAfterPreference?.tableViewMode).toBe('cards');
        expect(stateAfterPreference?.lastAction).toBe('table_view_mode');

        await page.reload();
        await expect(page.getByText('Total Income')).toBeVisible();
        await expect(page.getByTestId('table-view-cards')).toHaveClass(/bg-slate-800/);
    });

    test('tracks appointment creation and allows navigating to statistics and home', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('presentation-open-calendar').click();

        await page.getByTestId('table-add-appointment').click();
        await page.getByTestId('appointment-client-name').fill('Playwright Client');
        await page.getByTestId('appointment-date').fill(nextDateInputValue());
        await page.getByTestId('appointment-hour').selectOption('10');
        await page.getByTestId('appointment-minute').selectOption('30');
        await page.getByTestId('appointment-save').click();

        await expect(page.getByTestId('appointment-save')).toBeHidden();

        const stateAfterCreate = await getBrowserState(page);
        expect(stateAfterCreate?.lastAction).toBe('appointment_created');
        expect(stateAfterCreate?.lastActionValue).toBe('Playwright Client');

        await page.getByTestId('table-statistics').click();
        await expect(page.getByText('Insights')).toBeVisible();

        const stateAfterStatsNav = await getBrowserState(page);
        expect(stateAfterStatsNav?.lastPage).toBe('statistics');
        expect(stateAfterStatsNav?.lastAction).toBe('navigate');

        await page.getByTestId('statistics-home').click();
        await expect(page.getByTestId('table-add-appointment')).toBeVisible();

        const finalState = await getBrowserState(page);
        expect(finalState?.lastPage).toBe('table');
    });

    test('allows choosing a specific month in statistics', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('presentation-open-calendar').click();
        await page.getByTestId('table-statistics').click();

        await expect(page.getByText('Insights')).toBeVisible();

        await page.getByTestId('statistics-month-select').selectOption('0');
        await expect(page.getByTestId('statistics-current-month')).toContainText('January');

        await page.getByTestId('statistics-month-select').selectOption('11');
        await expect(page.getByTestId('statistics-current-month')).toContainText('December');
    });

    test('is responsive on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        await expect(page.getByTestId('presentation-open-calendar')).toBeVisible();
        await page.getByTestId('presentation-open-calendar').click();

        await expect(page.getByTestId('table-add-appointment')).toBeVisible();

        await page.getByTestId('table-view-cards').click();
        await expect(page.getByText('Total Income')).toBeVisible();
    });

    test('is responsive on tablet viewport', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');

        await expect(page.getByTestId('presentation-open-calendar')).toBeVisible();
        await page.getByTestId('presentation-open-calendar').click();

        await expect(page.getByTestId('table-add-appointment')).toBeVisible();
    });

    test('is responsive on desktop viewport', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');

        await expect(page.getByTestId('presentation-open-calendar')).toBeVisible();
        await page.getByTestId('presentation-open-calendar').click();

        await expect(page.getByTestId('table-add-appointment')).toBeVisible();
    });
});

