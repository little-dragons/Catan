import { BoardSeed, randomBoardSeed } from "./Board.js"

export type Settings = {
    requiredVictoryPoints: number
    longestRoadMinimum: number
    seed: BoardSeed
}


export function isValidSetting<Key extends keyof Settings>(key: Key, value: string): Settings[Key] | undefined {
    const int = parseInt(value)

    switch (key) {
        case 'requiredVictoryPoints': 
            return isNaN(int) || int < 5 || int > 30 ? undefined : int as Settings[Key]
        case 'longestRoadMinimum':
            return isNaN(int) || int < 3 || int > 8 ? undefined : int as Settings[Key]
        case 'seed':
            return value.length >= 1 && value.length <= 50 ? value as Settings[Key] : undefined 
    }
}

export function defaultSettings(): Settings {
    return {
        requiredVictoryPoints: 10,
        longestRoadMinimum: 5,
        seed: randomBoardSeed()
    }
}
