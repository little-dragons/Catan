import { portPoints, type Board, type Coordinate, type PortTile, type ResourceTileNumber, type Road } from "shared"
import { add, distance, lerp, middlepoint, opposite, perpendicular, withLength } from "./Vector"

type Pixel = [number, number]

export const tileRadius = 100

export const tileWidth = 2 * tileRadius * Math.cos(30 / 180 * Math.PI)

type SvgViewboxContainer = {
    startX: number
    startY: number
    width: number
    height: number
}
export function svgViewboxContainer(board: Board): SvgViewboxContainer {    
    // TODO this is not ideally implemented, but it works. It is supposed to keep the viewbox fitting to the content if
    // the leftmost row does not contain elements in uneven rows: because then, all tiles in the first row do not start
    // at 0, but rather have an offset into the x-axis.
    const viewboxStartX = board.tiles.some(x => x.coord[0] == 0 && x.coord[1] % 2 == 0) ? 0 : tileRadius * Math.cos(30 / 180 * Math.PI)
    const viewboxWidth = tileRadius * 2 * (board.columnCount + 0.5) * Math.cos(30 / 180 * Math.PI) - viewboxStartX
    const viewboxHeight = tileRadius * (board.rowCount * 1.5 + 0.5)

    return {
        startX: viewboxStartX,
        startY: 0,
        width: viewboxWidth,
        height: viewboxHeight
    }
}

export function tileCenter(coord: Coordinate): Pixel {
    const halfTileWidth = tileWidth / 2
    const firstMiddlePointInRowOffset = coord[1] % 2 == 0 ? halfTileWidth : tileWidth

    return [firstMiddlePointInRowOffset + coord[0] * tileWidth, tileRadius + coord[1] * tileRadius * 1.5]
}



export function tileHexagon(coord: Coordinate): Pixel[] {
    const center = tileCenter(coord)
    let points: Pixel[] = []
    for (let corner = 0; corner < 6; corner++) {
        const angle = (corner / 6) * 2 * Math.PI
        points.push([Math.sin(angle) * tileRadius + center[0], Math.cos(angle) * tileRadius + center[1]])
    }

    return points
}


export const tileResourceIconSize = [0.6 * tileRadius, 0.5 * tileRadius] as const

export function tileResourceIconPosition(coord: Coordinate) : Pixel {
    const center = tileCenter(coord)
    const size = tileResourceIconSize
    const heightOffset = -0.4 * tileRadius

    return [center[0] - size[0] / 2, center[1] - size[1] / 2 + heightOffset]
}


export const tilePortIconSize = [0.7 * tileRadius, tileRadius] as const

export function tilePortPosition(coord: Coordinate): Pixel { 
    const center = tileCenter(coord)
    const size = tilePortIconSize
    const widthOffset = 0.05 * size[0]

    return [center[0] - size[0] / 2 + widthOffset, center[1] - size[1] / 2]
}


export function tileNumberFontSize(number: ResourceTileNumber): number {
    switch (number) {
        case 2:
        case 12:
            return 0.35 * tileRadius
        case 3:
        case 11:
            return 0.4 * tileRadius
        case 4:
        case 10:
            return 0.45 * tileRadius
        case 5:
        case 9:
            return 0.51 * tileRadius
        case 6:
        case 8:
            return 0.58 * tileRadius
    }
}

export function tileNumberPosition(coord: Coordinate, number: ResourceTileNumber): Pixel {
    const center = tileCenter(coord)
    const size = tileNumberFontSize(number)

    const heightOffset = 0.2 * tileRadius

    return [center[0], center[1] + size / 2 + heightOffset]
}

export function crossingPosition(coord: Coordinate): Pixel {
    const yBaseline = (coord[1] * 1.5 + (coord[1] % 2 == 1 ? 0.5 : 0)) * tileRadius
    const yOffset = coord[0] % 2 == 1 ? 0 : (coord[1] % 2 == 1 ? -tileRadius / 2 : tileRadius / 2)
    return [tileWidth / 2 * coord[0], yBaseline + yOffset]
}

export function roadCenter(road: Road): Pixel {
    const cross1 = crossingPosition(road[0])
    const cross2 = crossingPosition(road[1])
    return middlepoint(cross1, cross2)
}

export function roadCorners(road: Road): Pixel[] {
    const roadLength = 0.8 * tileRadius
    const roadWidth = 0.1 * tileRadius

    const cross1 = crossingPosition(road[0])
    const cross2 = crossingPosition(road[1])
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

export const interactionPointRadius = tileRadius * 0.25
export const robberHeight = tileRadius * 0.7
export const robberWidth = tileRadius * 0.4
export const buildingHeight = tileRadius * 0.5
export const buildingWidth = tileRadius * 0.5


function segment(start: Pixel, end: Pixel, width: number): Pixel[] {
    const midpoint = middlepoint(start, end)
    const lengthVector = withLength([start[0] - midpoint[0], start[1] - midpoint[1]], distance(start, end) / 2)
    const widthVector =  withLength(perpendicular(lengthVector), width / 2)

    return [
        add(midpoint, lengthVector, widthVector),
        add(midpoint, opposite(lengthVector), widthVector),
        add(midpoint, opposite(lengthVector), opposite(widthVector)),
        add(midpoint, lengthVector, opposite(widthVector))
    ]
}

export function triangularPortPaths(portTile: PortTile & { coord: Coordinate }): Pixel[][] {
    const center = tileCenter(portTile.coord)
    const points = portPoints(portTile).map(x => crossingPosition(x))
    const width = tileRadius * 0.08
    const freeAtStart = 0.3
    const freeAtEnd = 0.2
    return points.map(target => {
        const middle = lerp(center, target, freeAtStart)
        const orth = withLength(perpendicular(add(center, opposite(middle))), width)
        const p1 = add(middle, orth)
        const p2 = add(middle, opposite(orth))
        const p3 = lerp(center, target, 1 - freeAtEnd)
        return [p1, p2, p3]
    })
}

export function segmentedPortPaths(portTile: PortTile & { coord: Coordinate }): Pixel[][] {
    const segments = Array.from(new Array(3).keys())
    const center = tileCenter(portTile.coord)
    const points = portPoints(portTile).map(x => crossingPosition(x))
    
    function segmentBounds(seg: number): [number, number] {
        const freeAtStart = 0.2
        const freeAtEnd = 0.2
        const freeBetween = 0.1
        const allFree = freeAtEnd + freeAtStart + freeBetween * (segments.length - 1)
        const segSize = (1 - allFree) / segments.length
        const segStart = freeAtStart + seg * (segSize + freeBetween)
        const segEnd = segStart + segSize
        return [segStart, segEnd]
    }

    return points.flatMap(target => 
        segments.map(seg => 
            segment(lerp(center, target, segmentBounds(seg)[0]), lerp(center, target, segmentBounds(seg)[1]), tileRadius * 0.1)
        )
    )
}
