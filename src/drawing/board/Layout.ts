import type { Board } from "@/logic/Board"
import type { BoardRenderInfo } from "./Renderer.vue"
import type { Coordinate } from "@/logic/Coordinate"
import { add, middlepoint, opposite, perpendicular, withLength } from "../Vector"


export function minimalFillingTileRadius(board: Board, width: number, height: number): number {
    return Math.min(width / (2 * (board.columnCount + 0.5) * Math.cos(30 / 180 * Math.PI)), height / (board.rowCount * 1.5 + 0.5))
}

function tileWidth(radius: number): number {
    const halfTileWidth = radius * Math.cos(30 / 180 * Math.PI)
    return 2 * halfTileWidth
}
export function tileCenter(coord: Coordinate, radius: number): [number, number] {
    const fullTileWidth = tileWidth(radius)
    const halfTileWidth = fullTileWidth / 2
    const firstMiddlePointInRowOffset = coord[1] % 2 == 0 ? halfTileWidth : fullTileWidth

    return [firstMiddlePointInRowOffset + coord[0] * fullTileWidth, radius + coord[1] * radius * 1.5]
}



export function tileHexagon(coord: Coordinate, tileRadius: number): [number, number][] {
    const center = tileCenter(coord, tileRadius)
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

export function tileResourceIconPosition(coord: Coordinate, tileRadius: number) : [number, number] {
    const center = tileCenter(coord, tileRadius)
    const size = tileResourceIconSize(tileRadius)
    const heightOffset = -0.4 * tileRadius

    return [center[0] - size[0] / 2, center[1] - size[1] / 2 + heightOffset]
}

export function tileNumberFontSize(number: number, tileRadius: number): number | undefined {
    let factor = undefined

    if (number == 12 || number == 2)
        factor = 0.35
    if (number == 11 || number == 3)
        factor = 0.4
    if (number == 10 || number == 4)
        factor = 0.45
    if (number == 9 || number == 5)
        factor = 0.51
    if (number == 8 || number == 6)
        factor = 0.58

    if (factor == undefined)
        return undefined
    else
        return factor * tileRadius
}

export function tileNumberPosition(coord: Coordinate, number: number, tileRadius: number): [number, number] | undefined {
    const center = tileCenter(coord, tileRadius)
    const size = tileNumberFontSize(number, tileRadius)

    if (size == undefined)
        return undefined

    const heightOffset = 0.2 * tileRadius

    return [center[0], center[1] + size / 2 + heightOffset]
}

function crossingPosition(coord: Coordinate, radius: number): [number, number] {
    const yBaseline = (coord[1] * 1.5 + (coord[1] % 2 == 1 ? 0.5 : 0)) * radius
    const yOffset = coord[0] % 2 == 1 ? 0 : (coord[1] % 2 == 1 ? -radius / 2 : radius / 2)
    return [tileWidth(radius) / 2 * coord[0], yBaseline + yOffset]
}

export function roadPosition(coord1: Coordinate, coord2: Coordinate, radius: number): [number, number][] {
    const roadLength = 0.8 * radius
    const roadWidth = 0.1 * radius

    const cross1 = crossingPosition(coord1, radius)
    const cross2 = crossingPosition(coord2, radius)
    const midpoint = middlepoint(cross1, cross2)
    const lengthVector = withLength([cross1[0] - midpoint[0], cross1[1] - midpoint[1]], roadLength / 2)
    const widthVector =  withLength(perpendicular(lengthVector), roadWidth / 2)

    return [
        add(midpoint, lengthVector, widthVector),
        add(midpoint, opposite(lengthVector), widthVector),
        add(midpoint, opposite(lengthVector), opposite(widthVector)),
        add(midpoint, lengthVector, opposite(widthVector))
    ]
}

export function interactionPointRadius(tileRadius: number) {
    return tileRadius * 0.25
}