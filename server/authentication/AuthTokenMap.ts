import { AuthToken, GuestLogin, MemberLogin, User, newRandomAuthToken } from "shared"

const map = new Map<AuthToken, User>()

export function addGuest(guest: GuestLogin): AuthToken | undefined {
    const id = newRandomAuthToken()
    map.set(id, { isGuest: true, name: guest.name})
    for (const [otherId, otherUser] of map) {
        if (otherId == id)
            continue
        if (otherUser.name == guest.name)
        {
            map.delete(id)
            return undefined
        }
    }

    return id
}

export function addMember(member: MemberLogin): AuthToken | undefined {
    return undefined
}

export function checkUser(id: AuthToken): boolean {
    return map.get(id) != undefined
}

export function removeUser(id: AuthToken) {
    map.delete(id)
}
