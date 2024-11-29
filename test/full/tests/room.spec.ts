import { expect, test } from '@playwright/test'


test.beforeEach(async ({ page }) => {
    await page.goto('/')
    const guestName = (Math.random() + 1).toString(36).substring(7)
    await page.getByTitle('Login').click()
    await page.getByLabel('Guest Name').fill(guestName)
    await page.getByTitle('Guest Login').click()
    await page.getByRole('link').and(page.getByText('Room List')).click()
    expect(page.url()).toContain('/roomList')
})


test('can create room', async ({ page }) => {
    const roomName = (Math.random() + 1).toString(36).substring(7)
    await page.getByTitle('Create New Room').click()
    await page.getByLabel('Room Name').fill(roomName)
    await page.getByTitle('Create Room').click()
    expect(page.url()).toContain('/room')
})
