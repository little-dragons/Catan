import { expect, test } from '@playwright/test'
import { modal, noModal } from './Common'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})


test('can login as guest', async ({ page }) => {
    const guestName = (Math.random() + 1).toString(36).substring(7)
    await page.getByTitle('Login').click()
    await modal(page)
    await page.getByLabel('Guest Name').fill(guestName)
    await expect(page.getByTitle('Guest Login')).toBeEnabled()
    await page.getByTitle('Guest Login').click()
    await noModal(page)
    await expect(page.getByText(guestName)).toHaveCount(1)
})
