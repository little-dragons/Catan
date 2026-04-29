import { defineStore } from "pinia"
import { type RedactedRoom, RoomType, type GameActionInput, type PossiblyRedactedGameActionInfo, generateStateFromScenario, redactGameStateFor } from "catan-shared"
import { ref, computed } from "vue"
import { useCurrentUserStore, UserStatus } from "./CurrentUserStore"
import { socket } from "./Socket"
import router from "@/misc/Router"
import { PopupSeverity, usePopups } from "@/popup/Popup"
import type { FullGameState, LobbyRoom, PostGameRoom, RedactedGameRoom, Settings } from "catan-shared"


export enum RoomOPResult {
    Success,
    NotLoggedIn,
    ServerRejected,
    RoomInvalid,
    NameInvalid,
    AlreadyInRoom,
    NotInRoom,
    RoomFull,
    NotOwner
}

export enum RoomLocation {
    Online,
    Offline
}

export type OfflineRoom = {
    type: RoomLocation.Offline,
    room: Omit<LobbyRoom, 'id' | 'name' | 'owner'>
        | Omit<RedactedGameRoom, 'id' | 'name' | 'owner'> & { fullState: FullGameState }
        | Omit<PostGameRoom, 'id' | 'name' | 'owner'> 
}
export type OnlineRoom = {
    type: RoomLocation.Online,
    room: RedactedRoom
}

export const useCurrentRoomStore = defineStore('room', () => {
    const info = ref<undefined | OfflineRoom | OnlineRoom>(undefined)
    const user = useCurrentUserStore()

    async function tryJoin(id: string) {
        if (info.value != undefined)
            return RoomOPResult.AlreadyInRoom
        if (user.info.status != UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        const result = await socket.emitWithAck('join', id)
        if (result == 'invalid room id')
            return RoomOPResult.RoomInvalid
        if (result == 'invalid socket state')
            return RoomOPResult.ServerRejected
        if (result == 'game full')
            return RoomOPResult.RoomFull

        info.value = { type: RoomLocation.Online, room: result }
        return RoomOPResult.Success
    }
    async function tryCreateOnline(name: string) {
        if (info.value != undefined)
            return RoomOPResult.AlreadyInRoom
        if (user.info.status != UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        const result = await socket.emitWithAck('createAndJoin', name)
        if (result == 'room name in use')
            return RoomOPResult.NameInvalid
        if (result == 'invalid socket state')
            return RoomOPResult.ServerRejected

        info.value = { type: RoomLocation.Online, room: result }
        return RoomOPResult.Success
    }
    async function tryLeave() {
        // TODO offline
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
        // TODO offline
        if (info.value == undefined)
            return RoomOPResult.NotInRoom

        if (info.value.type == RoomLocation.Offline) {
            const r = info.value.room
            if (r.type != RoomType.Lobby) {
                return RoomOPResult.RoomInvalid
            }

            const fs = generateStateFromScenario(r.scenario, r.participants.map(x => x.color), r.participants[0].color, r.settings.seed)
            if (fs == undefined) {
                const popups = usePopups()
                popups.insert({ autoCloses: false, message: "The scenario could not be generated", severity: PopupSeverity.Warning, title: "Start failed"})
                return RoomOPResult.ServerRejected
            }

            info.value.room = {
                type: RoomType.InGame,
                participants: r.participants,
                scenario: r.scenario,
                settings: r.settings,
                fullState: fs,
                state: redactGameStateFor(fs, r.participants[0].color)
            }
            return RoomOPResult.Success
            
        }

        if (user.info.status != UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        if (user.info.user.name != info.value.room.owner.name)
            return RoomOPResult.NotOwner

        const result = await socket.emitWithAck('startGame')

        if (result == 'not the owner')
            return RoomOPResult.NotOwner

        if (result == 'invalid socket state' || result == 'generation error') {
            console.log(result)
            return RoomOPResult.ServerRejected
        }

        const _assert: true = result
        return RoomOPResult.Success
    }

    const canJoin = computed(() => user.info.status == UserStatus.LoggedIn && info.value == undefined)
    const isOwner = computed(() => info.value?.type == RoomLocation.Offline || 
                                   (user.info.status == UserStatus.LoggedIn 
                                        ? info.value?.room.owner.name == user.info.user.name 
                                        : false)
                            )


    async function tryChangeSetting<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
        if (info.value == undefined)
            return RoomOPResult.RoomInvalid

        if (info.value.type == RoomLocation.Offline) {
            info.value.room.settings[key] = value
            return RoomOPResult.Success
        }

        if (user.info.status != UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        if (user.info.user.name != info.value.room.owner.name)
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
        // TODO offline
        if (info.value == undefined)
            return

        info.value.room.settings = set
    })
    
    socket.on('gameStarted', async () => {
        // TODO offline
        const result = await socket.emitWithAck('fullGameRoom')
        if (result == 'invalid socket state')
            return

        info.value = { type: RoomLocation.Online, room: result }
    })

    socket.on('participantChange', newUsers => {
        // TODO offline
        if (info.value == undefined)
            return

        info.value.room.participants = newUsers
    })

    const actions = ref<PossiblyRedactedGameActionInfo[]>([])

    socket.on('gameEvent', (newState, actionInfo) => {
        if (info.value == undefined || info.value.type != RoomLocation.Online || info.value.room.type != RoomType.InGame) {
            const popups = usePopups()
            popups.insert({ 
                title: 'Received event',
                message: 'Received a game event, but the client is not ingame',
                severity: PopupSeverity.Warning,
                autoCloses: false,
            })
            return
        }

        info.value.room.state = newState

        actions.value.push(actionInfo)
    })

    async function trySendAction(action: GameActionInput) {
        // TODO offline
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
        // TODO offline
        if (info.value?.type != RoomLocation.Online || info.value?.room.type != RoomType.InGame)
            return

        info.value = {
            type: RoomLocation.Online,
            room: {
                ...info.value.room,
                type: RoomType.PostGame,
                history,
            }
        }
    })

    async function tryAddBot() {
        // TODO offline
        const result = await socket.emitWithAck('addBot')
        if (result == 'invalid socket state')
            return RoomOPResult.NotInRoom
        if (result == 'not the owner')
            return RoomOPResult.NotOwner
        if (result == 'room full')
            return RoomOPResult.RoomFull
        
        const _assert: true = result
        return RoomOPResult.Success
    }

    return { info, tryJoin, tryCreateOnline, tryLeave, tryStart, canJoin, isOwner, tryChangeSetting, trySendAction, actions, tryAddBot }
})
