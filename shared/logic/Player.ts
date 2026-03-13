import { Freeze } from "structurajs"
import { CardList } from "./Resource"
import { DevCardType } from "./GameAction"

export type RedactedPlayer = Freeze<{
    color: Color,
    handCardsCount: number,
    devCardsCount: number,
    knightsPlayed: number
}>

export type FullPlayer = Freeze<{
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
