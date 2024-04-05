import type { Board } from "@/logic/Board"

export type BoardRenderInfo = {
    board: Board
    tileRadius: number
}

export function minimalFillingTileRadius(board: Board, width: number, height: number): number {
    return Math.min(width / (2 * (board.columnCount + 0.5) * Math.cos(30 / 180 * Math.PI)), height / (board.rowCount * 1.5 + 0.5))
}

function fullSize(board: BoardRenderInfo): [number, number] {
    return [
        board.tileRadius * (board.board.rowCount * 1.5 + 0.5),
        board.tileRadius * (2 * Math.cos(30 / 180 * Math.PI) * (board.board.columnCount + 0.5))
    ]
}

export function tileCenter(pos: [number, number], radius: number): [number, number] {
    const halfTileWidth = radius * Math.cos(30 / 180 * Math.PI)
    const tileWidth = 2 * halfTileWidth
    const firstMiddlePointInRowOffset = pos[1] % 2 == 0 ? halfTileWidth : tileWidth

    return [firstMiddlePointInRowOffset + pos[0] * tileWidth, radius + pos[1] * radius * 1.5]
}


export function tileHexagon(pos: [number, number], board: BoardRenderInfo): [number, number][] {
    const center = tileCenter(pos, board.tileRadius)
    let points: [number, number][] = []
    for (let corner = 0; corner < 6; corner++) {
        const angle = (corner / 6) * 2 * Math.PI
        points.push([Math.sin(angle) * board.tileRadius + center[0], Math.cos(angle) * board.tileRadius + center[1]])
    }

    return points
}

export function tileResourceIcon(pos: [number, number], board: BoardRenderInfo) : { topLeft: [number, number], size: [number, number] } {
    const center = tileCenter(pos, board.tileRadius)
    const width = 1 * board.tileRadius
    const height = 0.6 * board.tileRadius
    const heightOffset = -0.3 * board.tileRadius

    return {
        topLeft: [center[0] - width / 2, center[1] - height / 2 + heightOffset],
        size: [width, height]
    }
}