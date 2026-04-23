import { Locator, Page } from "@playwright/test";
import type { ContactUsData } from "../data/contact.data";

export class ContactUsPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto("/contact_us");
  }

  getInTouchHeader(): Locator {
    return this.page.locator("h2.title.text-center", {
      hasText: "Get In Touch",
    });
  }

  nameInput(): Locator {
    return this.page.locator("input[data-qa='name']");
  }

  emailInput(): Locator {
    return this.page.locator("input[data-qa='email']");
  }

  subjectInput(): Locator {
    return this.page.locator("input[data-qa='subject']");
  }

  messageInput(): Locator {
    return this.page.locator("textarea[data-qa='message']");
  }

  uploadFileInput(): Locator {
    return this.page.locator("input[name='upload_file']");
  }

  submitButton(): Locator {
    return this.page.locator("input[data-qa='submit-button']");
  }

  successAlert(): Locator {
    return this.page.locator(".status.alert.alert-success");
  }

  homeButton(): Locator {
    return this.page.locator("a.btn.btn-success");
  }

  homeNavLink(): Locator {
    return this.page.getByRole("link", { name: /Home/i });
  }

  async navigateViaNavbar() {
    await this.page.goto("/");
    await this.page.locator("a[href='/contact_us']").click();
  }

  async fillForm(data: ContactUsData) {
    await this.nameInput().fill(data.name);
    await this.emailInput().fill(data.email);
    await this.subjectInput().fill(data.subject);
    await this.messageInput().fill(data.message);
  }

  async uploadFile(filePath: string) {
    await this.uploadFileInput().setInputFiles(filePath);
  }

  async submitForm() {
    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await this.submitButton().click();
  }
}
