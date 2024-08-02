import { BoardSeed, randomBoardSeed } from "./Board.js"

export type Settings = {
    requiredVictoryPoints: number
    longestRoadMinimum: number
    seed: BoardSeed
}

export function defaultSettings(): Settings {
    return {
        requiredVictoryPoints: 10,
        longestRoadMinimum: 5,
        seed: randomBoardSeed()
    }
}