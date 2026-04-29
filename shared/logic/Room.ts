import { type User } from '../authentication/User';
import { type FullGameState, type RedactedGameState } from './GameState';
import { type Color } from './Player';
import { type Settings } from './Settings';
import { type History } from './History';
import { type Bot } from './Bots';
import { type Scenario } from './Scenario';

export type RoomId = string
export enum RoomType {
    Lobby,
    InGame,
    PostGame
}

export enum ParticipantType {
    User, Bot
}
export type Participant = {
    type: ParticipantType.User,
    user: User
    color: Color
} | {
    type: ParticipantType.Bot
    bot: Bot
    color: Color
}
export function participantName(p: Participant): string {
    if (p.type == ParticipantType.User)
        return p.user.name
    else
        return p.bot.name
}

type CommonRoom = {
    name: string
    id: RoomId
    owner: User
    participants: Participant[]
    settings: Settings
    scenario: Scenario
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
    history: History
} & CommonRoom

export type RedactedRoom = LobbyRoom | RedactedGameRoom | PostGameRoom
export type FullRoom = LobbyRoom | FullGameRoom | PostGameRoom
