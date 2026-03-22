import { test, expect } from '@playwright/test';
import { PlaywrightDevPage } from '../pages/playwright-dev-page';

test.describe('playwright.dev homepage', () => {
  test('has title', async ({ page }) => {
    const playwrightDev = new PlaywrightDevPage(page);
    await playwrightDev.goto();
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('get started link navigates to installation page', async ({ page }) => {
    const playwrightDev = new PlaywrightDevPage(page);
    await playwrightDev.goto();
    await playwrightDev.navigateToGetStarted();
    await expect(page).toHaveURL(/.*intro/);
    await expect(playwrightDev.installationHeading).toBeVisible();
  });
});
