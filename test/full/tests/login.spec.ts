import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})


test('can login as guest', async ({ page }) => {
    const guestName = (Math.random() + 1).toString(36).substring(7)
    await page.getByText('Login', { exact: true }).click()
    await page.getByLabel('Guest name: ').fill(guestName)
    await page.getByText('Guest login', { exact: true }).click()
    
    expect(page.getByText(guestName)).toBeDefined()
})