import { List } from "immutable"
import { Resource } from "./Resource"

export type RedactedPlayer = {
    color: Color,
    handCardsCount: number,
}

export type FullPlayer = {
    color: Color,
    handCards: List<Resource>,
}

export function redactPlayer(player: FullPlayer): RedactedPlayer {
    return {
        color: player.color,
        handCardsCount: player.handCards.size,
    }
}

export enum Color {
    Yellow, Orange, Red, Green, Blue
}
export const allColors: readonly Color[] = [Color.Yellow, Color.Orange, Color.Red, Color.Green, Color.Blue]

export function stringColor(c: Color) {
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
