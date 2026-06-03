import { expect, test } from '@playwright/test'
import { modal, noModal } from './Common'


test.beforeEach(async ({ page }) => {
    await page.goto('/')
    const guestName = (Math.random() + 1).toString(36).substring(7)
    await page.getByTitle('Login').and(page.locator(':visible')).click()
    await modal(page)
    await expect(page.getByTitle('Guest Login')).toBeDisabled()
    await page.getByLabel('Guest Name').fill(guestName)
    await expect(page.getByTitle('Guest Login')).toBeEnabled()
    await page.getByTitle('Guest Login').click()
    await noModal(page)
    await page.getByRole('link').and(page.getByText('Room List')).click()
    await expect(page).toHaveURL(/\/roomList/)
})


test('can create room', async ({ page }) => {
    const roomName = (Math.random() + 1).toString(36).substring(7)
    await page.getByTitle('Create new room').click()
    await modal(page)
    await expect(page.getByTitle('Create Room')).toBeDisabled()
    await page.getByLabel('Room Name').fill(roomName)
    await expect(page.getByTitle('Create Room')).toBeEnabled()
    await page.getByTitle('Create Room').click()
    await noModal(page)
    await expect(page).toHaveURL(/\/room/)
})
