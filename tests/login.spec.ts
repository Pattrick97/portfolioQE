import { expect, test } from "../fixtures/auth-fixtures";
import { AuthPage } from "../pages/authPage.Page";

test.describe("Login", () => {
  test("user can log in with valid credentials @smoke", async ({ page, registeredUser }) => {
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await authPage.login(registeredUser.email, registeredUser.password);

    await expect(authPage.loggedInAs(registeredUser.firstName)).toBeVisible();
  });

  test("logout ends authenticated session", async ({ page, registeredUser }) => {
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await authPage.login(registeredUser.email, registeredUser.password);
    await expect(authPage.loggedInAs(registeredUser.firstName)).toBeVisible();

    await Promise.all([page.waitForURL(/.*login.*/), authPage.logoutLink().click()]);
    await expect(page).toHaveURL(/.*login.*/);
    await expect(authPage.loggedInAsAny()).toHaveCount(0);
    await expect(authPage.loginLink()).toBeVisible();
  });

  test("user cannot log in with invalid password", async ({ page, registeredUser }) => {
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await authPage.login(registeredUser.email, `${registeredUser.password}wrong`);

    await expect(authPage.invalidLoginMessage()).toBeVisible();
    await expect(authPage.loggedInAsAny()).toHaveCount(0);
  });

  test("user cannot log in with empty credentials", async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await authPage.login("", "");

    await expect(page).toHaveURL(/.*login.*/);
    await expect(authPage.loggedInAsAny()).toHaveCount(0);
  });

  test("user cannot log in with empty password", async ({ page, registeredUser }) => {
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await authPage.login(registeredUser.email, "");

    await expect(page).toHaveURL(/.*login.*/);
    await expect(authPage.loggedInAsAny()).toHaveCount(0);
  });

  test("user cannot log in with empty email", async ({ page, registeredUser }) => {
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await authPage.login("", registeredUser.password);

    await expect(page).toHaveURL(/.*login.*/);
    await expect(authPage.loggedInAsAny()).toHaveCount(0);
  });

  test("user cannot log in with nonexistent email", async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await authPage.login("nonexistent_user@example.com", "SomePassword1!");

    await expect(authPage.invalidLoginMessage()).toBeVisible();
    await expect(authPage.loggedInAsAny()).toHaveCount(0);
  });

  test("session persists across page navigation", async ({ page, registeredUser }) => {
    const authPage = new AuthPage(page);
    await authPage.navigate();
    await authPage.login(registeredUser.email, registeredUser.password);
    await expect(authPage.loggedInAs(registeredUser.firstName)).toBeVisible();

    await page.goto("/products");
    await page.goto("/");

    await expect(authPage.loggedInAs(registeredUser.firstName)).toBeVisible();
  });

  test("authenticated user navigating to /login does not get logged out", async ({
    page,
    registeredUser,
  }) => {
    const authPage = new AuthPage(page);
    await authPage.navigate();
    await authPage.login(registeredUser.email, registeredUser.password);
    await expect(authPage.loggedInAs(registeredUser.firstName)).toBeVisible();

    await authPage.navigate();

    await expect(authPage.loggedInAs(registeredUser.firstName)).toBeVisible();
    await expect(authPage.logoutLink()).toBeVisible();
  });

  test("login rejects SQL injection payload in email field", async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.navigate();
    await authPage.loginEmailInput().fill("' OR '1'='1'--");
    await authPage.loginPasswordInput().fill("anything");
    await authPage.loginButton().click();

    await expect(authPage.loginEmailInvalidField()).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
    await expect(authPage.loggedInAsAny()).toHaveCount(0);
  });

  test("logout invalidates server session — back navigation does not restore it", async ({
    page,
    registeredUser,
  }) => {
    const authPage = new AuthPage(page);
    await authPage.navigate();
    await authPage.login(registeredUser.email, registeredUser.password);
    await expect(authPage.loggedInAs(registeredUser.firstName)).toBeVisible();

    await Promise.all([page.waitForURL(/.*login.*/), authPage.logoutLink().click()]);
    await page.goBack();
    // Reload forces a fresh server request, bypassing bfcache — confirms server session is truly gone
    await page.reload();

    await expect(authPage.loggedInAsAny()).toHaveCount(0);
    await expect(authPage.logoutLink()).toHaveCount(0);
  });

  test("login email field enforces valid email format", async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.navigate();
    await authPage.loginEmailInput().fill("not-an-email");
    await authPage.loginPasswordInput().fill("somepassword");
    await authPage.loginButton().click();

    await expect(authPage.loginEmailInvalidField()).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
    await expect(authPage.loggedInAsAny()).toHaveCount(0);
  });

  test("unauthenticated user does not see account management links", async ({ page }) => {
    const authPage = new AuthPage(page);
    await page.goto("/");

    await expect(authPage.deleteAccountLink()).toHaveCount(0);
    await expect(authPage.loggedInAsAny()).toHaveCount(0);
    await expect(authPage.loginLink()).toBeVisible();
  });
});
