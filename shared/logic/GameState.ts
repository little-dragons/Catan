import { Board, Coordinate, mapFilter, Road, sameCoordinate } from "./Board"
import { Color, FullPlayer, RedactedPlayer, redactPlayer } from "./Player"
import { BuildingType } from "./Buildings"
import { produce, type Freeze } from "structurajs"
import { Resource } from "./Resource"
import { OpenTradeOffer } from "./Trade"
import { DevCardType } from "./GameAction"

export enum GamePhaseType {
    Initial,
    Turns
}
export enum TurnPhaseType {
    Robbing, PreDiceRoll, Active
}
export enum RobbingPhaseType {
    MovingRobber, DiscardingCards
}

export type DieResult = 1 | 2 | 3 | 4 | 5 | 6

export type InitialPhase = Freeze<{
    type: GamePhaseType.Initial
    forward: boolean
}>
export function isInitial(phase: GamePhase): phase is InitialPhase {
    return phase.type == GamePhaseType.Initial
}
export type PreDiceRollPhase = Freeze<{
    type: GamePhaseType.Turns
    subtype: TurnPhaseType.PreDiceRoll
}>
export function isPreDiceRoll(phase: GamePhase): phase is PreDiceRollPhase {
    return phase.type == GamePhaseType.Turns && phase.subtype == TurnPhaseType.PreDiceRoll
}
export type RobbingPhase = DiscardingCardsRobberPhase | MovingRobberPhase
export type DiscardingCardsRobberPhase = Freeze<{
    type: GamePhaseType.Turns
    subtype: TurnPhaseType.Robbing
    robtype: RobbingPhaseType.DiscardingCards
    playersLeftToDiscard: Color[]
}>
export type MovingRobberPhase = Freeze<{
    type: GamePhaseType.Turns
    subtype: TurnPhaseType.Robbing
    robtype: RobbingPhaseType.MovingRobber
}>
export function isRobbing(phase: GamePhase): phase is RobbingPhase {
    return phase.type == GamePhaseType.Turns && phase.subtype == TurnPhaseType.Robbing
}
export function isRobbingMovingRobber(phase: GamePhase): phase is MovingRobberPhase {
    return isRobbing(phase) && phase.robtype == RobbingPhaseType.MovingRobber
}
export function isRobbingDiscardingCards(phase: GamePhase): phase is DiscardingCardsRobberPhase {
    return isRobbing(phase) && phase.robtype == RobbingPhaseType.DiscardingCards
}


export type ActivePhase = Freeze<{
    type: GamePhaseType.Turns
    subtype: TurnPhaseType.Active
    tradeOffers: OpenTradeOffer[]
}>
export function isActive(phase: GamePhase): phase is ActivePhase {
    return phase.type == GamePhaseType.Turns && phase.subtype == TurnPhaseType.Active
}

export type GamePhase =
    InitialPhase | PreDiceRollPhase | RobbingPhase | ActivePhase

export type PublicGameState = Freeze<{
    phase: GamePhase
    board: Board
    currentPlayer: Color
    longestRoad: Color | undefined
    knightForce: Color | undefined
    players: RedactedPlayer[]
    devCardCount: number
}>
export type RedactedGameState = Freeze<PublicGameState & {
    self: FullPlayer
}>

export type FullGameState = Freeze<{
    phase: GamePhase,
    board: Board
    currentPlayer: Color
    longestRoad: Color | undefined
    knightForce: Color | undefined
    players: FullPlayer[]
    devCards: {
        knights: number,
        victoryPoints: number,
        yearOfPlenty: number,
        monopoly: number,
        roadBuilding: number
    }
}>

export type AnyGameState = FullGameState | RedactedGameState | PublicGameState


export function publicGameState(state: FullGameState): PublicGameState {
    return {
        ...state,
        players: state.players.map(redactPlayer),        
        devCardCount: 
            state.devCards.knights +
            state.devCards.monopoly +
            state.devCards.roadBuilding +
            state.devCards.victoryPoints +
            state.devCards.yearOfPlenty
    }
}

export function redactGameStateFor(state: FullGameState, color: Color): RedactedGameState {
    return {
        ...publicGameState(state),
        self: state.players.find(player => player.color == color)!
    }
}

export function nextTurn(state: AnyGameState): [Color, GamePhase] {
    const currentIdx = state.players.findIndex(x => x.color == state.currentPlayer)
    // check if index is in range? unncessary

    if (state.phase.type == GamePhaseType.Initial) {
        if (currentIdx == 0 && !state.phase.forward)
            return [state.players[currentIdx]!.color, { type: GamePhaseType.Turns, subtype: TurnPhaseType.PreDiceRoll }]
        else if (currentIdx == state.players.length - 1) {
            if (state.phase.forward)
                return [state.players[currentIdx]!.color, { type: GamePhaseType.Initial, forward: false }]
            else
                return [state.players[currentIdx - 1]!.color, { type: GamePhaseType.Initial, forward: false }]
        }
        else {
            if (state.phase.forward)
                return [state.players[currentIdx + 1]!.color, { type: GamePhaseType.Initial, forward: true }]
            else
                return [state.players[currentIdx - 1]!.color, { type: GamePhaseType.Initial, forward: false }]
        }
    }

    return [state.players[(currentIdx + 1) % state.players.length]!.color, { type: GamePhaseType.Turns, subtype: TurnPhaseType.PreDiceRoll }]
}


export function victoryPointsForBuildingType(buildingType: BuildingType): number {
    switch (buildingType) {
        case BuildingType.Settlement: return 1
        case BuildingType.City: return 2
    }
}
export function victoryPointsFromBuildings(board: Board, color: Color): number {
    return board.buildings.reduce((current, { color: buildColor, type }) => buildColor == color ? current + victoryPointsForBuildingType(type) : current, 0)
}


export function victoryPointsFromLongestRoad(state: AnyGameState, color: Color): number {
    if (state.longestRoad == color)
        return 2
    return 0
}

export function victoryPointsFromKnightForce(state: AnyGameState, color: Color): number {
    if (state.knightForce == color)
        return 2
    return 0
}

export function victoryPointsFromFull(state: FullGameState, color: Color): number {
    const hiddenVpCards = state.players.find(x => x.color == color)!.devCards
                                .filter(x => x == DevCardType.VictoryPoint).length
    return victoryPointsFromBuildings(state.board, color) + 
           victoryPointsFromLongestRoad(state, color) + 
           victoryPointsFromKnightForce(state, color) +
           hiddenVpCards

}

export function victoryPointsFromRedacted(state: RedactedGameState, color: Color): number {
    let hiddenVpCards = 0
    if (state.self.color == color) {
        hiddenVpCards = state.self.devCards.filter(x => x == DevCardType.VictoryPoint).length
    }

    return victoryPointsFromBuildings(state.board, color) + 
           victoryPointsFromLongestRoad(state, color) +
           victoryPointsFromKnightForce(state, color) +
           hiddenVpCards
}


export function requireActionFrom(state: FullGameState): readonly Color[] {
    if (isRobbingDiscardingCards(state.phase))
        return state.phase.playersLeftToDiscard
    return [state.currentPlayer] 
}