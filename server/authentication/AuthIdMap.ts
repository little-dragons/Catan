import { AuthId, GuestLogin, MemberLogin, User, newRandomAuthId } from "shared"

const map = new Map<AuthId, User>()

export function addGuest(guest: GuestLogin): AuthId | undefined {
    const id = newRandomAuthId()
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

export function addMember(member: MemberLogin): AuthId | undefined {
    return undefined
}

export function checkUser(id: AuthId): boolean {
    return map.get(id) != undefined
}

export function removeUser(id: AuthId, name: string) {
    if (map.get(id)?.name === name)
        map.delete(id)
}
