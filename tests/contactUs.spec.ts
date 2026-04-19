import { expect, test } from "../fixtures/test-fixtures";
import {
  generateContactUsData,
  contactStaticData,
  contactMessages,
} from "../data/contact.data";
import { ContactUsPage } from "../pages/contactUsPage.Page";
import { recoverFromVignette } from "../helpers/vignette.helper";

test.describe("Contact Us", () => {
  test.describe.configure({ retries: 2 });

  test("guest user can submit contact us form", async ({ page }) => {
    const contactUsPage = new ContactUsPage(page);
    const contactData = generateContactUsData();

    await contactUsPage.navigate();
    await expect(contactUsPage.getInTouchHeader()).toBeVisible();

    await contactUsPage.fillForm(contactData);
    await contactUsPage.uploadFile(contactStaticData.uploadFilePath);
    await contactUsPage.submitForm();

    await expect(contactUsPage.successAlert()).toContainText(
      contactMessages.contactSuccess,
    );

    await contactUsPage.homeButton().click();
    await recoverFromVignette(page, {
      expectedUrlPart: "automationexercise.com/",
      fallbackPath: "/",
    });
    await expect(page).toHaveURL(/https:\/\/automationexercise\.com\/?$/);
    await expect.soft(contactUsPage.homeNavLink()).toBeVisible();
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
      contactMessages.contactSuccess,
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
    await contactUsPage.emailInput().fill(contactStaticData.invalidEmail);
    await contactUsPage.subjectInput().fill(contactData.subject);
    await contactUsPage.messageInput().fill(contactData.message);
    await contactUsPage.submitForm();

    await expect(contactUsPage.successAlert()).toHaveText(/^\s*$/);
    await expect(page).toHaveURL(/.*contact_us.*/);
  });

  test("user can navigate to contact us page via navbar", async ({ page }) => {
    const contactUsPage = new ContactUsPage(page);

    await contactUsPage.navigateViaNavbar();

    await expect(page).toHaveURL(/.*contact_us.*/);
    await expect(contactUsPage.getInTouchHeader()).toBeVisible();
  });
});
