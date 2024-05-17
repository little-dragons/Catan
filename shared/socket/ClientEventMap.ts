import { UserWithAuth } from "../authentication/User"
import { State } from "../logic/State"

export type ClientEventMap = {
    state: (state: State) => void
    loggedIn: (user: UserWithAuth) => void

    rejectedRequestInvalidId: () => void
}
