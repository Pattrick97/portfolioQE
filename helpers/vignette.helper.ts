import { Page } from "@playwright/test";

interface VignetteRecoveryOptions {
  expectedUrlPart?: string;
  fallbackPath?: string;
  fallbackHref?: string | null;
}

export async function recoverFromVignette(
  page: Page,
  options: VignetteRecoveryOptions,
) {
  const currentUrl = page.url();
  const hasVignetteHash = currentUrl.includes("#google_vignette");
  const isExpectedRoute = options.expectedUrlPart
    ? currentUrl.includes(options.expectedUrlPart)
    : true;

  if (!hasVignetteHash && isExpectedRoute) {
    return;
  }

  const navigationTarget = options.fallbackHref || options.fallbackPath;
  if (navigationTarget) {
    await page.goto(navigationTarget);
  }
}
