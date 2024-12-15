import type { Color } from "./Player.js"
import { neighborTile, Orientation } from "./Orientation.js"
import type { Resource } from "./Resource.js"
import { BuildingType } from "./Buildings.js"
import { v4 } from "uuid"
import { type Freeze } from "structurajs"

// Coordinate has two meaning, depending on whether tiles or crossings are indexed.
// The first coordinate always refers to the horizontal degree, left to right, the
// second is vertical, top to bottom.
// To tile correctly, each horizontally adjacent tile has a vertical offset to its
// predecessor, this still counts as being in the same row.
// Each row (for tiles) also has a horizontal offset. The first row starts completely
// at 0 to the left, while the second has half a tile offset into the x-axis.
// A good starting point for examples is the function `neighborTile`

export type Coordinate = Freeze<[number, number]>
export function sameCoordinate(c1: Coordinate, c2: Coordinate) {
    return c1[0] == c2[0] && c1[1] == c2[1]
}
export type Road = Freeze<[Coordinate, Coordinate]>
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


export type LandTile = { type: 'desert' } | ResourceTile
export type OceanTile = { type: 'ocean' } | PortTile
export type Tile = LandTile | OceanTile
export type CoordinateTile = Tile & { coord: Coordinate }
export function isLandTile(tile: Tile): tile is LandTile {
    return tile.type == 'desert' || tile.type == 'resource'
}

export type BoardSeed = string
export function randomBoardSeed(): BoardSeed {
    return v4()
}


export type Board = Freeze<{
    rowCount: number
    columnCount: number
    tiles: CoordinateTile[]
    roads: { color: Color, coord: Road }[]
    robber: Coordinate
    buildings: { color: Color, coord: Coordinate, type: BuildingType }[]
}>


export function allCrossings(board: Board) {
    let allPositions: Coordinate[] = []
    for (let col = 0; col < 2 * board.columnCount + 2; col++)
        for (let row = 0; row < board.rowCount + 1; row++)
            allPositions.push([col, row])

    return allPositions
}
export function twoCrossingsFromTile(tile: Coordinate, orientation: Orientation): [Coordinate, Coordinate] {
    const upperRow = tile[1]
    const lowerRow = upperRow + 1
    const leftCol = tile[0] * 2 + (tile[1] % 2 == 0 ? 0 : 1)
    const middleCol = leftCol + 1
    const rightCol = leftCol + 2
    switch (orientation) {
        case Orientation.LeftDown: return [[leftCol, lowerRow], [middleCol, lowerRow]]
        case Orientation.RightDown: return [[middleCol, lowerRow], [rightCol, lowerRow]]
        case Orientation.Left: return [[leftCol, lowerRow], [leftCol, upperRow]]
        case Orientation.LeftUp: return [[leftCol, upperRow], [middleCol, upperRow]]
        case Orientation.RightUp: return [[middleCol, upperRow], [rightCol, upperRow]]
        case Orientation.Right: return [[rightCol, upperRow], [rightCol, lowerRow]]
    }
}

export function crossingAdjacentToTile(crossing: Coordinate, tile: Coordinate): boolean {
    const xCorrection = tile[1] % 2 == 0 ? 0 : 1
    const xBase = tile[0] * 2 + xCorrection
    const allowedX = [xBase, xBase + 1, xBase + 2]
    const allowedY = [tile[1], tile[1] + 1]
    return allowedX.includes(crossing[0]) && allowedY.includes(crossing[1])
}

export function landTiles(board: Board): Freeze<CoordinateTile[]> {
    return board.tiles.filter(x => isLandTile(x))
}
export function crossingAdjacentToLand(crossing: Coordinate, board: Board): boolean {
    return landTiles(board).some(x => crossingAdjacentToTile(crossing, x.coord))
}

function isPortPoint(tile: PortTile & { coord: Coordinate }, crossing: Coordinate) {
    return crossingAdjacentToTile(crossing, tile.coord) && crossingAdjacentToTile(crossing, neighborTile(tile.coord, tile.orientation))
}
export function portPoints(tile: PortTile & { coord: Coordinate }): [Coordinate, Coordinate] {
    return twoCrossingsFromTile(tile.coord, tile.orientation)
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
    return [left, right, vertical]
}

export function adjacentRoads(crossing: Coordinate) {
    return adjacentCrossings(crossing).map(other => [crossing, other] as Road)
}

export function adjacentColorsToTile(board: Board, tile: Coordinate): readonly Color[] {
    return adjacentBuildingsToTile(board, tile).map(x => x.color)
}
export function adjacentBuildingsToTile(board: Board, tile: Coordinate) {
    return board.buildings.filter(x => crossingAdjacentToTile(x.coord, tile))
}

