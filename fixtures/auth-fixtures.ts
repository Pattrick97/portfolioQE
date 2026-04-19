import { test as base, expect } from "./test-fixtures";
import { generateSignupData, SignupData } from "../data/auth.data";
import { createAccount, deleteAccount } from "../helpers/auth.helper";

export { expect };

export const test = base.extend<{
  registeredUser: SignupData;
}>({
  registeredUser: [
    async ({ browser }, use) => {
      const accountData = generateSignupData();
      await createAccount(browser, accountData);
      await use(accountData);
      await deleteAccount(browser, accountData);
    },
    { scope: "worker" },
  ],
});
