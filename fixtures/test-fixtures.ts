import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto("/login");

    const consentButton = page.getByRole("button", { name: /consent/i });
    if (await consentButton.isVisible()) {
      await consentButton.click();
    }

    await use(page);
  },
});
