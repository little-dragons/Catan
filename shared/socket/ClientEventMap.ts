import { User } from "../authentication/User"
import { Color } from "../logic/Player"
import { Settings } from "../logic/Settings"
import { Statistics } from "../logic/History"

export type ClientEventMap = GameClientEventMap & LobbyClientEventMap & RoomClientEventMap & LoginClientEventMap

export type GameClientEventMap = {
    gameEvent: () => void
    gameOver: (statistics: Statistics) => void
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