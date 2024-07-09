import { List } from "immutable"
import { User } from "../authentication/User"
import { Color } from "../logic/Player"
import { Settings } from "../logic/Settings"

export type ClientEventMap = GameClientEventMap & LobbyClientEventMap & RoomClientEventMap & LoginClientEventMap

export type GameClientEventMap = {
    gameEvent: () => void
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