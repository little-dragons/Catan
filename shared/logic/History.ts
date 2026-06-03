import type { FullGameState } from './GameState'

export type Statistics = object & {

}

export type History = {
    lastState: FullGameState
}

export function statisticsFromHistory(_history: History): Statistics {
    return { }
}
