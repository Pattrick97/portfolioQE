import { Browser, Page, expect } from "@playwright/test";
import { AuthPage } from "../pages/authPage.Page";
import { SignupData, authMessages } from "../data/auth.data";
import { installConsentHandler } from "./consent.helper";
import { recoverFromVignette } from "./vignette.helper";

export async function createAccount(browser: Browser, data: SignupData): Promise<void> {
  const context = await browser.newContext({
    baseURL: "https://automationexercise.com",
  });
  const page = await context.newPage();
  await installConsentHandler(page);
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
  await context.close();
}

export async function deleteAccount(browser: Browser, data: SignupData): Promise<void> {
  const context = await browser.newContext({
    baseURL: "https://automationexercise.com",
  });
  const page = await context.newPage();
  await installConsentHandler(page);
  const authPage = new AuthPage(page);

  await authPage.navigate();
  await authPage.login(data.email, data.password);
  await authPage.deleteAccount();
  await expect(authPage.accountDeletedHeader()).toContainText(authMessages.accountDeleted);
  await context.close();
}

export async function loginAs(page: Page, data: SignupData): Promise<void> {
  const authPage = new AuthPage(page);
  await authPage.navigate();
  await authPage.login(data.email, data.password);
  await recoverFromVignette(page, {
    expectedUrlPart: "automationexercise.com/",
    fallbackPath: "/",
  });
  await expect(authPage.loggedInAs(data.firstName)).toBeVisible();
}
