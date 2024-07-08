import type { Color } from "./Player"
import type { Orientation } from "./Orientation"
import type { Resource } from "./Resource"
import { BuildingType } from "./Buildings"
import { v4 } from "uuid"
import { canBuyRoad } from "./GameState"
import { List } from "immutable"

export type Coordinate = [number, number]
export function sameCoordinate(c1: Coordinate, c2: Coordinate) {
    return c1[0] == c2[0] && c1[1] == c2[1]
}
export type Road = [Coordinate, Coordinate]
export function sameRoad(r1: Road, r2: Road) {
    return sameCoordinate(r1[0], r2[0]) && sameCoordinate(r1[1], r2[1]) || sameCoordinate(r1[0], r2[1]) && sameCoordinate(r1[1], r2[0])
}

export type PortTile = {
    type: 'port'
    resource: Resource | 'general'
    orientation: Orientation
}
export type ResourceTile = {
    type: 'resource'
    resource: Resource
    number: number
}


export type Tile = ResourceTile | PortTile | { type: 'desert' | 'ocean' }

export type BoardSeed = string
export function randomBoardSeed() {
    return v4()
}

export interface Board {
    rowCount: number
    columnCount: number
    tiles: List<[Tile, Coordinate]>
    roads: List<[Color, Road]>
    robber: Coordinate
    buildings: List<[Color, Coordinate, BuildingType]>
}


export function allCrossingPositions(board: Board) {
    let allPositions: List<Coordinate> = List()
    for (let col = 0; col < 2 * board.columnCount + 2; col++)
        for (let row = 0; row < board.rowCount + 1; row++)
            allPositions = allPositions.push([col, row])

    return allPositions
}

function crossingAdjacentToTile(crossing: Coordinate, tile: Coordinate): boolean {
    const xCorrection = tile[1] % 2 == 0 ? 0 : 1
    const xBase = tile[0] * 2 + xCorrection
    const allowedX = [xBase, xBase + 1, xBase + 2]
    const allowedY = [tile[1], tile[1] + 1]
    return allowedX.includes(crossing[0]) && allowedY.includes(crossing[1])
}

export function crossingAdjacentToLand(crossing: Coordinate, board: Board): boolean {
    return board.tiles.filter(x => x[0].type == 'desert' || x[0].type == 'resource').some(x => crossingAdjacentToTile(crossing, x[1]))
}


function isCrossingWithRoadUp(crossing: Coordinate): boolean {
    function logicalXor(a: boolean, b: boolean) {
        return a && !b || b && !a
    }
    return logicalXor(crossing[0] % 2 == 0, crossing[1] % 2 == 0)
}


export function adjacentCrossings(crossing: Coordinate) {
    //TODO generated positions may be negative or otherwise out of bounds
    const left: Coordinate = [crossing[0] - 1, crossing[1]]
    const right: Coordinate = [crossing[0] + 1, crossing[1]]

    const goingUp = isCrossingWithRoadUp(crossing)
    const vertical: Coordinate = [crossing[0], crossing[1] + (goingUp ? -1 : 1)]
    return List([left, right, vertical])
}

export function adjacentRoads(crossing: Coordinate) {
    return adjacentCrossings(crossing).map(other => [crossing, other] as Road)
}

function crossingsForColor(board: Board, color: Color) {
    const buildingCrossingsForColor = board.buildings.filter(x => x[0] == color).map(x => x[1])
    const roadCrossingsForColor = board.roads.filter(x => x[0] == color).map(x => x[1])
    const allCrossings = roadCrossingsForColor.flatMap(x => x).concat(buildingCrossingsForColor)
    return allCrossings.filter((val, idx) => allCrossings.findIndex(x => sameCoordinate(x, val)) == idx)
}

