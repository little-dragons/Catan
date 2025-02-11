import { defineStore } from "pinia"
import { type RedactedRoom, type RedactedGameState, RoomType, type GameActionInput, type PossiblyRedactedGameActionInfo } from "shared"
import { ref, computed } from "vue"
import { useCurrentUserStore, UserStatus } from "./CurrentUserStore"
import { socket } from "./Socket"
import router from "@/misc/Router"
import { PopupSeverity, usePopups } from "@/popup/Popup"
import type { Settings } from "shared/logic/Settings"


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
    const isOwner = computed(() => user.info.status == UserStatus.LoggedIn ? info.value?.owner.name == user.info.user.name : false)


    async function tryChangeSetting<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
        if (user.info.status != UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        if (user.info.user.name != info.value?.owner.name)
            return RoomOPResult.NotOwner

        const res = await socket.emitWithAck('changeSettings', key, value)
        if (res == 'room is ingame')
            return RoomOPResult.RoomInvalid

        if (res == 'not the owner')
            return RoomOPResult.NotOwner

        if (res == 'invalid socket state')
            return RoomOPResult.ServerRejected
        
        const _assert: true = res
        return RoomOPResult.Success
    }
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

    const actions = ref<PossiblyRedactedGameActionInfo[]>([])

    socket.on('gameEvent', (newState, actionInfo) => {
        if (info.value?.type != RoomType.InGame) {
            const popups = usePopups()
            popups.insert({ 
                title: 'Received event',
                message: 'Received a game event, but the client is not ingame',
                severity: PopupSeverity.Warning,
                autoCloses: false,
            })
            return
        }

        info.value.state = newState

        actions.value.push(actionInfo)
    })

    async function trySendAction(action: GameActionInput) {
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

    socket.on('gameOver', history => {
        if (info.value?.type != RoomType.InGame)
            return

        info.value = {
            ...info.value,
            type: RoomType.PostGame,
            history,
        }
    })

    return { info, tryJoin, tryCreate, tryLeave, tryStart, canJoin, isOwner, tryChangeSetting, trySendAction, actions }
})
