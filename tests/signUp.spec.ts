import { expect, test } from "../fixtures/test-fixtures";
import { generateSignupData, authMessages, signupInvalidInputs } from "../data/auth.data";
import { AuthPage } from "../pages/authPage.Page";
import { recoverFromVignette } from "../helpers/vignette.helper";

test.describe("Signup", () => {
  test("user can sign up @smoke", async ({ page }) => {
    const data = generateSignupData();
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await expect(authPage.newUserSignupHeader()).toBeVisible();

    await authPage.startSignup(data);
    await Promise.race([
      expect(authPage.accountInfoHeader()).toBeVisible(),
      expect(authPage.emailAlreadyExistsMessage()).toBeVisible(),
    ]);
    await expect(authPage.emailAlreadyExistsMessage()).toHaveCount(0);

    await authPage.fillSignUpForm(data);
    await authPage.createAccount();
    await recoverFromVignette(page, {
      expectedUrlPart: "account_created",
      fallbackPath: "/account_created",
    });
    await expect(page).toHaveURL(/.*account_created.*/);
    await expect(authPage.accountCreatedHeader()).toContainText(authMessages.accountCreated);

    await authPage.continueAfterAccountCreated();
    await expect
      .poll(
        async () =>
          (await authPage.logoutLink().isVisible()) || (await authPage.loginLink().isVisible()),
      )
      .toBe(true);
    if (await authPage.logoutLink().isVisible()) {
      await Promise.all([page.waitForURL(/.*login.*/), authPage.logoutLink().click()]);
    }
    await authPage.login(data.email, data.password);
    await expect(authPage.loggedInAs(data.firstName)).toBeVisible();
    await authPage.deleteAccount();
    await expect(authPage.accountDeletedHeader()).toContainText(authMessages.accountDeleted);
    await expect(page).toHaveURL(/.*delete_account.*/);
  });

  test("user can register, log out and log in again", async ({ page }) => {
    const data = generateSignupData();
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await authPage.startSignup(data);
    await expect(authPage.accountInfoHeader()).toBeVisible();

    await authPage.fillSignUpForm(data);
    await authPage.createAccount();
    await recoverFromVignette(page, {
      expectedUrlPart: "account_created",
      fallbackPath: "/account_created",
    });
    await expect(authPage.accountCreatedHeader()).toContainText(authMessages.accountCreated);

    await authPage.continueAfterAccountCreated();
    await expect(authPage.loggedInAs(data.firstName)).toBeVisible();

    await authPage.logoutLink().click();
    await expect(page).toHaveURL(/.*login.*/);

    await authPage.login(data.email, data.password);
    await expect(authPage.loggedInAs(data.firstName)).toBeVisible();

    await authPage.deleteAccount();
    await expect(authPage.accountDeletedHeader()).toContainText(authMessages.accountDeleted);
  });

  test("user cannot sign up with existing email", async ({ page }) => {
    const data = generateSignupData();
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await expect(authPage.newUserSignupHeader()).toBeVisible();

    await authPage.startSignup(data);
    await recoverFromVignette(page, { fallbackPath: "/login" });
    await expect(authPage.accountInfoHeader()).toBeVisible();
    await expect(authPage.emailAlreadyExistsMessage()).toHaveCount(0);

    await authPage.fillSignUpForm(data);
    await authPage.createAccount();
    await recoverFromVignette(page, {
      expectedUrlPart: "account_created",
      fallbackPath: "/account_created",
    });
    await expect(authPage.accountCreatedHeader()).toContainText(authMessages.accountCreated);

    await authPage.continueAfterAccountCreated();
    await expect(authPage.loggedInAs(data.firstName)).toBeVisible();
    await authPage.logoutLink().click();
    await expect(page).toHaveURL(/.*login.*/);

    await authPage.navigate();
    await expect(authPage.newUserSignupHeader()).toBeVisible();

    await authPage.startSignup(data);
    await recoverFromVignette(page, { fallbackPath: "/login" });
    await expect(authPage.emailAlreadyExistsMessage()).toBeVisible();
  });

  test("signup start is blocked when name is empty", async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await expect(authPage.newUserSignupHeader()).toBeVisible();

    await authPage.signupEmailInput().fill(signupInvalidInputs.validEmail);
    await authPage.signupButton().click();

    await expect(authPage.accountInfoHeader()).toHaveCount(0);
    await expect(authPage.signupNameInvalidField()).toHaveCount(1);
  });

  test("signup start is blocked when email format is invalid", async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await expect(authPage.newUserSignupHeader()).toBeVisible();

    await authPage.signupNameInput().fill(signupInvalidInputs.validName);
    await authPage.signupEmailInput().fill(signupInvalidInputs.invalidEmailFormat);
    await authPage.signupButton().click();

    await expect(authPage.accountInfoHeader()).toHaveCount(0);
    await expect(authPage.signupEmailInvalidField()).toHaveCount(1);
  });

  test("registration form blocks account creation when required fields are empty", async ({
    page,
  }) => {
    const data = generateSignupData();
    const authPage = new AuthPage(page);

    await authPage.navigate();
    await authPage.startSignup(data);
    await expect(authPage.accountInfoHeader()).toBeVisible();

    await authPage.createAccount();

    await expect(page).toHaveURL(/.*signup.*/);
    await expect(authPage.passwordInvalidField()).toHaveCount(1);
  });
});