export function availableRoadPositions(board: Board, color: Color) {
    // this can include duplicates of the form [c1, c2], [c2, c1]
    const allPotentialRoads: List<Road> = 
        crossingsForColor(board, color)
        .flatMap(crossing => adjacentCrossings(crossing).map(other => [other, crossing]))

    // TODO maybe include robber?
    return allPotentialRoads
        // remove duplicates
        .filter((val, idx) => allPotentialRoads.findIndex(x => sameRoad(x, val)) == idx)
        // remove already built roads
        .filter(road => !board.roads.some(other => sameRoad(road, other[1])))
}

export function isAvailableRoadPosition(board: Board, road: Road, color: Color) {
    if (!adjacentCrossings(road[0]).some(x => sameCoordinate(x, road[1])))
        return false

    const allCrossings = crossingsForColor(board, color)
    const coordinates = 
        allCrossings.some(x => sameCoordinate(x, road[0])) ? [road[0], road[1]] :
        allCrossings.some(x => sameCoordinate(x, road[1])) ? [road[1], road[0]] :
        undefined

    if (coordinates == undefined)
        return false

    return true
}




function adjacentTiles(cross: Coordinate): List<Coordinate> {
    // draw it out to understand it
    //TODO generated positions may be negative or otherwise out of bounds

    const oneTileAbove = !isCrossingWithRoadUp(cross)
    if (oneTileAbove) {
        if (cross[1] % 2 == 0) {
            const above: Coordinate = [cross[0] / 2 - 1, cross[1] - 1]
            const belowLeft: Coordinate = [above[0], cross[1]]
            const belowRight: Coordinate = [above[0] + 1, cross[1]]
            return List([above, belowLeft, belowRight])
        }
        else {
            const above: Coordinate = [(cross[0] - 1) / 2, cross[1] - 1]
            const belowLeft: Coordinate = [above[0] - 1, cross[1]]
            const belowRight: Coordinate = [above[0], cross[1]]
            return List([above, belowLeft, belowRight])
        }
    }
    else {
        if (cross[1] % 2 == 0) {
            const below: Coordinate = [(cross[0] - 1) / 2, cross[1]]
            const aboveLeft: Coordinate = [below[0] - 1, below[1] - 1]
            const aboveRight: Coordinate = [below[0], below[1] - 1]
            return List([below, aboveLeft, aboveRight])
        }
        else {
            const below: Coordinate = [cross[0] / 2 - 1, cross[1]]
            const aboveLeft: Coordinate = [below[0], below[1] - 1]
            const aboveRight: Coordinate = [below[0] + 1, below[1] - 1]
            return List([below, aboveLeft, aboveRight])
        }
    }
}

function mapFilter<T, R>(array: List<T>, mapper: ((item: T) => R | undefined)): List<R> {
    let res: List<R> = List()
    for (const item of array) {
        const mapped = mapper(item)
        if (mapped != undefined)
            res = res.push(mapped)
    }
    return res
}
function mapFind<T, R>(array: List<T>, finder: ((item: T) => R |  undefined)): R | undefined {
    for (const item of array) {
        const mapped = finder(item)
        if (mapped != undefined)
            return mapped
    }
}

export function adjacentResourceTiles(cross: Coordinate, board: Board, number: number | undefined): List<Resource> {
    return mapFilter(
        adjacentTiles(cross), 
        coord => 
            mapFind(
                board.tiles, 
                tile => sameCoordinate(tile[1], coord) &&
                tile[0].type == 'resource' &&
                (number != undefined ? tile[0].number == number : true) ? tile[0] : undefined)
            ?.resource
        )
}

export function gainedResources(board: Board, color: Color, number: number): List<Resource> {
    let accumulated = List<Resource>()
    for (const building of board.buildings) {
        if (building[0] != color)
            continue

        const resources = adjacentResourceTiles(building[1], board, number)
        if (building[2] == BuildingType.Settlement)
            accumulated = accumulated.concat(resources)
        if (building[2] == BuildingType.City) {
            accumulated = accumulated.concat(resources)
            accumulated = accumulated.concat(resources)
        }            
    }

    return accumulated
}