import { FullGameState } from "./GameState"

export type Statistics = {

}

export type History = {
    lastState: FullGameState
}

export function statisticsFromHistory(history: History): Statistics {
    return { }
}
