import { User } from "../authentication/User"
import { Color } from "../logic/Player"
import { Settings } from "../logic/Settings"
import { History } from "../logic/History"
import { RedactedGameState } from "../logic/GameState"
import { PossiblyRedactedGameActionInfo } from "../logic/GameAction"
import { Participant } from "../logic/Room"

export type ClientEventMap = GameClientEventMap & LobbyClientEventMap & RoomClientEventMap & LoginClientEventMap

export type GameClientEventMap = {
    gameEvent: (state: RedactedGameState, action: PossiblyRedactedGameActionInfo) => void
    gameOver: (history: History) => void
}

export type RoomClientEventMap = {
    closed: () => void
    participantChange: (newUsers: [Participant, Color][]) => void
}

export type LobbyClientEventMap = {
    gameStarted: () => void
    settingsChange: (settings: Settings) => void
}

export type LoginClientEventMap = {
}