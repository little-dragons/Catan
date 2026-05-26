import * as z from "zod"
import type { GameActionInput, PossiblyRedactedGameActionInfo } from "../logic/GameAction"
import type { RedactedGameState } from "../logic/GameState"
import type { History } from '../logic/History'
import type { Color } from "../logic/Player"
import type { LobbyRoom, Participant, RedactedGameRoom } from "../logic/Room"
import type { Settings } from "../logic/Settings"

type Callback<T> = (arg: T) => void

export const RoomRequestSchema = z.discriminatedUnion('request', [
    z.object({
        request: z.literal('join'),
        roomID: z.string()
    }),
    z.object({
        request: z.literal('create'),
        roomName: z.string()
    })
])
export type RoomRequest = z.infer<typeof RoomRequestSchema>

export enum SocketConnectErrorCode {
    RoomNameInvalid = 'ROOM_NAME_INVALID',
    RoomFull = 'ROOM_FULL'
}

export const SocketConnectErrorSchema = z.object({
    data: z.object({ code: z.enum(SocketConnectErrorCode) }).optional()
})
export type SocketConnectError = Error & z.infer<typeof SocketConnectErrorSchema>

export function socketConnectError(message: string, code : SocketConnectErrorCode) {
    const err = new Error(message) as SocketConnectError
    err.data = { code }
    return err
}

export type GameServerEventMap = {
    addBot: (cb: Callback<true | 'invalid socket state' | 'not the owner' | 'room full'>) => void
    startGame: (cb: Callback<true | 'invalid socket state' | 'not the owner' | 'generation error'>) => void
    changeSettings: <Property extends keyof Settings>(
        setting: Property,
        value: Settings[Property],
        cb: Callback<true | 'invalid socket state' | 'not the owner' |'room is ingame'>) => void

    /**
     * Allows a user to change the color. If the sender of the event is the owner of the lobby, the color switch always succeeds.
     * If the new color was already in use, it is simply swapped with the player who had the color previously.
     * A non-owner player can only switch to unused colors. If {@link oldColor} was not in use, that error is returned.
     * @returns `color in use` can only be returned if the sender is not the owner.
     */
    changeColor: (oldColor: Color, newColor: Color, cb: Callback<true | 'invalid socket state' | 'color in use' | 'not the owner' | 'color not in use'>) => void

    fullGameRoom: (cb: Callback<RedactedGameRoom | 'invalid socket state'>) => void
    fullLobbyRoom: (cb: Callback<LobbyRoom | 'invalid socket state'>) => void
    gameState: (cb: Callback<RedactedGameState | 'invalid socket state'>) => void
    gameAction: (action: GameActionInput, cb: Callback<true | 'invalid socket state' | 'action not allowed'>) => void
}

export type QueryServerEventMap = {
    // TODO: these updates should be pushed bidirectionally instead of a unidirectional polling.
    lobbyList: (cb: Callback<LobbyRoom[]>) => void
}


export type GameClientEventMap = {    
    participantChange: (newUsers: Participant[]) => void
    
    gameStarted: () => void
    settingsChange: (settings: Settings) => void

    gameEvent: (state: RedactedGameState, action: PossiblyRedactedGameActionInfo) => void
    gameOver: (history: History) => void
}