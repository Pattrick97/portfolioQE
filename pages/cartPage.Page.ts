import { Locator, Page } from "@playwright/test";

export class CartPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto("/view_cart");
  }

  cartRows(): Locator {
    return this.page.locator("#cart_info_table tbody tr");
  }

  cartProductName(productName: string): Locator {
    return this.page.locator(".cart_description h4 a", {
      hasText: productName,
    });
  }

  checkoutButton(): Locator {
    return this.page.locator("a.btn.btn-default.check_out");
  }

  async proceedToCheckout() {
    await this.checkoutButton().click();
  }

  checkoutModal(): Locator {
    return this.page.locator("#checkoutModal");
  }

  registerLoginLink(): Locator {
    return this.page.locator("#checkoutModal a[href='/login']");
  }

  orderComment(): Locator {
    return this.page.locator("textarea[name='message']");
  }

  placeOrderButton(): Locator {
    return this.page.locator("a.btn.btn-default.check_out", {
      hasText: "Place Order",
    });
  }
}