function crossingsForColor(board: Board, color: Color) {
    const buildingCrossingsForColor = board.buildings.filter(x => x.color == color).map(x => x.coord)
    const roadCrossingsForColor = board.roads.filter(x => x.color == color).map(x => x.coord)
    const allCrossings = roadCrossingsForColor.flatMap(x => x).concat(buildingCrossingsForColor)
    return allCrossings.filter((val, idx) => allCrossings.findIndex(x => sameCoordinate(x, val)) == idx)
}

export function availableRoadPositions(board: Board, color: Color) {
    // this can include duplicates of the form [c1, c2], [c2, c1]
    const allPotentialRoads: Road[] = 
        crossingsForColor(board, color)
        .flatMap(crossing => adjacentCrossings(crossing).map(other => [other, crossing]))

    // TODO maybe include robber?
    return allPotentialRoads
        // remove duplicates
        .filter((val, idx) => allPotentialRoads.findIndex(x => sameRoad(x, val)) == idx)
        // remove already built roads
        .filter(road => !board.roads.some(other => sameRoad(road, other.coord)))
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




function adjacentTiles(cross: Coordinate): readonly Coordinate[] {
    // draw it out to understand it
    //TODO generated positions may be negative or otherwise out of bounds

    const oneTileAbove = !isCrossingWithRoadUp(cross)
    if (oneTileAbove) {
        if (cross[1] % 2 == 0) {
            const above: Coordinate = [cross[0] / 2 - 1, cross[1] - 1]
            const belowLeft: Coordinate = [above[0], cross[1]]
            const belowRight: Coordinate = [above[0] + 1, cross[1]]
            return [above, belowLeft, belowRight]
        }
        else {
            const above: Coordinate = [(cross[0] - 1) / 2, cross[1] - 1]
            const belowLeft: Coordinate = [above[0] - 1, cross[1]]
            const belowRight: Coordinate = [above[0], cross[1]]
            return [above, belowLeft, belowRight]
        }
    }
    else {
        if (cross[1] % 2 == 0) {
            const below: Coordinate = [(cross[0] - 1) / 2, cross[1]]
            const aboveLeft: Coordinate = [below[0] - 1, below[1] - 1]
            const aboveRight: Coordinate = [below[0], below[1] - 1]
            return [below, aboveLeft, aboveRight]
        }
        else {
            const below: Coordinate = [cross[0] / 2 - 1, cross[1]]
            const aboveLeft: Coordinate = [below[0], below[1] - 1]
            const aboveRight: Coordinate = [below[0] + 1, below[1] - 1]
            return [below, aboveLeft, aboveRight]
        }
    }
}

export function mapFilter<T, R>(array: Freeze<T[]>, mapper: ((item: Freeze<T>) => Freeze<R | undefined>)): Freeze<R[]> {
    let res: Freeze<R[]> = []
    for (const item of array) {
        const mapped = mapper(item)
        if (mapped != undefined)
            res = [...res, mapped]
    }
    return res
}

export function mapFind<T, R>(array: Freeze<T[]>, finder: ((item: Freeze<T>) => Freeze<R |  undefined>)): Freeze<R | undefined> {
    for (const item of array) {
        const mapped = finder(item)
        if (mapped != undefined)
            return mapped
    }
}

export function adjacentResourceTiles(cross: Coordinate, board: Board, number: number | undefined): readonly Resource[] {
    return mapFilter(
        adjacentTiles(cross), 
        coord => 
            mapFind(
                board.tiles, 
                tile => sameCoordinate(tile.coord, coord) &&
                tile.type == 'resource' &&
                (number != undefined ? tile.number == number : true) ? tile : undefined)
            ?.resource
        )
}

export function gainedResources(board: Board, color: Color, number: number): Resource[] {
    let accumulated: Resource[] = []
    for (const building of board.buildings) {
        if (building.color != color)
            continue

        const resources = adjacentResourceTiles(building.coord, board, number)
        if (building.type == BuildingType.Settlement)
            accumulated = accumulated.concat(resources)
        if (building.type == BuildingType.City) {
            accumulated = accumulated.concat(resources)
            accumulated = accumulated.concat(resources)
        }            
    }

    return accumulated
}

export function portsForColor(board: Board, color: Color): readonly (Resource | 'general')[] {
    const ports = mapFilter(board.tiles, x => x.type == 'port' ? x as Freeze<PortTile & { coord: Coordinate }> : undefined)
    const buildingCoords = board.buildings.filter(x => x.color == color).map(x => x.coord)
    const adjacentPorts = ports.filter(port => buildingCoords.some(cross => isPortPoint(port, cross)))
    return adjacentPorts.map(x => x.resource)
}

