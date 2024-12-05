import { Page, expect } from "@playwright/test";

export async function noModal(page: Page): Promise<void> {
    await expect(page.getByTestId('modal')).toHaveCount(0)
}

export async function modal(page: Page): Promise<void> {
    await expect(page.getByTestId('modal')).toHaveCount(1)
}