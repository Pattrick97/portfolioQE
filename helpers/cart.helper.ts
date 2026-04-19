import { Page, expect } from "@playwright/test";
import { CartPage } from "../pages/cartPage.Page";
import { recoverFromVignette } from "./vignette.helper";

export async function clearCart(page: Page): Promise<void> {
  const cartPage = new CartPage(page);
  await cartPage.navigate();
  await recoverFromVignette(page, {
    expectedUrlPart: "view_cart",
    fallbackPath: "/view_cart",
  });

  while ((await cartPage.cartDeleteButtons().count()) > 0) {
    const currentCount = await cartPage.cartDeleteButtons().count();
    await cartPage.removeFirstItemFromCart();
    await expect(cartPage.cartDeleteButtons()).toHaveCount(currentCount - 1);
  }
}
