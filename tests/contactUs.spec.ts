import path from "path";
import { expect, test } from "@playwright/test";
import { generateContactUsData } from "../data/contactUs.data";
import { ContactUsPage } from "../pages/contactUsPage.Page";

test.describe("Contact Us", () => {
  test("guest user can submit contact us form", async ({ page }) => {
    const contactUsPage = new ContactUsPage(page);
    const contactData = generateContactUsData();

    await contactUsPage.navigate();
    await expect(contactUsPage.getInTouchHeader()).toBeVisible();

    await contactUsPage.fillForm(contactData);
    await contactUsPage.uploadFile(path.resolve("README.md"));
    await contactUsPage.submitForm();

    await expect(contactUsPage.successAlert()).toContainText(
      "Success! Your details have been submitted successfully.",
    );

    await contactUsPage.homeButton().click();
    await expect(page).toHaveURL(/https:\/\/automationexercise\.com\/?$/);
  });

  test("guest user can submit contact us form without file attachment", async ({
    page,
  }) => {
    const contactUsPage = new ContactUsPage(page);
    const contactData = generateContactUsData();

    await contactUsPage.navigate();
    await expect(contactUsPage.getInTouchHeader()).toBeVisible();

    await contactUsPage.fillForm(contactData);
    await contactUsPage.submitForm();

    await expect(contactUsPage.successAlert()).toContainText(
      "Success! Your details have been submitted successfully.",
    );
  });
});
