import { User } from '../authentication/User.js';
import { FullGameState, RedactedGameState } from './GameState.js';
import { Color } from './Player.js';
import { Settings } from './Settings.js';
import { History, Statistics } from './History.js';
import { Bot } from './Bots.js';
import { Scenario } from './Scenario.js';

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
