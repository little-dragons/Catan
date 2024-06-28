export type User = {
    type: 'guest' | 'member'
    name: string
}
export type UserType = User['type']

export function validUsername(name: string) {
    if (name.length > 20)
        return 'name too long'

    if (name.match(/^[A-Za-z0-9\-\_]+$/) == null)
        return 'invalid tokens'

    return true
}
