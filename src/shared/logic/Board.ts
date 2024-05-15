import type { Color } from "./Player"
import type { Coordinate, CoordinateMap } from "./Coordinate"
import type { Orientation } from "./Orientation"
import type { Resource } from "./Resource"
import type { BuildingType } from "./Buildings"


export type PortTile = {
    resource: Resource | 'General'
    orientation: Orientation
}
export type ResourceTile = {
    resource: Resource
    number: number
}

export type Tile = ResourceTile | PortTile | 'Desert' | 'Ocean'

export interface Board {
    rowCount: number
    columnCount: number
    map: CoordinateMap<Tile>
    roads: [Color, Coordinate, Coordinate][] 
    robber: Coordinate
    buildings: [Color, Coordinate, BuildingType][]
}

export function allCoordinates(board: Board): Coordinate[] {
    let res: Coordinate[] = []
    for (let i = 0; i < board.rowCount; i++)
        for (let j = 0; j < board.columnCount; j++)
            res.push([i, j])
    return res
}



