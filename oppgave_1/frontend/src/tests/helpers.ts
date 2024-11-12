import { Page } from "@playwright/test";

// Hjelpefunskjon skrevet av claude.ai
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");
}

export async function waitForFormReady(page: Page) {
  await page.waitForSelector('[data-testid="form"]');
  await page.waitForTimeout(500);
}
