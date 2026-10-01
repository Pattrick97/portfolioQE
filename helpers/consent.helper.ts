import { Page } from "@playwright/test";

export async function installConsentHandler(page: Page): Promise<void> {
  await page.addLocatorHandler(page.locator(".fc-consent-root"), async () => {
    const consentButton = page.getByRole("button", {
      name: /consent|agree|accept|zgoda|zgadzam|akcept/i,
    });
    if (await consentButton.first().isVisible()) {
      await consentButton.first().click();
    }
  });
}
