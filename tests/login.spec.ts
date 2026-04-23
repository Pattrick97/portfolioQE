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

    await Promise.all([page.waitForURL(/.*login.*/), signupPage.logoutLink().click()]);
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

  test("session persists across page navigation", async ({ page, registeredUser }) => {
    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.login(registeredUser.email, registeredUser.password);
    await expect(signupPage.loggedInAs(registeredUser.firstName)).toBeVisible();

    await page.goto("/products");
    await page.goto("/");

    await expect(signupPage.loggedInAs(registeredUser.firstName)).toBeVisible();
  });

  test("authenticated user navigating to /login does not get logged out", async ({
    page,
    registeredUser,
  }) => {
    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.login(registeredUser.email, registeredUser.password);
    await expect(signupPage.loggedInAs(registeredUser.firstName)).toBeVisible();

    await signupPage.navigate();

    await expect(signupPage.loggedInAs(registeredUser.firstName)).toBeVisible();
    await expect(signupPage.logoutLink()).toBeVisible();
  });

  test("login rejects SQL injection payload in email field", async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.loginEmailInput().fill("' OR '1'='1'--");
    await signupPage.loginPasswordInput().fill("anything");
    await signupPage.loginButton().click();

    await expect(signupPage.loginEmailInvalidField()).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
    await expect(signupPage.loggedInAsAny()).toHaveCount(0);
  });

  test("logout invalidates server session — back navigation does not restore it", async ({
    page,
    registeredUser,
  }) => {
    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.login(registeredUser.email, registeredUser.password);
    await expect(signupPage.loggedInAs(registeredUser.firstName)).toBeVisible();

    await Promise.all([page.waitForURL(/.*login.*/), signupPage.logoutLink().click()]);
    await page.goBack();
    // Reload forces a fresh server request, bypassing bfcache — confirms server session is truly gone
    await page.reload();

    await expect(signupPage.loggedInAsAny()).toHaveCount(0);
    await expect(signupPage.logoutLink()).toHaveCount(0);
  });

  test("login email field enforces valid email format", async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.loginEmailInput().fill("not-an-email");
    await signupPage.loginPasswordInput().fill("somepassword");
    await signupPage.loginButton().click();

    await expect(signupPage.loginEmailInvalidField()).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
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
