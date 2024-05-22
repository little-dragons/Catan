import { AuthUser } from "../authentication/User"
import { State } from "../logic/State"
import { LoginError as LoginError } from "./ConnectionError"

export type ClientEventMap = GameClientEventMap & LoginClientEventMap

export type GameClientEventMap = {    
    state: (state: State) => void
    rejectedRequestInvalidId: () => void
}

export type LoginClientEventMap = {
    loggedIn: (user: AuthUser) => void
    rejectLogin: (reason: LoginError) => void
}
