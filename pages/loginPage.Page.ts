import { Locator, Page } from "@playwright/test";

export const loginPage = (page: Page) => {
  const urlLogin: string = "https://automationexercise.com/login";
  const nameInput = page.locator('input[data-qa="signup-name"]');
  const emailInput = page.locator('input[data-qa="signup-email"]');
  const signupButton = page.locator('button[data-qa="signup-button"]');
  const titleMr = page.locator("#id_gender1");
  const titleMrs = page.locator("#id_gender2");

  const passwordInput = page.locator("#password");

  const daysSelect = page.locator("#days");
  const monthsSelect = page.locator("#months");
  const yearsSelect = page.locator("#years");
  const newsletterCheckbox = page.locator("#newsletter");
  const offersCheckbox = page.locator("#optin");
  const firstName = page.locator("#first_name");
  const lastName = page.locator("#last_name");
  const company = page.locator("#company");
  const address1 = page.locator("#address1");
  const address2 = page.locator("#address2");

  const country = page.locator("#country");

  const state = page.locator("#state");
  const city = page.locator("#city");
  const zipcode = page.locator("#zipcode");
  const mobileNumber = page.locator("#mobile_number");
  const createAccountButton = page.locator('button[data-qa="create-account"]');
  const accountCreatedHeader = page.getByText("Account Created!");
  const continueButton = page.locator('a[data-qa="continue-button"]');
};
