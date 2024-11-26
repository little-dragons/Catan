import { User } from "../authentication/User.js"
import { Color } from "../logic/Player.js"
import { Settings } from "../logic/Settings.js"
import { History } from "../logic/History.js"
import { RedactedGameState } from "../logic/GameState.js"
import { PossiblyRedactedGameActionInfo } from "../logic/GameAction.js"

export type ClientEventMap = GameClientEventMap & LobbyClientEventMap & RoomClientEventMap & LoginClientEventMap

export type GameClientEventMap = {
    gameEvent: (state: RedactedGameState, action: PossiblyRedactedGameActionInfo) => void
    gameOver: (history: History) => void
}

export type RoomClientEventMap = {
    closed: () => void
    userChange: (newUsers: [User, Color][]) => void
}

export type LobbyClientEventMap = {
    gameStarted: () => void
    settingsChange: (settings: Settings) => void
}

type Callback<T> = (arg: T) => void
export type LoginClientEventMap = {
}