import type { Color } from "./Player"
import type { Orientation } from "./Orientation"
import type { Resource } from "./Resource"
import type { BuildingType } from "./Buildings"

export type Coordinate = [number, number]

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

export interface Board {
    rowCount: number
    columnCount: number
    tiles: [Tile, Coordinate][]
    roads: [Color, Coordinate, Coordinate][] 
    robber: Coordinate
    buildings: [Color, Coordinate, BuildingType][]
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


export function adjacentCrossings(crossing: Coordinate): Coordinate[] {
    //TODO generated positions may be negative or otherwise out of bounds
    const left: Coordinate = [crossing[0] - 1, crossing[1]]
    const right: Coordinate = [crossing[0] + 1, crossing[1]]

    const goingUp = isCrossingWithRoadUp(crossing)
    const vertical: Coordinate = [crossing[0], crossing[1] + (goingUp ? -1 : 1)]
    return [left, right, vertical]
}

export function adjacentRoads(crossing: Coordinate): [Coordinate, Coordinate][] {
    return adjacentCrossings(crossing).map(other => [crossing, other])
}




function adjacentTiles(cross: Coordinate): Coordinate[] {
    // draw it out to understand it

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

function mapFilter<T, R>(array: T[], mapper: ((item: T) => R | undefined)): R[] {
    const res: R[] = []
    for (const item of array) {
        const mapped = mapper(item)
        if (mapped != undefined)
            res.push(mapped)
    }
    return res
}
function mapFind<T, R>(array: T[], finder: ((item: T) => R |  undefined)): R | undefined {
    for (const item of array) {
        const mapped = finder(item)
        if (mapped != undefined)
            return mapped
    }
} 
export function adjacentResourceTiles(cross: Coordinate, board: Board, number: number | undefined): Resource[] {
    return mapFilter(
        adjacentTiles(cross), 
        coord => 
            mapFind(
                board.tiles, 
                tile => tile[1][0] == coord[0] && 
                tile[1][1] == coord[1] &&
                tile[0].type == 'resource' &&
                (number != undefined ? tile[0].number == number : true) ? tile[0] : undefined)
            ?.resource
        )
}