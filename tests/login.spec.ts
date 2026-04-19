import { expect, test } from "../fixtures/test-fixtures";
import { generateSignupData, SignupData } from "../data/auth.data";
import { SignupPage } from "../pages/signupPage.Page";
import { createAccount, deleteAccount } from "../helpers/auth.helper";

test.describe("Login", () => {
  let accountData: SignupData;

  test.beforeAll(async ({ browser }) => {
    accountData = generateSignupData();
    await createAccount(browser, accountData);
  });

  test.afterAll(async ({ browser }) => {
    await deleteAccount(browser, accountData);
  });

  test("user can log in with valid credentials", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login(accountData.email, accountData.password);

    await expect(signupPage.loggedInAs(accountData.firstName)).toBeVisible();
  });

  test("logout ends authenticated session", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login(accountData.email, accountData.password);
    await expect(signupPage.loggedInAs(accountData.firstName)).toBeVisible();

    await signupPage.logoutLink().click();
    await expect(page).toHaveURL(/.*login.*/);
    await expect(signupPage.loggedInAsAny()).toHaveCount(0);
    await expect(signupPage.loginLink()).toBeVisible();
  });

  test("user cannot log in with invalid password", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login(accountData.email, `${accountData.password}wrong`);

    await expect(signupPage.invalidLoginMessage()).toBeVisible();
    await expect(signupPage.loggedInAsAny()).toHaveCount(0);
  });

  test("user cannot log in with empty credentials", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login("", "");

    await expect(page).toHaveURL(/.*login.*/);
    await expect(signupPage.loggedInAsAny()).toHaveCount(0);
  });

  test("user cannot log in with nonexistent email", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login("nonexistent_user@example.com", "SomePassword1!");

    await expect(signupPage.invalidLoginMessage()).toBeVisible();
    await expect(signupPage.loggedInAsAny()).toHaveCount(0);
  });

  test("unauthenticated user does not see account management links", async ({
    page,
  }) => {
    const signupPage = new SignupPage(page);
    await page.goto("/");

    await expect(signupPage.deleteAccountLink()).toHaveCount(0);
    await expect(signupPage.loggedInAsAny()).toHaveCount(0);
    await expect(signupPage.loginLink()).toBeVisible();
  });
});
