import { Browser, Page, expect } from "@playwright/test";
import { SignupPage } from "../pages/signupPage.Page";
import { SignupData } from "../data/signUp.data";
import { testMessages } from "../data/testConstants.data";

export async function createAccount(
  browser: Browser,
  data: SignupData,
): Promise<void> {
  const page = await browser.newPage();
  const signupPage = new SignupPage(page);

  await signupPage.navigate();
  await signupPage.startSignup(data);
  await expect(signupPage.accountInfoHeader()).toBeVisible();
  await signupPage.fillSignUpForm(data);
  await signupPage.createAccount();
  await expect(signupPage.accountCreatedHeader()).toContainText(
    testMessages.accountCreated,
  );
  await page.close();
}

export async function deleteAccount(
  browser: Browser,
  data: SignupData,
): Promise<void> {
  const page = await browser.newPage();
  const signupPage = new SignupPage(page);

  await signupPage.navigate();
  await signupPage.login(data.email, data.password);
  await signupPage.deleteAccount();
  await expect(signupPage.accountDeletedHeader()).toContainText(
    testMessages.accountDeleted,
  );
  await page.close();
}

export async function loginAs(page: Page, data: SignupData): Promise<void> {
  const signupPage = new SignupPage(page);
  await signupPage.navigate();
  await signupPage.login(data.email, data.password);
  await expect(signupPage.loggedInAs(data.firstName)).toBeVisible();
}
