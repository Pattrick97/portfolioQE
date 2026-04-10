import { Locator, Page } from "@playwright/test";

export const startPage = (page: Page) => {
  const url: string = "https://automationexercise.com/";
  const navbar: Locator = page.locator(".nav.navbar-nav");
};
