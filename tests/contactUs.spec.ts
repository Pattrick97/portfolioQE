import { expect, test } from "../fixtures/test-fixtures";
import { generateContactUsData } from "../data/contactUs.data";
import { ContactUsPage } from "../pages/contactUsPage.Page";
import { testContactUsData, testMessages } from "../data/testConstants.data";

test.describe("Contact Us", () => {
  test("guest user can submit contact us form", async ({ page }) => {
    const contactUsPage = new ContactUsPage(page);
    const contactData = generateContactUsData();

    await contactUsPage.navigate();
    await expect(contactUsPage.getInTouchHeader()).toBeVisible();

    await contactUsPage.fillForm(contactData);
    await contactUsPage.uploadFile(testContactUsData.uploadFilePath);
    await contactUsPage.submitForm();

    await expect(contactUsPage.successAlert()).toContainText(
      testMessages.contactSuccess,
    );

    await contactUsPage.homeButton().click();
    if (!/https:\/\/automationexercise\.com\/?$/.test(page.url())) {
      await page.goto("/");
    }
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
      testMessages.contactSuccess,
    );
  });

  test("guest user with invalid email does not get success message in contact us", async ({
    page,
  }) => {
    const contactUsPage = new ContactUsPage(page);
    const contactData = generateContactUsData();

    await contactUsPage.navigate();
    await expect(contactUsPage.getInTouchHeader()).toBeVisible();

    await contactUsPage.nameInput().fill(contactData.name);
    await contactUsPage.emailInput().fill(testContactUsData.invalidEmail);
    await contactUsPage.subjectInput().fill(contactData.subject);
    await contactUsPage.messageInput().fill(contactData.message);
    await contactUsPage.submitForm();

    await expect(contactUsPage.successAlert()).toHaveText(/^\s*$/);
    await expect(page).toHaveURL(/.*contact_us.*/);
  });
});
