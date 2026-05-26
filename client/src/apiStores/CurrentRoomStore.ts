import type { FullGameState, GameServerEventMap, LobbyRoom, PostGameRoom, RedactedGameRoom, RoomRequest, Settings } from "catan-shared"
import { BotPersonality, type Color, defaultScenario, defaultSettings, type GameActionInput, type GameClientEventMap, gameNamespace, generateBotAction, generateStateFromScenario, ParticipantType, type PossiblyRedactedGameActionInfo, participantName, type RedactedRoom, RoomType, randomUnusedColor, redactGameStateFor, requireActionFrom, SocketConnectErrorCode, SocketConnectErrorSchema, tryDoAction, UserType, winners } from "catan-shared"
import { defineStore } from "pinia"
import { io, type Socket } from "socket.io-client"
import { computed, ref } from "vue"
import { serverAddress } from "@/misc/Globals"
import { PopupSeverity, usePopups } from "@/popup/Popup"
import { UserStatus, useCurrentUserStore } from "./CurrentUserStore"


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

const socket: Socket<GameClientEventMap, GameServerEventMap> = io(serverAddress + gameNamespace, {
    withCredentials: true,
    autoConnect: false
})

export const useCurrentRoomStore = defineStore('room', () => {
    const info = ref<undefined | OfflineRoom | OnlineRoom>(undefined)
    const user = useCurrentUserStore()
    const popups = usePopups()

    async function tryJoin(id: string) {
        if (info.value !== undefined)
            return RoomOPResult.AlreadyInRoom
        if (user.info.status !== UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        socket.auth = <RoomRequest>{
            request: 'join',
            roomID: id
        }

        const result = await (new Promise<true | string | SocketConnectErrorCode>(resolve => {
            // minor leak, because only one will fire
            socket.once('connect_error', err => {
                const check = SocketConnectErrorSchema.safeParse(err)
                if (check.success && check.data.data !== undefined) {
                    resolve(check.data.data.code)
                }
                resolve(err.message)
            })
            socket.once('connect', () => {
                resolve(true as const)
            })

            socket.connect()
        }))

        if (result === true) {
            const roomData = await socket.emitWithAck('fullLobbyRoom')
            if (roomData === 'invalid socket state') {
                popups.insert({
                    autoCloses: true,
                    message: 'Joining room failed because server did not respond to current state request.',
                    severity: PopupSeverity.Warning,
                    title: 'Joining room failed'
                })
                socket.disconnect()
                return RoomOPResult.ServerRejected
            }

            info.value = { mode: RoomMode.Online, data: roomData }
            return RoomOPResult.Success
        }

        if (result === SocketConnectErrorCode.RoomNameInvalid) 
            return RoomOPResult.RoomInvalid
        if (result === SocketConnectErrorCode.RoomFull)
            return RoomOPResult.RoomFull

        
        popups.insert({
            autoCloses: true,
            message: `Joining room failed because server responded: ${result}`,
            severity: PopupSeverity.Warning,
            title: 'Joining room failed'
        })
        return RoomOPResult.ServerRejected
    }
    async function tryCreateOnline(name: string) {
        if (info.value !== undefined)
            return RoomOPResult.AlreadyInRoom
        if (user.info.status !== UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        const req: RoomRequest = {
            request: 'create',
            roomName: name
        }
        socket.auth = req

        const result = await (new Promise(resolve => {
            // minor leak, because only one will fire
            socket.once('connect_error', err => {
                const check = SocketConnectErrorSchema.safeParse(err)
                if (check.success && check.data.data !== undefined) {
                    resolve(check.data.data.code)
                }
                resolve(err.message)
            })
            socket.once('connect', () => {
                resolve(true as const)
            })

            socket.connect()
        }))

        if (result === true) {
            const roomData = await socket.emitWithAck('fullLobbyRoom')
            if (roomData === 'invalid socket state') {
                popups.insert({
                    autoCloses: true,
                    message: 'Creating room failed because server did not respond to state request',
                    severity: PopupSeverity.Warning,
                    title: 'Creating room failed'
                })
                socket.disconnect()
                return RoomOPResult.ServerRejected
            }


            info.value = { mode: RoomMode.Online, data: roomData }
            return RoomOPResult.Success
        }

        if (result === SocketConnectErrorCode.RoomNameInvalid)
            return RoomOPResult.NameInvalid
        if (result === SocketConnectErrorCode.RoomFull)
            return RoomOPResult.ServerRejected

        return RoomOPResult.ServerRejected
    }



    function tryCreateOffline() {
        if (info.value !== undefined)
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
        if (info.value === undefined)
            return RoomOPResult.NotInRoom

        if (info.value.mode === RoomMode.Offline) {
            info.value = undefined
            return RoomOPResult.Success
        }

        info.value = undefined
        socket.disconnect()
        return RoomOPResult.Success
    }

    async function tryStart() {
        if (info.value === undefined)
            return RoomOPResult.NotInRoom

        if (info.value.mode === RoomMode.Offline) {
            const r = info.value.data
            if (r.type !== RoomType.Lobby) {
                return RoomOPResult.RoomInvalid
            }

            const fs = generateStateFromScenario(r.scenario, r.participants.map(x => x.color), r.participants[0].color, r.settings.seed)
            if (fs === undefined) {
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

        if (user.info.status !== UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        if (user.info.user.name !== info.value.data.owner.name)
            return RoomOPResult.NotOwner

        const result = await socket.emitWithAck('startGame')

        if (result === 'not the owner')
            return RoomOPResult.NotOwner

        if (result === 'invalid socket state' || result === 'generation error') {
            console.log(result)
            return RoomOPResult.ServerRejected
        }

        const _assert: true = result
        return RoomOPResult.Success
    }

    const canJoinOnline = computed(() => user.info.status === UserStatus.LoggedIn && info.value === undefined)
    const isOwner = computed(() => info.value?.mode === RoomMode.Offline || (
                                user.info.status === UserStatus.LoggedIn 
                                ? info.value?.data.owner.name === user.info.user.name 
                                : false
                            ))
    const ownColor = computed(() => info.value?.mode === RoomMode.Offline 
                                    ? info.value.data.participants.find(x => x.type === ParticipantType.User)?.color
                                    : info.value?.mode === RoomMode.Online
                                    ? info.value.data.participants.find(x => participantName(x) === user.loggedInInfo!.name)?.color
                                    : undefined
                            )                                


    async function tryChangeSetting<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
        if (info.value === undefined)
            return RoomOPResult.RoomInvalid

        if (info.value.mode === RoomMode.Offline) {
            info.value.data.settings[key] = value
            return RoomOPResult.Success
        }

        if (user.info.status !== UserStatus.LoggedIn)
            return RoomOPResult.NotLoggedIn

        if (user.info.user.name !== info.value.data.owner.name)
            return RoomOPResult.NotOwner

        const res = await socket.emitWithAck('changeSettings', key, value)
        if (res === 'room is ingame')
            return RoomOPResult.RoomInvalid

        if (res === 'not the owner')
            return RoomOPResult.NotOwner

        if (res === 'invalid socket state')
            return RoomOPResult.ServerRejected
        
        const _assert: true = res
        return RoomOPResult.Success
    }
    socket.on('settingsChange', set => {
        if (info.value === undefined || info.value.mode === RoomMode.Offline)
            return

        info.value.data.settings = set
    })
    
    socket.on('gameStarted', async () => {
        if (info.value === undefined || info.value.mode === RoomMode.Offline)
            return
        
        const result = await socket.emitWithAck('fullGameRoom')
        if (result === 'invalid socket state')
            return

        info.value = { mode: RoomMode.Online, data: result }
    })

    socket.on('participantChange', newUsers => {
        if (info.value === undefined || info.value.mode === RoomMode.Offline)
            return

        info.value.data.participants = newUsers
    })

    socket.on('disconnect', () => {
        if (info.value === undefined || info.value.mode === RoomMode.Offline)
            return

        popups.insert({
            autoCloses: true,
            message: 'The room was closed and you have left it.',
            severity: PopupSeverity.Info,
            title: 'Room closed'
        })
        info.value = undefined
    })

    const actions = ref<PossiblyRedactedGameActionInfo[]>([])

    socket.on('gameEvent', (newState, actionInfo) => {
        if (info.value === undefined || info.value.mode !== RoomMode.Online || info.value.data.type !== RoomType.InGame) {
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
        if (info.value === undefined || info.value.data.type !== RoomType.InGame)
            return false

        if (info.value.mode === RoomMode.Offline) {
            const selfcolor = info.value.data.state.self.color
            let action = useraction
            let executor = info.value.data.state.self.color
            let state = info.value.data.fullState

            // loop on performing this action, mixed with the following bot actions
            while (true) {
                const result = tryDoAction(state, executor, action)

                if (result === undefined) {
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
                const actionableBots = info.value.data.participants.filter(p => p.type === ParticipantType.Bot)
                                                                   .filter(p => actionableColors.includes(p.color))
                if (actionableBots.length === 0)
                    break

                const botaction = generateBotAction(actionableBots[0].bot, redactGameStateFor(state, actionableBots[0].color))
                if (botaction === undefined) {
                    popups.insert({
                        autoCloses: false,
                        title: "Bot failure",
                        message: "A bot produced an error during generation of actions.",
                        severity: PopupSeverity.Error
                    })
                    break
                }
                executor = actionableBots[0].color
                action = botaction
            }

            return true
        }

        const response = await socket.emitWithAck('gameAction', useraction)
        if (response === true)
            return true
    
        popups.insert({ 
            title: 'Invalid action',
            message: `Game action did not complete correctly: '${response}'`,
            severity: PopupSeverity.Warning,
            autoCloses: false,
        })
        return false
    }

    socket.on('gameOver', history => {
        if (info.value?.mode !== RoomMode.Online || info.value?.data.type !== RoomType.InGame)
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
        if (info.value === undefined)
            return RoomOPResult.NotInRoom

        if (info.value.data.type !== RoomType.Lobby)
            return RoomOPResult.RoomInvalid
        
        if (info.value.data.scenario.players.maxAllowedCount <= info.value.data.participants.length)
            return RoomOPResult.RoomFull

        if (info.value.mode === RoomMode.Offline) {
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
        if (result === 'invalid socket state')
            return RoomOPResult.NotInRoom
        if (result === 'not the owner')
            return RoomOPResult.NotOwner
        if (result === 'room full')
            return RoomOPResult.RoomFull
        
        const _assert: true = result
        return RoomOPResult.Success
    }

    async function tryChangeColor(oldColor: Color, newColor: Color) {
        if (info.value?.mode === RoomMode.Offline) {
            const oldPart = info.value.data.participants.find(x => x.color === oldColor)
            const newPart = info.value.data.participants.find(x => x.color === newColor)
            if (oldPart !== undefined) oldPart.color = newColor
            if (newPart !== undefined) newPart.color = oldColor
            return RoomOPResult.Success
        }

        const response = await socket.emitWithAck('changeColor', oldColor, newColor)
        switch (response) {
            case 'color in use':
                return RoomOPResult.ServerRejected
            case 'color not in use':
                return RoomOPResult.ServerRejected
            case 'not the owner':
                return RoomOPResult.NotOwner
            case 'invalid socket state':
                return RoomOPResult.ServerRejected
            case true:
                return RoomOPResult.Success
        }
    }

    return { info, tryJoin, tryChangeColor, tryCreateOnline, tryCreateOffline, tryLeave, tryStart, ownColor, canJoinOnline, isOwner, tryChangeSetting, trySendAction, actions, tryAddBot }
})
