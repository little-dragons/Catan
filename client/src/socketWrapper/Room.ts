import router from "@/misc/Router"
import type { RedactedRoom, RoomId } from "shared"
import { computed, readonly, ref } from "vue"
import { lobbySocket, roomSocket } from "./Socket"
import { currentAuthUser } from "./Login"

export const currentRoomBacking = ref<undefined | RedactedRoom>(undefined)

export const currentRoom = readonly(currentRoomBacking)
export const currentLobbyRoom = computed(() => {
    if (currentRoom.value?.type == 'lobby')
        return currentRoom.value
    else
        return undefined
})
export const currentGameRoom = computed(() => {
    if (currentRoom.value?.type == 'ingame')
        return currentRoom.value
    else
        return undefined
})
export const canJoinNewRoom = computed(() => currentAuthUser.value != undefined && currentRoom.value == undefined)



export async function createRoomAndRedirect(name: string) {
    if (!canJoinNewRoom.value) {
        console.warn('The user does not meet the requirements to join a room.')
        return
    }

    const res = await roomSocket.emitWithAck('createAndJoin', name, currentAuthUser.value!.authToken)
    if (res == 'room name in use' || res == 'invalid token') {
        return res
    }

    currentRoomBacking.value = res
    router.push({ name: 'room' })
    return res
}

export async function joinRoomAndRedirect(roomId: RoomId) {
    if (currentRoomBacking.value?.id == roomId)
        router.push({ name: 'room' })

    if (!canJoinNewRoom.value) {
        console.warn('The user does not meet the requirements to join a room.')
        return
    }

    const res = await roomSocket.emitWithAck('join', roomId, currentAuthUser.value!.authToken)
    if (res == 'invalid token' || res == 'no such room id')
        return res

    currentRoomBacking.value = res
    router.push({ name: 'room' })
    return res
}

export async function leaveRoomAndRedirect() {
    if (currentRoomBacking.value == undefined) {
        console.log('Tried to leave room, but the user is in no room.')
        return
    }
    if (currentAuthUser.value == undefined) {
        console.error('The user is in a room which they tried to leave, but the user is not logged in???')
        return
    }

    const res = await roomSocket.emitWithAck('leave', currentRoomBacking.value.id, currentAuthUser.value.authToken)
    if (res == true)
        currentRoomBacking.value = undefined

    router.push({ name: 'home' })
    return res
}

export async function startRoom() {
    if (currentRoomBacking.value == undefined) {
        console.warn('Tried to start room, but the user is in no room.')
        return
    }
    if (currentAuthUser.value == undefined) {
        console.error('The user is in a room which they tried to start, but the user is not logged in???')
        return
    }
    if (currentRoomBacking.value.owner.name != currentAuthUser.value.name) {
        console.warn('The room cannot be started because the current user is not the owner')
        return
    }

    const res = await lobbySocket.emitWithAck('startGame', currentRoomBacking.value.id, currentAuthUser.value.authToken)

    if (res == 'invalid token') {
        console.warn('Starting room request was rejected because of an invalid token?')
        return
    }
    if (res == 'no such room id') {
        console.warn('Starting room request was rejected because of an invalid room id?')
        return
    }
    if (res == 'not the owner') {
        console.warn('The starting request was rejected, because the server does not think, the user is the owner, but the local state thinks so.')
        return
    }
    return res
}