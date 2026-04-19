import { Page, expect } from "@playwright/test";
import { CartPage } from "../pages/cartPage.Page";

export async function clearCart(page: Page): Promise<void> {
  const cartPage = new CartPage(page);
  await cartPage.navigate();

  while ((await cartPage.cartDeleteButtons().count()) > 0) {
    const currentCount = await cartPage.cartDeleteButtons().count();
    await cartPage.removeFirstItemFromCart();
    await expect(cartPage.cartDeleteButtons()).toHaveCount(currentCount - 1);
  }
}
