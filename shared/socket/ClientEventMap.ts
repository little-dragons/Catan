import { UserWithAuth } from "../authentication/User"
import { State } from "../logic/State"
import { ConnectionError as LoginError } from "./ConnectionError"

export type ClientEventMap = {
    state: (state: State) => void
    loggedIn: (user: UserWithAuth) => void
    rejectLogin: (reason: LoginError) => void

    rejectedRequestInvalidId: () => void
}
