import { List } from "immutable"
import { Board } from "./Board"
import { Color, FullPlayer, RedactedPlayer, redactPlayer } from "./Player"
import { Resource } from "./Resource"

export enum GamePhaseType {
    Initial,
    Normal
}
export type GamePhase = {
    type: GamePhaseType.Initial
    forward: boolean
} | {
    type: GamePhaseType.Normal
    diceRolled: false | [number, number]
}

export type PublicGameState = {
    phase: GamePhase
    board: Board
    currentPlayer: Color
    players: List<RedactedPlayer>
}
export type RedactedGameState = PublicGameState & {
    self: FullPlayer
}

export type FullGameState = {
    phase: GamePhase,
    board: Board
    currentPlayer: Color
    players: List<FullPlayer>
}

export type MinimalGameState = PublicGameState | RedactedGameState | FullGameState

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

export function nextTurn(state: MinimalGameState): [Color, GamePhase] {
    const currentIdx = state.players.findIndex(x => x.color == state.currentPlayer)
    // check if index is in range? unncessary

    if (state.phase.type == GamePhaseType.Initial) {
        if (currentIdx == 0 && !state.phase.forward)
            return [state.players.get(currentIdx)!.color, { type: GamePhaseType.Normal, diceRolled: false }]
        else if (currentIdx == state.players.size - 1) {
            if (state.phase.forward)
                return [state.players.get(currentIdx)!.color, { type: GamePhaseType.Initial, forward: false }]
            else
                return [state.players.get(currentIdx - 1)!.color, { type: GamePhaseType.Initial, forward: false }]
        }
        else {
            if (state.phase.forward)
                return [state.players.get(currentIdx + 1)!.color, { type: GamePhaseType.Initial, forward: true }]
            else
                return [state.players.get(currentIdx - 1)!.color, { type: GamePhaseType.Initial, forward: false }]
        }
    }

    return [state.players.get((currentIdx + 1) % state.players.size)!.color, { type: GamePhaseType.Normal, diceRolled: false }]
}



export function canBuySettlement(cards: Resource[]): boolean {
    return cards.includes(Resource.Brick) && cards.includes(Resource.Lumber) && cards.includes(Resource.Grain) && cards.includes(Resource.Wool)
}

export function canBuyCity(cards: Resource[]): boolean {

    return cards.filter(x => x == Resource.Grain).length >= 2 && cards.filter(x => x == Resource.Ore).length >= 3
}

export function canBuyRoad(cards: Resource[]): boolean {
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


