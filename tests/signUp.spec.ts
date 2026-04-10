import { expect, test } from "@playwright/test";
import { generateSignupData } from "../data/signUp.data";
import { SignupPage } from "../pages/signupPage.Page";

test("user can sign up", async ({ page }) => {
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
    "Account Created!",
  );
  await expect(signupPage.continueButton()).toBeVisible();
  await expect(signupPage.continueButton()).toBeEnabled();

  await signupPage.continueAfterAccountCreated();
  await expect(signupPage.loggedInAs(data.firstName)).toBeVisible();
  await expect(signupPage.logoutLink()).toBeVisible();
});
