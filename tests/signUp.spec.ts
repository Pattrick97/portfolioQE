import { expect, test } from "../fixtures/test-fixtures";
import { generateSignupData, authMessages } from "../data/auth.data";
import { SignupPage } from "../pages/signupPage.Page";

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
    await expect(page).toHaveURL(/.*account_created.*/);
    await expect(signupPage.accountCreatedHeader()).toContainText(
      authMessages.accountCreated,
    );

    await signupPage.continueAfterAccountCreated();
    await signupPage.deleteAccount();
    await expect(signupPage.accountDeletedHeader()).toContainText(
      authMessages.accountDeleted,
    );
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
    await expect(signupPage.accountCreatedHeader()).toContainText(
      authMessages.accountCreated,
    );

    await signupPage.continueAfterAccountCreated();
    await expect(signupPage.loggedInAs(data.firstName)).toBeVisible();

    await signupPage.logoutLink().click();
    await expect(page).toHaveURL(/.*login.*/);

    await signupPage.login(data.email, data.password);
    await expect(signupPage.loggedInAs(data.firstName)).toBeVisible();

    await signupPage.deleteAccount();
    await expect(signupPage.accountDeletedHeader()).toContainText(
      authMessages.accountDeleted,
    );
  });

  test("user cannot sign up with existing email", async ({ page }) => {
    const data = generateSignupData();
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await expect(signupPage.newUserSignupHeader()).toBeVisible();

    await signupPage.startSignup(data);
    await expect(signupPage.accountInfoHeader()).toBeVisible();
    await expect(signupPage.emailAlreadyExistsMessage()).toHaveCount(0);

    await signupPage.fillSignUpForm(data);
    await signupPage.createAccount();
    await expect(signupPage.accountCreatedHeader()).toContainText(
      authMessages.accountCreated,
    );

    await page.goto("/logout");
    await expect(page).toHaveURL(/.*login.*/);

    await page.goto("/login");
    await expect(signupPage.newUserSignupHeader()).toBeVisible();

    await signupPage.startSignup(data);
    await expect(signupPage.emailAlreadyExistsMessage()).toBeVisible();
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
