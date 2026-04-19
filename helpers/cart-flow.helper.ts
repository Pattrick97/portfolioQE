import { expect, Page } from "@playwright/test";
import { cartStaticData } from "../data/cart.data";
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

export async function placeOrderWithValidPayment(
  page: Page,
  productsPage: ProductsPage,
  cartPage: CartPage,
  cardholderName: string,
): Promise<void> {
  await prepareCheckoutWithSingleProduct(page, productsPage, cartPage);
  await cartPage.orderComment().fill(cartStaticData.orderComment);
  await goToPaymentFromCheckout(page, cartPage);

  await expect.soft(cartPage.nameOnCardInput()).toBeVisible();
  await expect.soft(cartPage.cardNumberInput()).toBeVisible();
  await expect.soft(cartPage.cvcInput()).toBeVisible();
  await expect.soft(cartPage.expiryMonthInput()).toBeVisible();
  await expect.soft(cartPage.expiryYearInput()).toBeVisible();

  await cartPage.nameOnCardInput().fill(cardholderName);
  await cartPage.cardNumberInput().fill(cartStaticData.payment.cardNumber);
  await cartPage.cvcInput().fill(cartStaticData.payment.cvc);
  await cartPage.expiryMonthInput().fill(cartStaticData.payment.expiryMonth);
  await cartPage.expiryYearInput().fill(cartStaticData.payment.expiryYear);
  await cartPage.payAndConfirmOrderButton().click();
}
