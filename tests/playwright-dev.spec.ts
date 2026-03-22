import { test, expect } from './fixtures';

test.describe('playwright.dev homepage', () => {
  test('has title', async ({ playwrightDevPage }) => {
    await expect(playwrightDevPage.page).toHaveTitle(/Playwright/);
  });

  test('get started link navigates to installation page', async ({ playwrightDevPage }) => {
    await playwrightDevPage.navigateToGetStarted();
    await expect(playwrightDevPage.page).toHaveURL(/.*intro/);
    await expect(playwrightDevPage.installationHeading).toBeVisible();
  });
});

