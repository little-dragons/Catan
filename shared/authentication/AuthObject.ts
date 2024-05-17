export type GuestLogin = {
    type: 'guest'
    name: string
}

export type MemberLogin = {
    type: 'member'
    name: string
    passwordHash: never
}