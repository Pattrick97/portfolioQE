import { expect, test } from "../fixtures/test-fixtures";
import { generateSignupData, SignupData } from "../data/signUp.data";
import { SignupPage } from "../pages/signupPage.Page";
import { testMessages } from "../data/testConstants.data";
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
    await expect(page.locator("a", { hasText: "Logged in as" })).toHaveCount(0);
    await expect(page.locator("a[href='/login']")).toBeVisible();
  });

  test("user cannot log in with invalid password", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login(accountData.email, `${accountData.password}wrong`);

    await expect(
      page.locator("p", { hasText: testMessages.invalidLogin }),
    ).toBeVisible();
    await expect(page.locator("a", { hasText: "Logged in as" })).toHaveCount(0);
  });

  test("user cannot log in with empty credentials", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login("", "");

    await expect(page).toHaveURL(/.*login.*/);
    await expect(page.locator("a", { hasText: "Logged in as" })).toHaveCount(0);
  });

  test("user cannot log in with nonexistent email", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login("nonexistent_user@example.com", "SomePassword1!");

    await expect(
      page.locator("p", { hasText: testMessages.invalidLogin }),
    ).toBeVisible();
    await expect(page.locator("a", { hasText: "Logged in as" })).toHaveCount(0);
  });

  test("unauthenticated user does not see account management links", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("a[href='/delete_account']")).toHaveCount(0);
    await expect(page.locator("a", { hasText: "Logged in as" })).toHaveCount(0);
    await expect(page.locator("a[href='/login']")).toBeVisible();
  });
});
