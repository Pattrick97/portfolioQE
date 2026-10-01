import { expect, test as base } from "@playwright/test";
import { installConsentHandler } from "../helpers/consent.helper";

export { expect };

export const test = base.extend({
  page: async ({ page }, use) => {
    await installConsentHandler(page);
    await use(page);
  },
});
