import { AuthUser } from "../authentication/User"
import { PublicGameState } from "../logic/GameState"
import { RoomId } from "../Room"
import { LoginError as LoginError } from "./ConnectionError"

export type ClientEventMap = GameClientEventMap & LoginClientEventMap & RoomClientEventMap

export type GameClientEventMap = {
}

export type RoomClientEventMap = {
    gameStarted: (roomId: RoomId) => void
}

export type LoginClientEventMap = {
    loggedIn: (user: AuthUser) => void
    rejectLogin: (reason: LoginError) => void
}
