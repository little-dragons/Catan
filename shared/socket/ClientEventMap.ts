import { AuthUser } from "../authentication/User"
import { LoginError as LoginError } from "./ConnectionError"

export type ClientEventMap = LoginClientEventMap & GameClientEventMap & LobbyClientEventMap & RoomClientEventMap

export type GameClientEventMap = {
    gameEvent: () => void
}

export type RoomClientEventMap = {

}

export type LobbyClientEventMap = {
    gameStarted: () => void
}

export type LoginClientEventMap = {
    loggedIn: (user: AuthUser) => void
    rejectLogin: (reason: LoginError) => void
}
