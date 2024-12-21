import { Board, Coordinate, mapFilter, Road, sameCoordinate } from "./Board.js"
import { Color, FullPlayer, RedactedPlayer, redactPlayer } from "./Player.js"
import { BuildingType } from "./Buildings.js"
import { produce, type Freeze } from "structurajs"
import { Resource } from "./Resource.js"
import { OpenTradeOffer } from "./Trade.js"

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

export function redactGameState(state: FullGameState): PublicGameState {
    return {
        board: state.board,
        currentPlayer: state.currentPlayer,
        players: state.players.map(redactPlayer),
        phase: state.phase,
        longestRoad: state.longestRoad,
        devCardCount: 
            state.devCards.knights +
            state.devCards.monopoly +
            state.devCards.roadBuilding +
            state.devCards.victoryPoints +
            state.devCards.yearOfPlenty
    }
}
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
        ...redactGameState(state),
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

function adjacentSegments(crossing: Coordinate, roads: RoadSegment[]): [RoadSegment, Coordinate][] {
    function hasValidCrossing(item: [RoadSegment, Coordinate | undefined]): item is [RoadSegment, Coordinate] {
        return item[1] != undefined
    }

    return roads
        .map<[RoadSegment, Coordinate | undefined]>(x => 
            [x, sameCoordinate(x.coordinates[0], crossing) ? x.coordinates[1] : (
                sameCoordinate(x.coordinates[1], crossing) ? x.coordinates[0] :
                undefined
            )])
        .filter(hasValidCrossing)
}

type RoadSegment = {
    roads: readonly Road[],
    coordinates: readonly [Coordinate, Coordinate],
}


function tryJoinSegments(segments: RoadSegment[]): RoadSegment[] {
    const connectors = segments.filter(x => x.coordinates.length == 2)
    {
        // first, join connectors with exactly two coordinates
        // there is no other option to connect those and this is always a right step
        const connectorCoords = connectors.flatMap(x => x.coordinates)
        const adjacents = connectorCoords.map(coord => adjacentSegments(coord, segments))
        const twoAdjacents = adjacents.filter(adjacents => adjacents.length == 2)
        if (twoAdjacents.length > 0) {
            const [[seg1, target1], [seg2, target2]] = twoAdjacents[0]
            const others = segments.filter(x => x != seg1 && x != seg2)
            const newCoordinates: [Coordinate, Coordinate] = [
                target1, target2
            ]

            return [...others, {
                roads: seg1.roads.concat(seg2.roads),
                coordinates: newCoordinates
            }]
        }
    }

    // maybe it is possible to join more segments beacuse we know that each
    // vertex of the graph only has three edges.


    return segments
}

function longestPathFrom(inputCoord: Coordinate, segments: ReadonlySet<RoadSegment>): number {
    function helper(current: Coordinate, visited: ReadonlySet<RoadSegment>): number {
        const adjacents = 
            adjacentSegments(current, [...segments.difference(visited)])
        
        const results =
            adjacents.map(([seg, target]) => helper(target, visited.union(new Set([seg]))) + seg.roads.length)

        const longest = results.find(x => !results.some(y => y > x))
        if (longest == undefined)
            return 0
        return longest
    }


    return helper(inputCoord, new Set())
}

function longestRoad(road: Road[]): number {
    let segments = road.map<RoadSegment>(x => { return { roads: [x], coordinates: x } })

    while (true) {
        const newSegments = tryJoinSegments(segments)
        if (newSegments.length == segments.length)
            break
        segments = newSegments
    }

    const allCoords = segments.flatMap(x => x.coordinates)
    const eachPathLength =
        allCoords.map(coord => longestPathFrom(coord, new Set(segments)))

    return eachPathLength.find(x => !eachPathLength.some(y => y > x)) ?? 0
}

export function longestRoadForColor(board: Board, color: Color): number {
    return longestRoad(board.roads.filter(x => x.color == color).map(x => x.coord))
}

export function colorWithLongestRoad(board: Board, currentHolder: Color | undefined): Color | undefined {
    const colors = new Set(board.roads.map(x => x.color))
    const coloredLength = [...colors].map<[Color, number]>(color=> [color, longestRoadForColor(board, color)])
    const filtered = coloredLength.filter(([_, length]) => length >= 5)
    const highestColors = filtered.filter(([col1, length1]) => !filtered.some(([col2, length2]) => length2 > length1)).map(x => x[0])
    if (highestColors.length == 0)
        return undefined

    if (currentHolder != undefined && highestColors.includes(currentHolder))
        return currentHolder

    // now highest colors may actually contain multiple values, depending on the board
    // this situation will not appear as then currentHolder has been correctly defined
    // TODO maybe this will be better
    return highestColors[0]
}

export function victoryPointsFromLongestRoad(state: AnyGameState, color: Color): number {
    if (state.longestRoad == color)
        return 2
    return 0
}

export function victoryPointsFromFull(state: FullGameState, color: Color): number {
    // TODO longest road, knights, hidden dev cards

    return victoryPointsFromBuildings(state.board, color) + victoryPointsFromLongestRoad(publicGameState(state), color)
}

export function victoryPointsFromRedacted(state: RedactedGameState, color: Color): number {
    // TODO longest road, knights

    return victoryPointsFromBuildings(state.board, color) + victoryPointsFromLongestRoad(state, color)

    if (state.self.color == color) {
        // TODO hidden devcards
    }
}
