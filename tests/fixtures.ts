import { test as base, expect } from '@playwright/test';
import { PlaywrightDevPage } from '../pages/playwright-dev-page';

type Fixtures = {
  playwrightDevPage: PlaywrightDevPage;
};

export const test = base.extend<Fixtures>({
  playwrightDevPage: async ({ page }, use) => {
    const playwrightDevPage = new PlaywrightDevPage(page);
    await playwrightDevPage.goto();
    await use(playwrightDevPage);
  },
});

export { expect };
