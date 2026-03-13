import { User } from '../authentication/User';
import { FullGameState, RedactedGameState } from './GameState';
import { Color } from './Player';
import { Settings } from './Settings';
import { History, Statistics } from './History';
import { Bot } from './Bots';
import { Scenario } from './Scenario';

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
} | {
    type: ParticipantType.Bot
    bot: Bot
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
    participants: [Participant, Color][]
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
