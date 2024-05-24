import { Resource } from "./Resource"

export type RedactedPlayer = {
    color: Color,
    handCardsCount: number,
}

export type FullPlayer = {
    color: Color,
    handCards: Resource[],
}

export function redactPlayer(player: FullPlayer): RedactedPlayer {
    return {
        color: player.color,
        handCardsCount: player.handCards.length,
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
            return 'Blue'
    }
}

export function filterColor(c: Color): string {
    switch (c) {
        case Color.Yellow:
            return 'invert(83%) sepia(70%) saturate(1392%) hue-rotate(2deg) brightness(103%) contrast(104%)'
        case Color.Orange: 
            return 'invert(66%) sepia(70%) saturate(1759%) hue-rotate(357deg) brightness(99%) contrast(107%)'
        case Color.Red: 
            return 'invert(15%) sepia(84%) saturate(6682%) hue-rotate(0deg) brightness(117%) contrast(121%)'
        case Color.Green: 
            return 'invert(57%) sepia(91%) saturate(2946%) hue-rotate(82deg) brightness(118%) contrast(126%)'
        case Color.Blue: 
            return 'invert(8%) sepia(100%) saturate(6766%) hue-rotate(247deg) brightness(109%) contrast(144%)'
    }
}