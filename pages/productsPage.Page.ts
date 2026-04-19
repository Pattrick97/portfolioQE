import { Locator, Page } from "@playwright/test";
import { recoverFromVignette } from "../helpers/vignette.helper";

export class ProductsPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.addLocatorHandler(this.page.locator(".fc-consent-root"), async () => {
      const consentButton = this.page.getByRole("button", {
        name: /consent|agree|accept|zgoda|akcept/i,
      });
      if (await consentButton.first().isVisible()) {
        await consentButton.first().click();
      }
    });

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

  async addProductToCartByIndex(index: number): Promise<string> {
    const card = this.productCards().nth(index);
    const productName = await card.locator("p").first().innerText();
    await card.locator("a.add-to-cart").first().click();
    return productName;
  }

  async closeAddToCartModal() {
    await this.continueShoppingButton().click();
  }

  continueShoppingButton(): Locator {
    return this.page.getByRole("button", { name: "Continue Shopping" });
  }

  async selectCategory(mainCategory: string, subCategory: string) {
    const mainCategoryLink = this.page.locator(`a[href='#${mainCategory}']`).first();
    const subCategoryLink = this.page.locator(".panel-body a", { hasText: subCategory }).first();
    const subCategoryHref = await subCategoryLink.getAttribute("href");

    await mainCategoryLink.click();

    if (await subCategoryLink.isVisible()) {
      await subCategoryLink.click();
    }

    await recoverFromVignette(this.page, {
      expectedUrlPart: "category_products",
      fallbackHref: subCategoryHref,
    });
  }

  async selectBrand(brand: string) {
    const brandLink = this.page.locator(".brands-name a", { hasText: brand }).first();
    const brandHref = await brandLink.getAttribute("href");

    await brandLink.click();

    await recoverFromVignette(this.page, {
      expectedUrlPart: "brand_products",
      fallbackHref: brandHref,
    });
  }

  productsHeader(): Locator {
    return this.page.locator(".features_items .title.text-center").first();
  }
}
