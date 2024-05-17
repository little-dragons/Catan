import { AuthId } from "./AuthId"

export type User = {
    isGuest: boolean
    name: string
}

export type UserWithAuth = User & { authId: AuthId }