import { AuthToken } from "../authentication/AuthToken"
import { AnyLogin } from "../authentication/AuthObject"
import { Room, RoomId } from "../Room"
import { RedactedGameState } from "../logic/GameState"

export type ServerEventMap = GameServerEventMap & LoginServerEventMap & RoomServerEventMap

export type Callback<T> = (arg: T) => void

export type GameServerEventMap = {
    gameState: (room: RoomId, token: AuthToken, cb: Callback<RedactedGameState | 'invalid token' | 'invalid room id'>) => void
    rollDice: (room: RoomId, token: AuthToken, cb: Callback<[number, number] | 'invalid token' | 'invalid room id'>) => void
}

export type RoomServerEventMap = {
    roomList: (cb: Callback<Room[]>) => void
    createAndJoin: (roomName: string, token: AuthToken, cb: Callback<Room | 'room name in use' | 'invalid token'>) => void
    join: (roomId: RoomId, token: AuthToken, cb: Callback<Room | 'no such room id' | 'invalid token'>) => void
    leave: (roomId: RoomId, token: AuthToken, cb: Callback<true | 'invalid token'>) => void
    startGame: (roomId: RoomId, token: AuthToken, cb: Callback<true | 'no such room id' | 'not the owner' | 'invalid token'>) => void
}

export type LoginServerEventMap = {
    login: (data: AnyLogin) => void
    logout: (id: AuthToken) => void
}