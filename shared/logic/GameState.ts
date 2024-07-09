import { List } from "immutable"
import { Board } from "./Board"
import { Color, FullPlayer, RedactedPlayer, redactPlayer } from "./Player"
import { Resource } from "./Resource"
import { BuildingType } from "./Buildings"

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


export function victoryPointsForBuildingType(buildingType: BuildingType): number {
    switch (buildingType) {
        case BuildingType.Settlement: return 1
        case BuildingType.City: return 2
    }
}
export function victoryPointsFromBuildings(state: MinimalGameState, color: Color): number {
    return state.board.buildings.reduce((current, [buildColor, _, type]) => buildColor == color ? current + victoryPointsForBuildingType(type) : current, 0)
}

export function victoryPointsFromFull(state: FullGameState, color: Color): number {
    // TODO longest road, knights, hidden dev cards

    return victoryPointsFromBuildings(state, color)
}

export function victoryPointsFromRedacted(state: RedactedGameState, color: Color): number {
    // TODO longest road, knights

    return victoryPointsFromBuildings(state, color)

    if (state.self.color == color) {
        // TODO hidden devcards
    }
}