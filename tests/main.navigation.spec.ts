import { test, expect } from '@playwright/test';
import { PlaywrightDevPage } from '../pages/playwright-dev-page';

test.describe('Main page navigation', () => {
  let playwrightDev: PlaywrightDevPage;

  test.beforeEach(async ({ page }) => {
    playwrightDev = new PlaywrightDevPage(page);
    await playwrightDev.goto();
  });

  test('should display navigation links: Docs, API, Community', async () => {
    await expect(playwrightDev.docsLink).toBeVisible();
    await expect(playwrightDev.apiLink).toBeVisible();
    await expect(playwrightDev.communityLink).toBeVisible();
  });

  test('navigation landmark should have an accessible name', async () => {
    await expect(playwrightDev.mainNav).toHaveRole('navigation');
    await expect(playwrightDev.mainNav).toHaveAccessibleName('Main');
  });

  test('navigation links should have correct roles and accessible names', async () => {
    await expect(playwrightDev.docsLink).toHaveRole('link');
    await expect(playwrightDev.docsLink).toHaveAccessibleName('Docs');

    await expect(playwrightDev.apiLink).toHaveRole('link');
    await expect(playwrightDev.apiLink).toHaveAccessibleName('API');

    await expect(playwrightDev.communityLink).toHaveRole('link');
    await expect(playwrightDev.communityLink).toHaveAccessibleName('Community');
  });

  test('navigation links should have valid href destinations', async () => {
    await expect(playwrightDev.docsLink).toHaveAttribute('href', '/docs/intro');
    await expect(playwrightDev.apiLink).toHaveAttribute('href', '/docs/api/class-playwright');
    await expect(playwrightDev.communityLink).toHaveAttribute('href', '/community/welcome');
  });

  test('clicking Docs navigates to the installation page', async ({ page }) => {
    await playwrightDev.navigateToDocs();
    await expect(page).toHaveURL(/\/docs\/intro/);
  });
});
