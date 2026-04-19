import { Browser, Page, expect } from "@playwright/test";
import { SignupPage } from "../pages/signupPage.Page";
import { SignupData, authMessages } from "../data/auth.data";
import { recoverFromVignette } from "./vignette.helper";

export async function createAccount(browser: Browser, data: SignupData): Promise<void> {
  const context = await browser.newContext({
    baseURL: "https://automationexercise.com",
  });
  const page = await context.newPage();
  const signupPage = new SignupPage(page);

  await signupPage.navigate();
  await signupPage.startSignup(data);
  await expect(signupPage.accountInfoHeader()).toBeVisible();
  await signupPage.fillSignUpForm(data);
  await signupPage.createAccount();
  await expect(signupPage.accountCreatedHeader()).toContainText(authMessages.accountCreated);
  await context.close();
}

export async function deleteAccount(browser: Browser, data: SignupData): Promise<void> {
  const context = await browser.newContext({
    baseURL: "https://automationexercise.com",
  });
  const page = await context.newPage();
  const signupPage = new SignupPage(page);

  await signupPage.navigate();
  await signupPage.login(data.email, data.password);
  await signupPage.deleteAccount();
  await expect(signupPage.accountDeletedHeader()).toContainText(authMessages.accountDeleted);
  await context.close();
}

export async function loginAs(page: Page, data: SignupData): Promise<void> {
  const signupPage = new SignupPage(page);
  await signupPage.navigate();
  await signupPage.login(data.email, data.password);
  await recoverFromVignette(page, {
    expectedUrlPart: "automationexercise.com/",
    fallbackPath: "/",
  });
  await expect(signupPage.loggedInAs(data.firstName)).toBeVisible();
}
