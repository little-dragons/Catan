import { defineStore } from "pinia"
import { type RedactedRoom, RoomType, type GameActionInput, type PossiblyRedactedGameActionInfo, generateStateFromScenario, redactGameStateFor, defaultScenario, defaultSettings, ParticipantType, Color, BotPersonality, randomUnusedColor, tryDoAction, winners, requireActionFrom, generateBotAction } from "catan-shared"
import { ref, computed, toRaw } from "vue"
import { useCurrentUserStore, UserStatus } from "./CurrentUserStore"
import { socket } from "./Socket"
import router from "@/misc/Router"
import { PopupSeverity, usePopups } from "@/popup/Popup"
import type { FullGameState, GameActionInfo, LobbyRoom, PostGameRoom, RedactedGameRoom, Settings } from "catan-shared"
import { UserType } from "catan-shared"


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

export enum RoomMode {
    Online,
    Offline
}

export type OfflineRoom = {
    mode: RoomMode.Offline,
    data: Omit<LobbyRoom,        'id' | 'name' | 'owner'>
        | Omit<RedactedGameRoom, 'id' | 'name' | 'owner'> & { fullState: FullGameState }
        | Omit<PostGameRoom,     'id' | 'name' | 'owner'> 
}
export type OnlineRoom = {
    mode: RoomMode.Online,
    data: RedactedRoom
}

