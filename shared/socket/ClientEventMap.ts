import { AuthUser } from "../authentication/User"
import { RoomId } from "../Room"
import { LoginError as LoginError } from "./ConnectionError"

export type ClientEventMap = GameClientEventMap & LoginClientEventMap & RoomClientEventMap

export type GameClientEventMap = {
    gameEvent: () => void
}

export type RoomClientEventMap = {
    gameStarted: (roomId: RoomId) => void
}

export type LoginClientEventMap = {
    loggedIn: (user: AuthUser) => void
    rejectLogin: (reason: LoginError) => void
}
