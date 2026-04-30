import { type CardList } from "./Resource"
import { DevCardType } from "./GameAction"
import { type Pure } from "../Pure"

export type RedactedPlayer = Pure<{
    color: Color,
    handCardsCount: number,
    devCardsCount: number,
    knightsPlayed: number
}>

export type FullPlayer = Pure<{
    color: Color,
    handCards: CardList,
    devCards: DevCardType[],
    knightsPlayed: number
}>

export function redactPlayer(player: FullPlayer): RedactedPlayer {
    return {
        color: player.color,
        handCardsCount: player.handCards.length,
        devCardsCount: player.devCards.length,
        knightsPlayed: player.knightsPlayed
    }
}

export enum Color {
    Yellow, Orange, Red, Green, Blue
}
export const allColors: readonly Color[] = [Color.Yellow, Color.Orange, Color.Red, Color.Green, Color.Blue]

/**
 * Calculates all unused colors from the set of already used colors.
 */
export function unusedColors(used: readonly Color[]): Color[] {
    return allColors.filter(x => !used.includes(x))
}

/**
 * Returns some unused color given a set of already used colors.
 * @returns `undefined` if all colors are already used.
 */
export function randomUnusedColor(used: readonly Color[]): Color | undefined {
    const free = unusedColors(used)
    if (free.length == 0)
        return undefined
    
    return free[Math.floor(free.length * Math.random())]
}

export function cssColor(c: Color) {
    switch (c) {
        case Color.Yellow: 
            return 'Yellow'
        case Color.Orange: 
            return 'Orange'
        case Color.Red: 
            return 'Red'
        case Color.Green: 
            return 'Green'
        case Color.Blue: 
            return 'Cornflowerblue'
    }
}
