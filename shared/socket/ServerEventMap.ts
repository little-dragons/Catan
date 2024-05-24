import { AuthToken } from "../authentication/AuthToken"
import { AnyLogin } from "../authentication/AuthObject"
import { LobbyRoom, RedactedGameRoom, RoomId } from "../Room"
import { RedactedGameState } from "../logic/GameState"

export type ServerEventMap = LoginServerEventMap & RoomServerEventMap & GameServerEventMap

export type Callback<T> = (arg: T) => void

export type GameServerEventMap = {
    fullGameRoom: (room: RoomId, token: AuthToken, cb: Callback<RedactedGameRoom | 'invalid token' | 'invalid room id'>) => void
    gameState: (room: RoomId, token: AuthToken, cb: Callback<RedactedGameState | 'invalid token' | 'invalid room id'>) => void
    rollDice: (room: RoomId, token: AuthToken, cb: Callback<true | 'invalid token' | 'invalid room id'>) => void
}

export type RoomServerEventMap = {
    lobbyList: (cb: Callback<LobbyRoom[]>) => void
    createAndJoin: (roomName: string, token: AuthToken, cb: Callback<LobbyRoom | 'room name in use' | 'invalid token'>) => void
    join: (roomId: RoomId, token: AuthToken, cb: Callback<LobbyRoom | 'no such room id' | 'invalid token'>) => void
    leave: (roomId: RoomId, token: AuthToken, cb: Callback<true | 'invalid token'>) => void
}

export type LobbyServerEventMap = {
    startGame: (roomId: RoomId, token: AuthToken, cb: Callback<true | 'no such room id' | 'not the owner' | 'invalid token'>) => void
}

export type LoginServerEventMap = {
    login: (data: AnyLogin) => void
    logout: (id: AuthToken) => void
}
