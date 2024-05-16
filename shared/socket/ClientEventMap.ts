import { State } from "../logic/State"

export type ClientEventMap = {
    state: (state: State) => void
}