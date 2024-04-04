import type { Resource } from "./Resource"

export enum Orientation {
    LeftDown,
    Down,
    RightDown,
    LeftUp,
    Up,
    RightUp
}


export type PortTile = {
    resource: Resource | 'General'
    orientation: Orientation
}
export type ResourceTile = {
    resource: Resource
    number: number
}

export type Tile = ResourceTile | PortTile | 'Desert'

export interface Board {
    rowCount: number
    columnCount: number
    map: Map<[number, number], Tile>
}

export function allPositions(board: Board): [number, number][] {
    let res: [number, number][] = []
    for (let i = 0; i < board.rowCount; i++)
        for (let j = 0; j < board.columnCount; j++)
            res.push([i, j])
    return res
}


