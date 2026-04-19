import { Locator, Page } from "@playwright/test";

export class CartPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto("/view_cart");
  }

  cartRows(): Locator {
    return this.page.locator("#cart_info_table tbody tr");
  }

  cartDeleteButtons(): Locator {
    return this.page.locator("a.cart_quantity_delete");
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

  async removeFirstItemFromCart() {
    await this.cartDeleteButtons().first().click();
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

  nameOnCardInput(): Locator {
    return this.page.locator("input[name='name_on_card']");
  }

  cardNumberInput(): Locator {
    return this.page.locator("input[name='card_number']");
  }

  cvcInput(): Locator {
    return this.page.locator("input[name='cvc']");
  }

  expiryMonthInput(): Locator {
    return this.page.locator("input[name='expiry_month']");
  }

  expiryYearInput(): Locator {
    return this.page.locator("input[name='expiry_year']");
  }

  payAndConfirmOrderButton(): Locator {
    return this.page.locator("button[data-qa='pay-button']");
  }

  orderPlacedHeader(): Locator {
    return this.page.locator(
      "h2[data-qa='order-placed'], h2:has-text('Order Placed!')",
    );
  }
}
