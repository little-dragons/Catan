import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})


test('can login as guest', async ({ page }) => {
    const guestName = (Math.random() + 1).toString(36).substring(7)
    await page.getByTitle('Login').click()
    await page.getByLabel('Guest Name').fill(guestName)
    await page.getByTitle('Guest Login').click()
    
    expect((await page.getByText(guestName).all()).length > 0).toBeDefined()
})