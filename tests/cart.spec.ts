import { Page } from "@playwright/test";
import { expect, test } from "../fixtures/test-fixtures";
import { ProductsPage } from "../pages/productsPage.Page";
import { CartPage } from "../pages/cartPage.Page";
import { SignupPage } from "../pages/signupPage.Page";
import { generateSignupData, SignupData } from "../data/signUp.data";
import { guestCartCategoryFilter } from "../data/productFilters.data";
import { testCheckoutData, testMessages } from "../data/testConstants.data";
import { recoverFromVignette } from "../helpers/vignette.helper";

async function clearCart(page: Page) {
  const cartPage = new CartPage(page);
  await cartPage.navigate();

  while ((await cartPage.cartDeleteButtons().count()) > 0) {
    const currentCount = await cartPage.cartDeleteButtons().count();
    await cartPage.removeFirstItemFromCart();
    await expect(cartPage.cartDeleteButtons()).toHaveCount(currentCount - 1);
  }
}

test.describe("Cart as guest", () => {
  test.describe.configure({ retries: 2 });

  test("guest user is prompted to login when proceeding to checkout", async ({
    page,
  }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.navigate();
    await expect(page).toHaveURL(/.*products.*/);

    await productsPage.addProductToCartByIndex(0);
    await expect(productsPage.continueShoppingButton()).toBeVisible();
    await productsPage.closeAddToCartModal();

    await cartPage.navigate();
    await cartPage.proceedToCheckout();

    await Promise.race([
      expect(cartPage.checkoutModal()).toBeVisible(),
      expect(page).toHaveURL(/.*login.*/),
    ]);

    if (await cartPage.checkoutModal().isVisible()) {
      await expect(cartPage.registerLoginLink()).toBeVisible();
    } else {
      await expect(page).toHaveURL(/.*login.*/);
    }
  });

  test("guest user can filter by category and brand and add products to cart", async ({
    page,
  }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.navigate();
    await expect(page).toHaveURL(/.*products.*/);

    await productsPage.selectCategory(
      guestCartCategoryFilter.mainCategory,
      guestCartCategoryFilter.subCategory,
    );
    await expect(page).toHaveURL(/.*category_products.*/);
    await expect(productsPage.productsHeader()).toContainText(
      new RegExp(
        `${guestCartCategoryFilter.mainCategory}|${guestCartCategoryFilter.subCategory}`,
        "i",
      ),
    );
    await expect(productsPage.productCards().first()).toBeVisible();

    await productsPage.addProductToCartByIndex(0);
    await expect(productsPage.continueShoppingButton()).toBeVisible();
    await productsPage.closeAddToCartModal();

    await productsPage.selectBrand(guestCartCategoryFilter.brand);
    await expect(page).toHaveURL(/.*brand_products.*/);
    await expect(productsPage.productsHeader()).toContainText(/Brand/i);
    await expect(productsPage.productsHeader()).toContainText(
      new RegExp(guestCartCategoryFilter.brand, "i"),
    );
    await expect(productsPage.productCards().first()).toBeVisible();

    await productsPage.addProductToCartByIndex(0);
    await expect(productsPage.continueShoppingButton()).toBeVisible();
    await productsPage.closeAddToCartModal();

    await cartPage.navigate();
    await expect(cartPage.cartRows().first()).toBeVisible();
  });
});

test.describe("Cart as logged user", () => {
  test.describe.configure({ mode: "serial" });

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
      testMessages.accountCreated,
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
      testMessages.accountDeleted,
    );
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.navigate();
    await signupPage.login(accountData.email, accountData.password);
    await expect(signupPage.loggedInAs(accountData.firstName)).toBeVisible();

    await clearCart(page);
  });

  test("user can remove product from cart", async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.navigate();
    await expect(page).toHaveURL(/.*products.*/);

    await productsPage.addProductToCartByIndex(0);
    await expect(productsPage.continueShoppingButton()).toBeVisible();
    await productsPage.closeAddToCartModal();

    await cartPage.navigate();
    await expect(cartPage.cartRows()).toHaveCount(1);

    await cartPage.removeFirstItemFromCart();
    await expect(cartPage.cartRows()).toHaveCount(0);
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
    await expect(cartPage.placeOrderButton()).toBeVisible();
  });

  test("user can complete checkout and place order", async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.navigate();
    await expect(page).toHaveURL(/.*products.*/);

    await productsPage.addProductToCartByIndex(0);
    await expect(productsPage.continueShoppingButton()).toBeVisible();
    await productsPage.closeAddToCartModal();

    await cartPage.navigate();
    await expect(cartPage.cartRows()).toHaveCount(1);

    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout.*/);

    await cartPage.orderComment().fill(testCheckoutData.orderComment);
    await cartPage.placeOrderButton().click();

    await recoverFromVignette(page, {
      expectedUrlPart: "payment",
      fallbackPath: "/payment",
    });

    await expect(page).toHaveURL(/.*payment.*/);

    await expect.soft(cartPage.nameOnCardInput()).toBeVisible();
    await expect.soft(cartPage.cardNumberInput()).toBeVisible();
    await expect.soft(cartPage.cvcInput()).toBeVisible();
    await expect.soft(cartPage.expiryMonthInput()).toBeVisible();
    await expect.soft(cartPage.expiryYearInput()).toBeVisible();

    await cartPage.nameOnCardInput().fill(accountData.firstName);
    await cartPage.cardNumberInput().fill(testCheckoutData.payment.cardNumber);
    await cartPage.cvcInput().fill(testCheckoutData.payment.cvc);
    await cartPage
      .expiryMonthInput()
      .fill(testCheckoutData.payment.expiryMonth);
    await cartPage.expiryYearInput().fill(testCheckoutData.payment.expiryYear);
    await cartPage.payAndConfirmOrderButton().click();

    await expect(cartPage.orderPlacedHeader()).toContainText(
      testMessages.orderPlaced,
    );
  });
});
