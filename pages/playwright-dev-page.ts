import { expect, type Locator, type Page } from '@playwright/test';

export class PlaywrightDevPage {
  readonly page: Page;
  readonly getStartedLink: Locator;
  readonly installationHeading: Locator;
  readonly pageTitle: Locator;
  readonly mainNav: Locator;
  readonly docsLink: Locator;
  readonly apiLink: Locator;
  readonly communityLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    this.installationHeading = page.getByRole('heading', { name: 'Installation' });
    this.pageTitle = page.locator('h1');
    this.mainNav = page.getByRole('navigation', { name: 'Main' });
    this.docsLink = this.mainNav.getByRole('link', { name: 'Docs' });
    this.apiLink = this.mainNav.getByRole('link', { name: 'API' });
    this.communityLink = this.mainNav.getByRole('link', { name: 'Community' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async navigateToGetStarted() {
    await this.getStartedLink.first().click();
    await expect(this.installationHeading).toBeVisible();
  }

  async navigateToDocs() {
    await this.docsLink.click();
  }
}
