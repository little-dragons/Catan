import { expect, test } from '@playwright/test'


test.beforeEach(async ({ page }) => {
    await page.goto('/')
    const guestName = (Math.random() + 1).toString(36).substring(7)
    await page.getByText('Login', { exact: true }).click()
    await page.getByLabel('Guest name: ').fill(guestName)
    await page.getByText('Guest login', { exact: true }).click()
})


test('can create room', async ({ page }) => {
    const roomName = (Math.random() + 1).toString(36).substring(7)
    await page.getByText('Room List', { exact: true }).click()
    await page.getByText('Create Room', { exact: true }).click()
    await page.getByLabel('Room name:', { exact: true }).fill(roomName)
    await page.getByText('Create', { exact: true }).click()
    expect(page.url()).toContain('/room')
})