import { Board } from "./Board"
import { defaultBoard } from "./Generation"
import { Color, FullPlayer, RedactedPlayer, redactPlayer } from "./Player"
import { Resource } from "./Resource"

export type PublicGameState = {
    phase: {
        type: 'initial'
        forward: boolean
    } | {
        type: 'normal'
        diceRolled: false | [number, number]
    },
    board: Board
    currentPlayer: Color
    players: RedactedPlayer[]
}
export type RedactedGameState = PublicGameState & {
    self: FullPlayer
}

export type FullGameState = {
    phase: {
        type: 'initial'
        forward: boolean
    } | {
        type: 'normal'
        diceRolled: false | [number, number]
    },
    board: Board
    currentPlayer: Color
    players: FullPlayer[]
}

export function redactGameState(state: FullGameState): PublicGameState {
    return {
        board: state.board,
        currentPlayer: state.currentPlayer,
        players: state.players.map(redactPlayer),
        phase: state.phase
    }
}

export function redactGameStateFor(state: FullGameState, color: Color): RedactedGameState {
    return {
        ...redactGameState(state),
        self: state.players.find(player => player.color == color)!
    }
}


export function setNextPlayer(state: FullGameState) {
    const currentIdx = state.players.findIndex(x => x.color == state.currentPlayer)
    // check if index is in range? unncessary

    if (state.phase.type == 'initial') {
        if (currentIdx == 0 && !state.phase.forward) {
            state.phase = {
                type: 'normal',
                diceRolled: false
            }
        }
        else if (currentIdx == state.players.length - 1) {
            if (state.phase.forward)
                state.phase.forward = false
            else
                state.currentPlayer = state.players[currentIdx - 1].color
        }
        else {
            if (state.phase.forward)
                state.currentPlayer = state.players[currentIdx + 1].color
            else
                state.currentPlayer = state.players[currentIdx - 1].color
        }
    }
    else {
        state.currentPlayer = state.players[(currentIdx + 1) % state.players.length].color
        state.phase.diceRolled = false
    }
}

export function canBuySettlement(cards: Resource[]): Boolean {
    return cards.includes(Resource.Brick) && cards.includes(Resource.Lumber) && cards.includes(Resource.Grain) && cards.includes(Resource.Wool)
}

export function canBuyCity(cards: Resource[]): Boolean {

    return cards.filter(x => x == Resource.Grain).length >= 2 && cards.filter(x => x == Resource.Ore).length >= 3
}

export function canBuyRoad(cards: Resource[]): Boolean {
    return cards.includes(Resource.Lumber) && cards.includes(Resource.Brick) 
}

export function buySettlement(cards: Resource[]): void {
    cards.splice(cards.findIndex(x => x == Resource.Grain), 1)
    cards.splice(cards.findIndex(x => x == Resource.Lumber), 1)
    cards.splice(cards.findIndex(x => x == Resource.Brick), 1)
    cards.splice(cards.findIndex(x => x == Resource.Wool), 1)
}

export function buyCity(cards: Resource[]): void {
    cards.splice(cards.findIndex(x => x == Resource.Grain), 1)
    cards.splice(cards.findIndex(x => x == Resource.Grain), 1)
    cards.splice(cards.findIndex(x => x == Resource.Ore), 1)
    cards.splice(cards.findIndex(x => x == Resource.Ore), 1)
    cards.splice(cards.findIndex(x => x == Resource.Ore), 1)
}

export function buyRoad(cards: Resource[]): void {
    cards.splice(cards.findIndex(x => x == Resource.Lumber), 1)
    cards.splice(cards.findIndex(x => x == Resource.Brick), 1)
}


