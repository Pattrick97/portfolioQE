import { expect, test } from "@playwright/test";
import { ProductsPage } from "../pages/productsPage.Page";
import { CartPage } from "../pages/cartPage.Page";
import { SignupPage } from "../pages/signupPage.Page";

test("user can add a random product to cart and proceed to checkout", async ({
  page,
}) => {
  const signupPage = new SignupPage(page);
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);

  // Register locator handler for consent popup once for the whole test.
  await signupPage.navigate();

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
  await expect(cartPage.checkoutModal()).toBeVisible();
  await expect(cartPage.registerLoginLink()).toBeVisible();
});
