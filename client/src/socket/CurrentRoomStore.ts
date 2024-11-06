import { defineStore } from "pinia"
import { type RedactedRoom, type RedactedGameState, RoomType, type GameAction } from "shared"
import { ref, computed } from "vue"
import { useCurrentUserStore, UserStatus } from "./CurrentUserStore"
import { socket } from "./Socket"
import router from "@/misc/Router"
import { PopupSeverity, usePopups } from "@/popup/Popup"


export enum RoomOPResult {
    Success,
    NotLoggedIn,
    ServerRejected,
    RoomInvalid,
    NameInvalid,
    AlreadyInRoom,
    NotInRoom,
    NotOwner
}

export const useCurrentRoomStore = defineStore('room', () => {
    const info = ref<undefined | RedactedRoom>(undefined)
    const user = useCurrentUserStore()

    async function tryJoin(id: string) {
        if (user.info.status != UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn
        if (info.value != undefined)
            return RoomOPResult.AlreadyInRoom

        const result = await socket.emitWithAck('join', id)
        if (result == 'invalid room id')
            return RoomOPResult.RoomInvalid
        if (result == 'invalid socket state')
            return RoomOPResult.ServerRejected

        info.value = result
        return RoomOPResult.Success
    }
    async function tryCreate(name: string) {
        if (user.info.status != UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn
        if (info.value != undefined)
            return RoomOPResult.AlreadyInRoom

        const result = await socket.emitWithAck('createAndJoin', name)
        if (result == 'room name in use')
            return RoomOPResult.NameInvalid
        if (result == 'invalid socket state')
            return RoomOPResult.ServerRejected

        info.value = result
        return RoomOPResult.Success
    }
    async function tryLeave() {
        if (info.value == undefined)
            return RoomOPResult.NotInRoom

        const result = await socket.emitWithAck('leave')
        if (result == 'invalid socket state')
            return RoomOPResult.ServerRejected

        info.value = undefined

        if (router.currentRoute.value.name == 'room') {
            router.push('/')
            const popups = usePopups()
            popups.insert({
                title: 'Automatic redirect',
                message: 'You have been redirected out of the room page, because you left the room.',
                autoCloses: true,
                severity: PopupSeverity.Info
            })
        }

        return RoomOPResult.Success
    }
    async function tryStart() {
        if (user.info.status != UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        if (user.info.user.name != info.value?.owner.name)
            return RoomOPResult.NotOwner

        const result = await socket.emitWithAck('startGame')

        if (result == 'not the owner')
            return RoomOPResult.NotOwner

        if (result == 'invalid socket state')
            return RoomOPResult.ServerRejected

        const _assert: true = result
        return RoomOPResult.Success
    }

    const canJoin = computed(() => user.info.status == UserStatus.LoggedIn && info.value == undefined)
    const isOwner = computed(() => user.info.status == UserStatus.LoggedIn ? info.value?.owner == user.info.user : false)

    socket.on('settingsChange', set => {
        if (info.value == undefined)
            return

        info.value.settings = set
    })
    
    socket.on('gameStarted', async () => {
        const result = await socket.emitWithAck('fullGameRoom')
        if (result == 'invalid socket state')
            return

        info.value = result
    })

    socket.on('userChange', newUsers => {
        if (info.value == undefined)
            return

        info.value.users = newUsers
    })

    socket.on('gameEvent', tryFetchState)

    async function tryFetchState() {
        // if this function should be publicly accessible, it should return proper errors
        if (info.value?.type != RoomType.InGame)
            return

        const result = await socket.emitWithAck('gameState')
        if (result == 'invalid socket state')
            return

        info.value.state = result
    }

    async function trySendAction(action: GameAction) {
        const response = await socket.emitWithAck('gameAction', action)
        if (response == true)
            return true
    
        const popups = usePopups()
        popups.insert({ 
            title: 'Invalid action',
            message: `Game action did not complete correctly: \'${response}\'`,
            severity: PopupSeverity.Warning,
            autoCloses: false,
        })
        return false
    }

    return { info, tryJoin, tryCreate, tryLeave, tryStart, canJoin, isOwner, trySendAction }
})