export const useCurrentRoomStore = defineStore('room', () => {
    const info = ref<undefined | OfflineRoom | OnlineRoom>(undefined)
    const user = useCurrentUserStore()
    const popups = usePopups()

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

        info.value = { mode: RoomMode.Online, data: result }
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

        info.value = { mode: RoomMode.Online, data: result }
        return RoomOPResult.Success
    }

    function tryCreateOffline() {
        if (info.value != undefined)
            return RoomOPResult.AlreadyInRoom

        info.value = {
            mode: RoomMode.Offline,
            data: {
                type: RoomType.Lobby,
                scenario: defaultScenario,
                settings: defaultSettings(),
                participants: [
                    {
                        type: ParticipantType.User,
                        color: randomUnusedColor([])!,
                        user: user.loggedInInfo ?? {
                            name: "OfflineUser",
                            type: UserType.Guest
                        }
                    }
                ]
            }
        }
        return RoomOPResult.Success
    }

    async function tryLeave() {
        if (info.value == undefined)
            return RoomOPResult.NotInRoom

        if (info.value.mode == RoomMode.Offline) {
            info.value = undefined
            return RoomOPResult.Success
        }

        const result = await socket.emitWithAck('leave')
        if (result == 'invalid socket state')
            return RoomOPResult.ServerRejected

        info.value = undefined

        if (router.currentRoute.value.name == 'room') {
            router.push('/')
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
        if (info.value == undefined)
            return RoomOPResult.NotInRoom

        if (info.value.mode == RoomMode.Offline) {
            const r = info.value.data
            if (r.type != RoomType.Lobby) {
                return RoomOPResult.RoomInvalid
            }

            const fs = generateStateFromScenario(r.scenario, r.participants.map(x => x.color), r.participants[0].color, r.settings.seed)
            if (fs == undefined) {
                popups.insert({ autoCloses: false, message: "The scenario could not be generated", severity: PopupSeverity.Warning, title: "Start failed"})
                return RoomOPResult.ServerRejected
            }

            info.value.data = {
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

        if (user.info.user.name != info.value.data.owner.name)
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

    const canJoinOnline = computed(() => user.info.status == UserStatus.LoggedIn && info.value == undefined)
    const isOwner = computed(() => info.value?.mode == RoomMode.Offline || 
                                   (user.info.status == UserStatus.LoggedIn 
                                        ? info.value?.data.owner.name == user.info.user.name 
                                        : false)
                            )


    async function tryChangeSetting<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
        if (info.value == undefined)
            return RoomOPResult.RoomInvalid

        if (info.value.mode == RoomMode.Offline) {
            info.value.data.settings[key] = value
            return RoomOPResult.Success
        }

        if (user.info.status != UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        if (user.info.user.name != info.value.data.owner.name)
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
        if (info.value == undefined || info.value.mode == RoomMode.Offline)
            return

        info.value.data.settings = set
    })
    
    socket.on('gameStarted', async () => {
        if (info.value == undefined || info.value.mode == RoomMode.Offline)
            return
        
        const result = await socket.emitWithAck('fullGameRoom')
        if (result == 'invalid socket state')
            return

        info.value = { mode: RoomMode.Online, data: result }
    })

    socket.on('participantChange', newUsers => {
        if (info.value == undefined || info.value.mode == RoomMode.Offline)
            return

        info.value.data.participants = newUsers
    })

    const actions = ref<PossiblyRedactedGameActionInfo[]>([])

    socket.on('gameEvent', (newState, actionInfo) => {
        if (info.value == undefined || info.value.mode != RoomMode.Online || info.value.data.type != RoomType.InGame) {
            popups.insert({ 
                title: 'Received event',
                message: 'Received a game event, but the client is not ingame',
                severity: PopupSeverity.Warning,
                autoCloses: false,
            })
            return
        }

        info.value.data.state = newState

        actions.value.push(actionInfo)
    })

    async function trySendAction(useraction: GameActionInput) {
        if (info.value == undefined || info.value.data.type != RoomType.InGame)
            return false

        if (info.value.mode == RoomMode.Offline) {
            const selfcolor = info.value.data.state.self.color
            let action = useraction
            let executor = info.value.data.state.self.color
            let state = info.value.data.fullState

            // loop on performing this action, mixed with the following bot actions
            while (true) {
                const result = tryDoAction(state, executor, action)

                if (result == undefined) {
                    popups.insert({
                        autoCloses: false,
                        title: "Invalid action",
                        message: "An invalid action was either sent by the user or generated by a bot and could not be performed.",
                        severity: PopupSeverity.Error
                    })
                    return false
                }

                state = result[0]
                const response = result[1]
                actions.value.push({  type: action.type, input: action, response: response, redacted: false } as PossiblyRedactedGameActionInfo)
                
                info.value.data.fullState = state
                info.value.data.state = redactGameStateFor(state, selfcolor)
                
                const win = winners(state, info.value.data.settings.requiredVictoryPoints)
                if (win.length > 0) {
                    info.value.data = {
                        type: RoomType.PostGame,
                        participants: info.value.data.participants,
                        scenario: info.value.data.scenario,
                        settings: info.value.data.settings,
                        history: {
                            lastState: state
                        }
                    }
                    return true
                }

                const actionableColors = requireActionFrom(state)
                const actionableBots = info.value.data.participants.filter(p => p.type == ParticipantType.Bot)
                                                                   .filter(p => actionableColors.includes(p.color))
                if (actionableBots.length == 0)
                    break

                const botaction = generateBotAction(actionableBots[0].bot, redactGameStateFor(state, actionableBots[0].color))
                executor = actionableBots[0].color
                if (botaction == undefined) {                        
                    popups.insert({
                        autoCloses: false,
                        title: "Bot failure",
                        message: "A bot produced an error during generation of actions.",
                        severity: PopupSeverity.Error
                    })
                    break
                }
                action = botaction
            }

            return true
        }

        const response = await socket.emitWithAck('gameAction', useraction)
        if (response == true)
            return true
    
        popups.insert({ 
            title: 'Invalid action',
            message: `Game action did not complete correctly: \'${response}\'`,
            severity: PopupSeverity.Warning,
            autoCloses: false,
        })
        return false
    }

    socket.on('gameOver', history => {
        if (info.value?.mode != RoomMode.Online || info.value?.data.type != RoomType.InGame)
            return

        info.value = {
            mode: RoomMode.Online,
            data: {
                ...info.value.data,
                type: RoomType.PostGame,
                history,
            }
        }
    })

    async function tryAddBot() {
        if (info.value == undefined)
            return RoomOPResult.NotInRoom

        if (info.value.data.type != RoomType.Lobby)
            return RoomOPResult.RoomInvalid
        
        if (info.value.data.scenario.players.maxAllowedCount <= info.value.data.participants.length)
            return RoomOPResult.RoomFull

        if (info.value.mode == RoomMode.Offline) {
            info.value.data.participants.push({
                type: ParticipantType.Bot,
                bot: {
                    name: "Vincent",
                    personality: BotPersonality.Vincent
                },
                color: randomUnusedColor(info.value.data.participants.map(x => x.color))!
            })
            return RoomOPResult.Success
        }

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

    return { info, tryJoin, tryCreateOnline, tryCreateOffline, tryLeave, tryStart, canJoinOnline, isOwner, tryChangeSetting, trySendAction, actions, tryAddBot }
})
