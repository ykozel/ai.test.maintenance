import { type Locator } from '@playwright/test';
import { test, expect } from './fixtures';
import { PlaywrightDevPage } from '../pages/playwright-dev-page';

// NavLink describes one entry in the main navigation bar.
// locator()  — resolves the link element via the POM (evaluated lazily per test)
// navigate() — clicks the link via the POM action method
// heading    — visible h1 on the destination page, used to confirm a real page load
// urlPattern — anchored regex; must not match sibling routes (e.g. /docs/api-testing)
type NavLink = {
  name: string;
  locator: (p: PlaywrightDevPage) => Locator;
  navigate: (p: PlaywrightDevPage) => Promise<void>;
  href: string;
  urlPattern: RegExp;
  heading: string;
};

const NAV_LINKS: NavLink[] = [
  {
    name: 'Docs',
    locator: (p) => p.docsLink,
    navigate: (p) => p.navigateToDocs(),
    href: '/docs/intro',
    urlPattern: /\/docs\/intro$/,
    heading: 'Installation',
  },
  {
    name: 'API',
    locator: (p) => p.apiLink,
    navigate: (p) => p.navigateToApi(),
    href: '/docs/api/class-playwright',
    urlPattern: /\/docs\/api\/class-playwright$/,
    heading: 'Playwright',
  },
  {
    name: 'Community',
    locator: (p) => p.communityLink,
    navigate: (p) => p.navigateToCommunity(),
    href: '/community/welcome',
    urlPattern: /\/community\/welcome$/,
    heading: 'Welcome',
  },
];

// TC-NAV-001 — Main page navigation bar
// Covers: visibility, ARIA semantics, href integrity, click-through behaviour, edge cases
test.describe('Main page navigation', { tag: '@navigation' }, () => {
  // TC-NAV-001-A: The <nav> landmark must carry an accessible name so screen readers
  // can announce it distinctly from other navigation regions on the page.
  test('TC-NAV-001-A: navigation landmark has accessible name "Main"', async ({ playwrightDevPage }) => {
    await expect(playwrightDevPage.mainNav).toHaveAccessibleName('Main');
  });

  // TC-NAV-001-B: All three primary nav links must be visible to sighted users
  // on initial page load without any interaction.
  test('TC-NAV-001-B: all primary nav links are visible on load', async ({ playwrightDevPage }) => {
    for (const { name, locator } of NAV_LINKS) {
      await test.step(`${name} link is visible`, () => expect(locator(playwrightDevPage)).toBeVisible());
    }
  });

  // TC-NAV-001-C / D: Per-link tests generated from NAV_LINKS at collection time.
  // Playwright registers test() calls synchronously before execution begins.
  // To add or rename a nav link, update NAV_LINKS only — tests update automatically.
  for (const { name, locator, navigate, href, urlPattern, heading } of NAV_LINKS) {
    // TC-NAV-001-C: Each link must expose the correct ARIA role and accessible name
    // so assistive technologies can identify and activate it, and the href must
    // point to the expected destination without a redirect.
    test(`TC-NAV-001-C: ${name} link has correct role, accessible name, and href`, async ({ playwrightDevPage }) => {
      const link = locator(playwrightDevPage);
      await test.step('has link role', () => expect(link).toHaveRole('link'));
      await test.step(`has accessible name "${name}"`, () => expect(link).toHaveAccessibleName(name));
      await test.step(`href is "${href}"`, () => expect(link).toHaveAttribute('href', href));
    });

    // TC-NAV-001-D: Clicking the link must land on the correct destination.
    // URL is checked with an anchored pattern to prevent false passes on sibling routes.
    // The page heading is also verified to confirm content rendered, not just the URL changed.
    test(`TC-NAV-001-D: clicking ${name} navigates to the correct page`, async ({ playwrightDevPage }) => {
      await navigate(playwrightDevPage);
      await expect(playwrightDevPage.page).toHaveURL(urlPattern);
      await expect(playwrightDevPage.page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    });
  }

  // TC-NAV-001-E: Edge case — nav links must remain interactive (not hidden or disabled)
  // after the page has fully loaded. A link that is present in the DOM but aria-hidden
  // or pointer-events:none would pass visibility checks yet be unusable.
  test('TC-NAV-001-E: nav links are enabled and not aria-hidden', async ({ playwrightDevPage }) => {
    for (const { name, locator } of NAV_LINKS) {
      const link = locator(playwrightDevPage);
      await test.step(`${name} is not aria-hidden`, async () => {
        await expect(link).not.toHaveAttribute('aria-hidden', 'true');
      });
      await test.step(`${name} is not disabled`, async () => {
        await expect(link).toBeEnabled();
      });
    }
  });

  // TC-NAV-001-F: Edge case — nav links must not open in a new tab.
  // Internal navigation links should never carry target="_blank"; doing so
  // would break the browser back-button flow and violate WCAG 3.2.2 (On Input).
  // Also verifies the final URL remains on the same origin after navigation,
  // guarding against accidental external redirects.
  test('TC-NAV-001-F: nav links navigate in the same tab and stay on the same origin', async ({ playwrightDevPage }) => {
    const origin = new URL(playwrightDevPage.page.url()).origin;

    for (const { name, locator, navigate } of NAV_LINKS) {
      // Re-navigate to home before each iteration so the starting state is clean
      await playwrightDevPage.goto();

      const link = locator(playwrightDevPage);

      await test.step(`${name}: does not have target="_blank"`, async () => {
        await expect(link).not.toHaveAttribute('target', '_blank');
      });

      await test.step(`${name}: stays on the same origin after click`, async () => {
        await navigate(playwrightDevPage);
        const finalOrigin = new URL(playwrightDevPage.page.url()).origin;
        expect(finalOrigin).toBe(origin);
      });
    }
  });
});
