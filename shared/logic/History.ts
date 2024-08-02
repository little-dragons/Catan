import { FullGameState } from "./GameState.js"

export type Statistics = {

}

export type History = {
    lastState: FullGameState
}

export function statisticsFromHistory(history: History): Statistics {
    return { }
}
