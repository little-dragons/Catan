import { AuthToken } from "./AuthToken"

export type User = {
    isGuest: boolean
    name: string
}

export type AuthUser = User & { authToken: AuthToken }

export function validUsername(name: string): boolean {
    return name.match(/^[A-Za-z0-9\-\_]+$/) != null
}