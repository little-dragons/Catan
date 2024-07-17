import { User } from '../authentication/User';
import { FullGameState, RedactedGameState } from './GameState';
import { Color } from './Player';
import { Settings } from './Settings';
import { Statistics } from './History';

export type RoomId = string
export enum RoomType {
    Lobby,
    InGame,
    PostGame
}

type CommonRoom = {
    name: string
    id: RoomId
    owner: User
    users: [User, Color][]
    settings: Settings
}
export type LobbyRoom = {
    type: RoomType.Lobby
} & CommonRoom


export type RedactedGameRoom = {
    type: RoomType.InGame
    state: RedactedGameState
} & CommonRoom

export type FullGameRoom = {
    type: RoomType.InGame
    state: FullGameState
} & CommonRoom

export type PostGameRoom = {
    type: RoomType.PostGame
    statistics: Statistics
}

export type RedactedRoom = LobbyRoom | RedactedGameRoom
export type FullRoom = LobbyRoom | FullGameRoom
