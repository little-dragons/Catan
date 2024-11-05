export enum UserType {
    Guest,
    Member,
}

export type User = {
    type: UserType
    name: string
}

export function validUsername(name: string) {
    if (name.length > 20)
        return 'name too long'

    if (name.match(/^[A-Za-z0-9\-\_]+$/) == null)
        return 'invalid tokens'

    return true
}
