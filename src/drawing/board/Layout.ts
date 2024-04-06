import type { Board } from "@/logic/Board"
import type { BoardRenderInfo } from "./Renderer.vue"


export function minimalFillingTileRadius(board: Board, width: number, height: number): number {
    return Math.min(width / (2 * (board.columnCount + 0.5) * Math.cos(30 / 180 * Math.PI)), height / (board.rowCount * 1.5 + 0.5))
}

export function tileCenter(pos: [number, number], radius: number): [number, number] {
    const halfTileWidth = radius * Math.cos(30 / 180 * Math.PI)
    const tileWidth = 2 * halfTileWidth
    const firstMiddlePointInRowOffset = pos[1] % 2 == 0 ? halfTileWidth : tileWidth

    return [firstMiddlePointInRowOffset + pos[0] * tileWidth, radius + pos[1] * radius * 1.5]
}


export function tileHexagon(pos: [number, number], tileRadius: number): [number, number][] {
    const center = tileCenter(pos, tileRadius)
    let points: [number, number][] = []
    for (let corner = 0; corner < 6; corner++) {
        const angle = (corner / 6) * 2 * Math.PI
        points.push([Math.sin(angle) * tileRadius + center[0], Math.cos(angle) * tileRadius + center[1]])
    }

    return points
}

export function tileResourceIconSize(tileRadius: number): [number, number] {
    return [1 * tileRadius, 0.6 * tileRadius]
}

export function tileResourceIconPosition(pos: [number, number], tileRadius: number) : [number, number] {
    const center = tileCenter(pos, tileRadius)
    const size = tileResourceIconSize(tileRadius)
    const heightOffset = -0.4 * tileRadius

    return [center[0] - size[0] / 2, center[1] - size[1] / 2 + heightOffset]
}