import { v4 } from "uuid"
import bcrypt from 'bcrypt'


export type PasswordNonce = { value: string }

export function newRandomPasswordNonce(): PasswordNonce {
    return { value: v4() }
}


export function validPassword(password: string) {
    if (password.length < 6)
        return 'password too short'
    if (password.match(/^[A-Za-z0-9!"%^*()=\-\_]+$/)?.[0] == null)
        return 'contains invalid characters'
    return true
}