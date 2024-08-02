import { User } from '../authentication/User.js';
import { FullGameState, RedactedGameState } from './GameState.js';
import { Color } from './Player.js';
import { Settings } from './Settings.js';
import { Statistics } from './History.js';

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
