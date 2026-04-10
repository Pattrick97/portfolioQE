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
});
test("user cannot sign up with existing email", async ({ page }) => {
  const data = generateSignupData();
  const signupPage = new SignupPage(page);

  // First sign up successfully using a fresh email.
  await signupPage.navigate();
  await expect(signupPage.newUserSignupHeader()).toBeVisible();

  await signupPage.startSignup(data);
  await expect(signupPage.accountInfoHeader()).toBeVisible();
  await expect(signupPage.emailAlreadyExistsMessage()).toHaveCount(0);

  await signupPage.fillSignUpForm(data);
  await signupPage.createAccount();
  await expect(signupPage.accountCreatedHeader()).toContainText(
    "Account Created!",
  );

  // Log out and return to signup with the same email.
  await page.goto("/logout");
  await expect(page).toHaveURL(/.*login.*/);

  // Try creating an account again with the already used email.
  await page.goto("/login");
  await expect(signupPage.newUserSignupHeader()).toBeVisible();

  await signupPage.startSignup(data);
  await expect(signupPage.emailAlreadyExistsMessage()).toBeVisible();
});
