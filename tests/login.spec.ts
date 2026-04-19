import { expect, test } from "../fixtures/auth-fixtures";
import { SignupPage } from "../pages/signupPage.Page";

test.describe("Login", () => {
  test("user can log in with valid credentials @smoke", async ({ page, registeredUser }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login(registeredUser.email, registeredUser.password);

    await expect(signupPage.loggedInAs(registeredUser.firstName)).toBeVisible();
  });

  test("logout ends authenticated session", async ({ page, registeredUser }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login(registeredUser.email, registeredUser.password);
    await expect(signupPage.loggedInAs(registeredUser.firstName)).toBeVisible();

    await signupPage.logoutLink().click();
    await expect(page).toHaveURL(/.*login.*/);
    await expect(signupPage.loggedInAsAny()).toHaveCount(0);
    await expect(signupPage.loginLink()).toBeVisible();
  });

  test("user cannot log in with invalid password", async ({ page, registeredUser }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login(registeredUser.email, `${registeredUser.password}wrong`);

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

  test("user cannot log in with empty password", async ({ page, registeredUser }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login(registeredUser.email, "");

    await expect(page).toHaveURL(/.*login.*/);
    await expect(signupPage.loggedInAsAny()).toHaveCount(0);
  });

  test("user cannot log in with empty email", async ({ page, registeredUser }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login("", registeredUser.password);

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

  test("unauthenticated user does not see account management links", async ({ page }) => {
    const signupPage = new SignupPage(page);
    await page.goto("/");

    await expect(signupPage.deleteAccountLink()).toHaveCount(0);
    await expect(signupPage.loggedInAsAny()).toHaveCount(0);
    await expect(signupPage.loginLink()).toBeVisible();
  });
});
