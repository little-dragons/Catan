import { expect, type Page } from "@playwright/test";

export async function noModal(page: Page): Promise<void> {
    await expect(page.locator('dialog[open]')).toHaveCount(0)
}

export async function modal(page: Page): Promise<void> {
    await expect(page.locator('dialog[open]')).toHaveCount(1)
}