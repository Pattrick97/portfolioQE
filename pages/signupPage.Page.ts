import { Locator, Page } from "@playwright/test";
import type { SignupData } from "../data/signUp.data";

export class SignupPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.addLocatorHandler(
      this.page.locator(".fc-consent-root"),
      async () => {
        const consentButton = this.page.getByRole("button", {
          name: /consent|agree|accept|zgoda|akcept/i,
        });
        if (await consentButton.first().isVisible()) {
          await consentButton.first().click();
        }
      },
    );

    await this.page.goto("/login");
  }

  async startSignup(data: SignupData) {
    await this.page
      .locator('input[data-qa="signup-name"]')
      .fill(data.firstName);
    await this.page.locator('input[data-qa="signup-email"]').fill(data.email);
    await this.page.locator('button[data-qa="signup-button"]').click();
  }

  async fillSignUpForm(data: SignupData) {
    if (data.title === "Mr") {
      await this.page.locator("#id_gender1").check();
    } else {
      await this.page.locator("#id_gender2").check();
    }

    await this.page.locator("#password").fill(data.password);
    await this.page.locator("#days").selectOption(data.day);
    await this.page.locator("#months").selectOption(data.month);
    await this.page.locator("#years").selectOption(data.year);

    await this.page.locator("#newsletter").check();
    await this.page.locator("#optin").check();

    await this.page.locator("#first_name").fill(data.firstName);
    await this.page.locator("#last_name").fill(data.lastName);
    await this.page.locator("#company").fill(data.company);
    await this.page.locator("#address1").fill(data.address1);
    await this.page.locator("#address2").fill(data.address2);
    await this.page.locator("#country").selectOption({ label: data.country });
    await this.page.locator("#state").fill(data.state);
    await this.page.locator("#city").fill(data.city);
    await this.page.locator("#zipcode").fill(data.zipcode);
    await this.page.locator("#mobile_number").fill(data.mobileNumber);
  }

  async createAccount() {
    await this.page.locator('button[data-qa="create-account"]').click();
  }

  async continueAfterAccountCreated() {
    await this.page.locator('a[data-qa="continue-button"]').click();
  }

  newUserSignupHeader(): Locator {
    return this.page.locator("h2", { hasText: "New User Signup!" });
  }

  accountInfoHeader(): Locator {
    return this.page.locator("b", { hasText: "Enter Account Information" });
  }

  emailAlreadyExistsMessage(): Locator {
    return this.page.locator("p", { hasText: "Email Address already exist!" });
  }

  accountCreatedHeader(): Locator {
    return this.page.locator(
      'h2[data-qa="account-created"], h2:has-text("Account Created!")',
    );
  }

  continueButton(): Locator {
    return this.page.locator('a[data-qa="continue-button"]');
  }

  loggedInAs(userName: string): Locator {
    return this.page.locator("a", { hasText: `Logged in as ${userName}` });
  }

  logoutLink(): Locator {
    return this.page.locator('a[href="/logout"]');
  }

  async login(email: string, password: string) {
    await this.page.goto("/login");
    await this.page.locator('input[data-qa="login-email"]').fill(email);
    await this.page.locator('input[data-qa="login-password"]').fill(password);
    await this.page.locator('button[data-qa="login-button"]').click();
  }

  async deleteAccount() {
    await this.page.locator('a[href="/delete_account"]').click();
  }

  accountDeletedHeader(): Locator {
    return this.page.locator(
      'h2[data-qa="account-deleted"], h2:has-text("Account Deleted!")',
    );
  }
}
