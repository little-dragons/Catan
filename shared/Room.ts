import { List } from 'immutable';
import { User } from './authentication/User';
import { FullGameState, RedactedGameState } from './logic/GameState';
import { Color } from './logic/Player';
import { Settings } from './logic/Settings';

export type RoomId = string

type CommonRoom = {
    name: string
    id: RoomId
    owner: User
    users: List<[User, Color]>
    settings: Settings
}
export type LobbyRoom = {
    type: 'lobby'
} & CommonRoom


export type RedactedGameRoom = {
    type: 'ingame'
    state: RedactedGameState
} & CommonRoom

export type FullGameRoom = {
    type: 'ingame'
    state: FullGameState
} & CommonRoom

export type RedactedRoom = LobbyRoom | RedactedGameRoom
export type FullRoom = LobbyRoom | FullGameRoom

