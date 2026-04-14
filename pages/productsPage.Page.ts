import { Locator, Page } from "@playwright/test";

export class ProductsPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto("/products");
  }

  productCards(): Locator {
    return this.page.locator(".features_items .product-image-wrapper");
  }

  async addRandomProductToCart(): Promise<string> {
    const cards = this.productCards();
    const count = await cards.count();
    const randomIndex = Math.floor(Math.random() * count);
    const card = cards.nth(randomIndex);

    const productName = await card.locator("p").first().innerText();

    await card.locator("a.add-to-cart").first().click();

    return productName;
  }

  continueShoppingButton(): Locator {
    return this.page.getByRole("button", { name: "Continue Shopping" });
  }

  viewCartLink(): Locator {
    return this.page.locator('a[href="/view_cart"]').first();
  }
}
