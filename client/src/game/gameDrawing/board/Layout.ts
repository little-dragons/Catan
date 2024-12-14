import { neighborTile, Orientation, portPoints, type Board, type Coordinate, type PortTile, type Road } from "shared"
import { add, distance, lerp, middlepoint, opposite, perpendicular, withLength } from "../Vector"

type Pixel = [number, number]

export function minimalFillingTileRadius(board: Board, width: number, height: number): number {
    return Math.min(width / (2 * (board.columnCount + 0.5) * Math.cos(30 / 180 * Math.PI)), height / (board.rowCount * 1.5 + 0.5))
}

function tileWidth(radius: number): number {
    const halfTileWidth = radius * Math.cos(30 / 180 * Math.PI)
    return 2 * halfTileWidth
}
export function tileCenter(coord: Coordinate, radius: number): Pixel {
    const fullTileWidth = tileWidth(radius)
    const halfTileWidth = fullTileWidth / 2
    const firstMiddlePointInRowOffset = coord[1] % 2 == 0 ? halfTileWidth : fullTileWidth

    return [firstMiddlePointInRowOffset + coord[0] * fullTileWidth, radius + coord[1] * radius * 1.5]
}



export function tileHexagon(coord: Coordinate, tileRadius: number): Pixel[] {
    const center = tileCenter(coord, tileRadius)
    let points: Pixel[] = []
    for (let corner = 0; corner < 6; corner++) {
        const angle = (corner / 6) * 2 * Math.PI
        points.push([Math.sin(angle) * tileRadius + center[0], Math.cos(angle) * tileRadius + center[1]])
    }

    return points
}


export function tileResourceIconSize(tileRadius: number): [number, number] {
    return [0.6 * tileRadius, 0.5 * tileRadius]
}

export function tileResourceIconPosition(coord: Coordinate, tileRadius: number) : Pixel {
    const center = tileCenter(coord, tileRadius)
    const size = tileResourceIconSize(tileRadius)
    const heightOffset = -0.4 * tileRadius

    return [center[0] - size[0] / 2, center[1] - size[1] / 2 + heightOffset]
}


export function tilePortIconSize(tileRadius: number): [number, number] {
    return [0.7 * tileRadius, tileRadius]
}

export function tilePortPosition(coord: Coordinate, tileRadius: number): Pixel { 
    const center = tileCenter(coord, tileRadius)
    const size = tilePortIconSize(tileRadius)
    const widthOffset = 0.05 * size[0]

    return [center[0] - size[0] / 2 + widthOffset, center[1] - size[1] / 2]
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

export function tileNumberPosition(coord: Coordinate, number: number, tileRadius: number): Pixel | undefined {
    const center = tileCenter(coord, tileRadius)
    const size = tileNumberFontSize(number, tileRadius)

    if (size == undefined)
        return undefined

    const heightOffset = 0.2 * tileRadius

    return [center[0], center[1] + size / 2 + heightOffset]
}

export function crossingPosition(coord: Coordinate, radius: number): Pixel {
    const yBaseline = (coord[1] * 1.5 + (coord[1] % 2 == 1 ? 0.5 : 0)) * radius
    const yOffset = coord[0] % 2 == 1 ? 0 : (coord[1] % 2 == 1 ? -radius / 2 : radius / 2)
    return [tileWidth(radius) / 2 * coord[0], yBaseline + yOffset]
}

export function roadCenter(road: Road, radius: number): Pixel {
    const cross1 = crossingPosition(road[0], radius)
    const cross2 = crossingPosition(road[1], radius)
    return middlepoint(cross1, cross2)
}

export function roadCorners(road: Road, radius: number): Pixel[] {
    const roadLength = 0.8 * radius
    const roadWidth = 0.1 * radius

    const cross1 = crossingPosition(road[0], radius)
    const cross2 = crossingPosition(road[1], radius)
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

export function robberHeight(tileRadius: number) {
    return tileRadius * 0.7;
}

export function robberWidth(tileRadius: number) {
    return tileRadius * 0.4;
}

export function buildingHeight(tileRadius: number) {
    return tileRadius * 0.5;
}

export function buildingWidth(tileRadius: number) {
    return tileRadius * 0.5;
}


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

export function triangularPortPaths(portTile: PortTile & { coord: Coordinate }, tileRadius: number): Pixel[][] {
    const center = tileCenter(portTile.coord, tileRadius)
    const points = portPoints(portTile).map(x => crossingPosition(x, tileRadius))
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

export function segmentedPortPaths(portTile: PortTile & { coord: Coordinate }, tileRadius: number): Pixel[][] {
    const segments = Array.from(new Array(3).keys())
    const center = tileCenter(portTile.coord, tileRadius)
    const points = portPoints(portTile).map(x => crossingPosition(x, tileRadius))
    
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
