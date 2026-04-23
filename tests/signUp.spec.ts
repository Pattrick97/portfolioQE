import { expect, test } from "../fixtures/test-fixtures";
import { generateSignupData, authMessages, signupInvalidInputs } from "../data/auth.data";
import { SignupPage } from "../pages/signupPage.Page";
import { recoverFromVignette } from "../helpers/vignette.helper";

test.describe("Signup", () => {
  test("user can sign up @smoke", async ({ page }) => {
    const data = generateSignupData();
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await expect(signupPage.newUserSignupHeader()).toBeVisible();

    await signupPage.startSignup(data);
    await Promise.race([
      expect(signupPage.accountInfoHeader()).toBeVisible(),
      expect(signupPage.emailAlreadyExistsMessage()).toBeVisible(),
    ]);
    await expect(signupPage.emailAlreadyExistsMessage()).toHaveCount(0);

    await signupPage.fillSignUpForm(data);
    await signupPage.createAccount();
    await recoverFromVignette(page, {
      expectedUrlPart: "account_created",
      fallbackPath: "/account_created",
    });
    await expect(page).toHaveURL(/.*account_created.*/);
    await expect(signupPage.accountCreatedHeader()).toContainText(authMessages.accountCreated);

    await signupPage.login(data.email, data.password);
    await signupPage.deleteAccount();
    await expect(signupPage.accountDeletedHeader()).toContainText(authMessages.accountDeleted);
    await expect(page).toHaveURL(/.*delete_account.*/);
  });

  test("user can register, log out and log in again", async ({ page }) => {
    const data = generateSignupData();
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.startSignup(data);
    await expect(signupPage.accountInfoHeader()).toBeVisible();

    await signupPage.fillSignUpForm(data);
    await signupPage.createAccount();
    await recoverFromVignette(page, {
      expectedUrlPart: "account_created",
      fallbackPath: "/account_created",
    });
    await expect(signupPage.accountCreatedHeader()).toContainText(authMessages.accountCreated);

    await signupPage.continueAfterAccountCreated();
    await expect(signupPage.loggedInAs(data.firstName)).toBeVisible();

    await signupPage.logoutLink().click();
    await expect(page).toHaveURL(/.*login.*/);

    await signupPage.login(data.email, data.password);
    await expect(signupPage.loggedInAs(data.firstName)).toBeVisible();

    await signupPage.deleteAccount();
    await expect(signupPage.accountDeletedHeader()).toContainText(authMessages.accountDeleted);
  });

  test("user cannot sign up with existing email", async ({ page }) => {
    const data = generateSignupData();
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await expect(signupPage.newUserSignupHeader()).toBeVisible();

    await signupPage.startSignup(data);
    await recoverFromVignette(page, { fallbackPath: "/login" });
    await expect(signupPage.accountInfoHeader()).toBeVisible();
    await expect(signupPage.emailAlreadyExistsMessage()).toHaveCount(0);

    await signupPage.fillSignUpForm(data);
    await signupPage.createAccount();
    await recoverFromVignette(page, {
      expectedUrlPart: "account_created",
      fallbackPath: "/account_created",
    });
    await expect(signupPage.accountCreatedHeader()).toContainText(authMessages.accountCreated);

    await signupPage.continueAfterAccountCreated();
    await expect(signupPage.loggedInAs(data.firstName)).toBeVisible();
    await signupPage.logoutLink().click();
    await expect(page).toHaveURL(/.*login.*/);

    await signupPage.navigate();
    await expect(signupPage.newUserSignupHeader()).toBeVisible();

    await signupPage.startSignup(data);
    await recoverFromVignette(page, { fallbackPath: "/login" });
    await expect(signupPage.emailAlreadyExistsMessage()).toBeVisible();
  });

  test("signup start is blocked when name is empty", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await expect(signupPage.newUserSignupHeader()).toBeVisible();

    await signupPage.signupEmailInput().fill(signupInvalidInputs.validEmail);
    await signupPage.signupButton().click();

    await expect(signupPage.accountInfoHeader()).toHaveCount(0);
    await expect(signupPage.signupNameInvalidField()).toHaveCount(1);
  });

  test("signup start is blocked when email format is invalid", async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await expect(signupPage.newUserSignupHeader()).toBeVisible();

    await signupPage.signupNameInput().fill(signupInvalidInputs.validName);
    await signupPage.signupEmailInput().fill(signupInvalidInputs.invalidEmailFormat);
    await signupPage.signupButton().click();

    await expect(signupPage.accountInfoHeader()).toHaveCount(0);
    await expect(signupPage.signupEmailInvalidField()).toHaveCount(1);
  });

  test("registration form blocks account creation when required fields are empty", async ({
    page,
  }) => {
    const data = generateSignupData();
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.startSignup(data);
    await expect(signupPage.accountInfoHeader()).toBeVisible();

    await signupPage.createAccount();

    await expect(page).toHaveURL(/.*signup.*/);
    await expect(signupPage.passwordInvalidField()).toHaveCount(1);
  });
});
