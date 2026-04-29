import { type Settings } from "../logic/Settings"
import { type History } from "../logic/History"
import { type RedactedGameState } from "../logic/GameState"
import { type PossiblyRedactedGameActionInfo } from "../logic/GameAction"
import { type Participant } from "../logic/Room"

export type ClientEventMap = GameClientEventMap & LobbyClientEventMap & RoomClientEventMap & LoginClientEventMap

export type GameClientEventMap = {
    gameEvent: (state: RedactedGameState, action: PossiblyRedactedGameActionInfo) => void
    gameOver: (history: History) => void
}

export type RoomClientEventMap = {
    closed: () => void
    participantChange: (newUsers: Participant[]) => void
}

export type LobbyClientEventMap = {
    gameStarted: () => void
    settingsChange: (settings: Settings) => void
}

export type LoginClientEventMap = {
}