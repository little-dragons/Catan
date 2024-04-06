import type { CoordinateMap } from "./Coordinate"
import type { Orientation } from "./Orientation"
import type { Resource } from "./Resource"


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
}

export function allPositions(board: Board): [number, number][] {
    let res: [number, number][] = []
    for (let i = 0; i < board.rowCount; i++)
        for (let j = 0; j < board.columnCount; j++)
            res.push([i, j])
    return res
}



