import { AuthToken } from "./AuthToken"

export type User = {
    isGuest: boolean
    name: string
}

export type AuthUser = User & { authToken: AuthToken }

export function validUsername(name: string) {
    if (name.length > 20)
        return 'name too long'

    if (name.match(/^[A-Za-z0-9\-\_]+$/) == null)
        return 'invalid tokens'

    return true
}