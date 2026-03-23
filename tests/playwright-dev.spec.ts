import { test, expect } from './fixtures';

// TC-HOME-001 — playwright.dev homepage smoke tests
test.describe('playwright.dev homepage', { tag: '@smoke' }, () => {
  // TC-HOME-001-A: Page title must identify the product for browser tab and SEO.
  test('TC-HOME-001-A: page title contains "Playwright"', async ({ playwrightDevPage }) => {
    await expect(playwrightDevPage.page).toHaveTitle(/Playwright/);
  });

  // TC-HOME-001-B: The primary CTA must reach the Installation page.
  test('TC-HOME-001-B: "Get started" link navigates to the installation page', async ({ playwrightDevPage }) => {
    await playwrightDevPage.navigateToGetStarted();
    await expect(playwrightDevPage.page).toHaveURL(/\/docs\/intro$/);
    await expect(playwrightDevPage.installationHeading).toBeVisible();
  });
});

