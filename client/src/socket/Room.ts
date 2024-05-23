import type { AuthToken, Room } from "shared"
import { readonly, ref } from "vue"
import { roomSocket } from "./Socket"
import { currentAuthUser } from "./Login"

export const currentRoomBacking = ref<undefined | Room>(undefined)
export const currentRoom = readonly(currentRoomBacking)

export async function createAndJoinRoom(name: string, authToken: AuthToken) {
    const res = await roomSocket.emitWithAck('createAndJoin', name, authToken)
    if (res == 'room name in use' || res == 'invalid token') {
        return res
    }

    currentRoomBacking.value = res
    return res
}

export async function leaveRoom(authToken: AuthToken) {
    console.error('not implemented')
}
