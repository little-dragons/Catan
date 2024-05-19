import { AuthId } from "./AuthId"

export type User = {
    isGuest: boolean
    name: string
}

export type UserWithAuth = User & { authId: AuthId }

export function validUsername(name: string): boolean {
    return name.match(/^[A-Za-z0-9\-\_]+$/) != null
}