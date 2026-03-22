import { type Locator } from '@playwright/test';
import { test, expect } from './fixtures';
import { PlaywrightDevPage } from '../pages/playwright-dev-page';

type NavLink = {
  name: string;
  locator: (p: PlaywrightDevPage) => Locator;
  navigate: (p: PlaywrightDevPage) => Promise<void>;
  href: string;
  urlPattern: RegExp;
};

const NAV_LINKS: NavLink[] = [
  {
    name: 'Docs',
    locator: (p) => p.docsLink,
    navigate: (p) => p.navigateToDocs(),
    href: '/docs/intro',
    urlPattern: /\/docs\/intro/,
  },
  {
    name: 'API',
    locator: (p) => p.apiLink,
    navigate: (p) => p.navigateToApi(),
    href: '/docs/api/class-playwright',
    urlPattern: /\/docs\/api/,
  },
  {
    name: 'Community',
    locator: (p) => p.communityLink,
    navigate: (p) => p.navigateToCommunity(),
    href: '/community/welcome',
    urlPattern: /\/community/,
  },
];

test.describe('Main page navigation', () => {
  test('navigation landmark should be accessible', async ({ playwrightDevPage }) => {
    await expect(playwrightDevPage.mainNav).toHaveAccessibleName('Main');
  });

  test('should display navigation links: Docs, API, Community', async ({ playwrightDevPage }) => {
    await test.step('Docs link is visible', () => expect(playwrightDevPage.docsLink).toBeVisible());
    await test.step('API link is visible', () => expect(playwrightDevPage.apiLink).toBeVisible());
    await test.step('Community link is visible', () => expect(playwrightDevPage.communityLink).toBeVisible());
  });

  for (const { name, locator, navigate, href, urlPattern } of NAV_LINKS) {
    test(`${name} link has correct role, accessible name, and href`, async ({ playwrightDevPage }) => {
      const link = locator(playwrightDevPage);
      await test.step('has link role', () => expect(link).toHaveRole('link'));
      await test.step(`has accessible name "${name}"`, () => expect(link).toHaveAccessibleName(name));
      await test.step(`href is "${href}"`, () => expect(link).toHaveAttribute('href', href));
    });

    test(`clicking ${name} navigates to the correct page`, async ({ playwrightDevPage }) => {
      await navigate(playwrightDevPage);
      await expect(playwrightDevPage.page).toHaveURL(urlPattern);
    });
  }
});
