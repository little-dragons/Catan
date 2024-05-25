import { AuthUser, User } from "../authentication/User"
import { Color } from "../logic/Player"
import { Settings } from "../logic/Settings"
import { LoginError as LoginError } from "./ConnectionError"

export type ClientEventMap = LoginClientEventMap & GameClientEventMap & LobbyClientEventMap & RoomClientEventMap

export type GameClientEventMap = {
    gameEvent: () => void
}

export type RoomClientEventMap = {
    closed: () => void
    userChange: (newUsers: User[] | [User, Color][]) => void
}

export type LobbyClientEventMap = {
    gameStarted: () => void
    settingsChange: (settings: Settings) => void
}

export type LoginClientEventMap = {
    loggedIn: (user: AuthUser) => void
    rejectLogin: (reason: LoginError) => void
}
