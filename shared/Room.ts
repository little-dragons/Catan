import { v4 as uuidv4 } from 'uuid';
import { User } from './authentication/User';
import { FullGameState, RedactedGameState } from './logic/GameState';
import { Color } from './logic/Player';

export type RoomId = string

export function newRandomRoomId(): RoomId {
    return uuidv4()
}

type CommonRoom = {
    name: string
    id: RoomId
    owner: User
}
export type LobbyRoom = {
    type: 'lobby'
    users: User[]
} & CommonRoom


export type RedactedGameRoom = {
    type: 'ingame'
    state: RedactedGameState
    users: [User, Color][]
} & CommonRoom

export type FullGameRoom = {
    type: 'ingame'
    state: FullGameState
    users: [User, Color][]
} & CommonRoom

export type RedactedRoom = LobbyRoom | RedactedGameRoom
export type FullRoom = LobbyRoom | FullGameRoom

