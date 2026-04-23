import { expect, test as base } from "@playwright/test";

export { expect };

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addLocatorHandler(page.locator(".fc-consent-root"), async () => {
      const consentButton = page.getByRole("button", {
        name: /consent|agree|accept|zgoda|zgadzam|akcept/i,
      });
      if (await consentButton.first().isVisible()) {
        await consentButton.first().click();
      }
    });

    await use(page);
  },
});
