export type Settings = {
    requiredVictoryPoints: number
    longestRoadMinimum: number
}

export function defaultSettings(): Settings {
    return {
        requiredVictoryPoints: 10,
        longestRoadMinimum: 5
    }
}