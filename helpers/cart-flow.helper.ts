import { expect, Page } from "@playwright/test";
import { CartPage } from "../pages/cartPage.Page";
import { ProductsPage } from "../pages/productsPage.Page";
import { recoverFromVignette } from "./vignette.helper";

export async function prepareCheckoutWithSingleProduct(
  page: Page,
  productsPage: ProductsPage,
  cartPage: CartPage,
): Promise<void> {
  await productsPage.navigate();
  await productsPage.addProductToCartByIndex(0);
  await expect(productsPage.continueShoppingButton()).toBeVisible();
  await productsPage.closeAddToCartModal();

  await cartPage.navigate();
  await cartPage.proceedToCheckout();
  await expect(page).toHaveURL(/.*checkout.*/);
}

export async function goToPaymentFromCheckout(page: Page, cartPage: CartPage): Promise<void> {
  await cartPage.placeOrderButton().click();
  await recoverFromVignette(page, {
    expectedUrlPart: "payment",
    fallbackPath: "/payment",
  });
  await expect(page).toHaveURL(/.*payment.*/);
}

export async function assertOrderNotPlacedOnPayment(page: Page, cartPage: CartPage): Promise<void> {
  await expect(page).toHaveURL(/.*payment.*/);
  await expect(cartPage.orderPlacedHeader()).toHaveCount(0);
}
