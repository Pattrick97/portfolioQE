import { expect, test } from "@playwright/test";
import { ProductsPage } from "../pages/productsPage.Page";
import { CartPage } from "../pages/cartPage.Page";
import { SignupPage } from "../pages/signupPage.Page";
import { generateSignupData, SignupData } from "../data/signUp.data";

test.describe("Cart", () => {
  let accountData: SignupData;

  test.beforeAll(async ({ browser }) => {
    accountData = generateSignupData();
    const page = await browser.newPage();
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.startSignup(accountData);
    await expect(signupPage.accountInfoHeader()).toBeVisible();
    await signupPage.fillSignUpForm(accountData);
    await signupPage.createAccount();
    await expect(signupPage.accountCreatedHeader()).toContainText(
      "Account Created!",
    );
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    const signupPage = new SignupPage(page);

    await signupPage.navigate();
    await signupPage.login(accountData.email, accountData.password);
    await page.goto("/delete_account");
    await expect(signupPage.accountDeletedHeader()).toContainText(
      "Account Deleted!",
    );
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.login(accountData.email, accountData.password);
    await expect(signupPage.loggedInAs(accountData.firstName)).toBeVisible();
  });

  test("user can add a random product to cart and proceed to checkout", async ({
    page,
  }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.navigate();
    await expect(page).toHaveURL(/.*products.*/);
    const productName = await productsPage.addRandomProductToCart();
    await expect(productsPage.continueShoppingButton()).toBeVisible();
    await productsPage.continueShoppingButton().click();

    await cartPage.navigate();
    await expect(page).toHaveURL(/.*view_cart.*/);
    await expect(cartPage.cartRows()).toHaveCount(1);
    await expect(cartPage.cartProductName(productName)).toBeVisible();

    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout.*/);
  });
});
