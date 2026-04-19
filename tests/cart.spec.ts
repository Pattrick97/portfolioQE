import { expect, test } from "../fixtures/auth-fixtures";
import { ProductsPage } from "../pages/productsPage.Page";
import { CartPage } from "../pages/cartPage.Page";
import { guestCartCategoryFilter, cartStaticData, cartMessages } from "../data/cart.data";
import { loginAs } from "../helpers/auth.helper";
import { clearCart } from "../helpers/cart.helper";
import {
  assertOrderNotPlacedOnPayment,
  goToPaymentFromCheckout,
  placeOrderWithValidPayment,
  prepareCheckoutWithSingleProduct,
} from "../helpers/cart-flow.helper";

test.describe("Cart as guest", () => {
  test.describe.configure({ retries: 2 });

  test("guest user is prompted to login when proceeding to checkout", async ({ page }) => {
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

  test("guest user can filter by category and brand and add products to cart", async ({ page }) => {
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
  test.beforeEach(async ({ page, registeredUser }) => {
    await loginAs(page, registeredUser);
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

  test("user can add a random product to cart and proceed to checkout", async ({ page }) => {
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

  test("user can complete checkout and place order @smoke", async ({ page, registeredUser }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await placeOrderWithValidPayment(page, productsPage, cartPage, registeredUser.firstName);

    await expect(cartPage.orderPlacedHeader()).toContainText(cartMessages.orderPlaced);
  });

  test("user cannot place order with empty payment fields", async ({ page }) => {
    const cartPage = new CartPage(page);
    const productsPage = new ProductsPage(page);

    await prepareCheckoutWithSingleProduct(page, productsPage, cartPage);
    await goToPaymentFromCheckout(page, cartPage);

    await cartPage.payAndConfirmOrderButton().click();
    await assertOrderNotPlacedOnPayment(page, cartPage);
  });

  test("user cannot proceed to checkout with empty cart", async ({ page }) => {
    const cartPage = new CartPage(page);

    await cartPage.navigate();
    await expect(cartPage.cartRows()).toHaveCount(0);

    await expect(cartPage.checkoutButton()).toHaveCount(0);
    await expect(cartPage.placeOrderButton()).toHaveCount(0);
  });

  test("user cannot place order from direct payment URL with empty cart", async ({ page }) => {
    const cartPage = new CartPage(page);

    await page.goto("/payment");
    await expect(page).toHaveURL(/.*payment.*/);

    await cartPage.payAndConfirmOrderButton().click();

    await expect(page).toHaveURL(/.*payment.*/);
    await expect(cartPage.orderPlacedHeader()).toHaveCount(0);
  });

  test("user cannot place order with only card number filled", async ({ page }) => {
    const cartPage = new CartPage(page);
    const productsPage = new ProductsPage(page);

    await prepareCheckoutWithSingleProduct(page, productsPage, cartPage);
    await goToPaymentFromCheckout(page, cartPage);

    await cartPage.cardNumberInput().fill(cartStaticData.payment.cardNumber);
    await cartPage.payAndConfirmOrderButton().click();
    await assertOrderNotPlacedOnPayment(page, cartPage);
  });
});
