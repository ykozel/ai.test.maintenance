import { expect, type Locator, type Page } from '@playwright/test';

export class PlaywrightDevPage {
  readonly page: Page;
  readonly getStartedLink: Locator;
  readonly installationHeading: Locator;
  readonly mainNav: Locator;
  readonly docsLink: Locator;
  readonly apiLink: Locator;
  readonly communityLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedLink = page.getByRole('banner').getByRole('link', { name: 'Get started', exact: true });
    this.installationHeading = page.getByRole('heading', { name: 'Installation' });
    this.mainNav = page.getByRole('navigation', { name: 'Main' });
    this.docsLink = this.mainNav.getByRole('link', { name: 'Docs', exact: true });
    this.apiLink = this.mainNav.getByRole('link', { name: 'API', exact: true });
    this.communityLink = this.mainNav.getByRole('link', { name: 'Community', exact: true });
  }

  async goto() {
    await this.page.goto('/');
  }

  async navigateToGetStarted() {
    await this.getStartedLink.click();
  }

  async navigateToDocs() {
    await this.docsLink.click();
  }

  async navigateToApi() {
    await this.apiLink.click();
  }

  async navigateToCommunity() {
    await this.communityLink.click();
  }
}
