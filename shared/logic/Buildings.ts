import { Board, Coordinate } from "./Board";
import { Color } from "./Player";

export enum BuildingType {
    Settlement, City
}


function crossingAdjacentToTile(crossing: Coordinate, tile: Coordinate): boolean {
    const xCorrection = tile[1] % 2 == 0 ? 0 : 1
    const xBase = tile[0] * 2 + xCorrection
    const allowedX = [xBase, xBase + 1, xBase + 2]
    const allowedY = [tile[1], tile[1] + 1]
    return allowedX.includes(crossing[0]) && allowedY.includes(crossing[1])
}

function crossingAdjacentToLand(crossing: Coordinate, board: Board): boolean {
    return board.tiles.filter(x => x[0].type == 'desert' || x[0].type == 'resource').some(x => crossingAdjacentToTile(crossing, x[1]))
}



function adjacentCrossings(crossing: Coordinate): Coordinate[] {
    //TODO generated positions may be negative or otherwise out of bounds
    const left: Coordinate = [crossing[0] - 1, crossing[1]]
    const right: Coordinate = [crossing[0] + 1, crossing[1]]

    function logicalXor(a: boolean, b: boolean) {
        return a && !b || b && !a
    }
    const goingUp = logicalXor(crossing[0] % 2 == 0, crossing[1] % 2 == 0)
    const vertical: Coordinate = [crossing[0], crossing[1] + (goingUp ? -1 : 1)]
    return [left, right, vertical]
}

export function adjacentRoads(crossing: Coordinate): [Coordinate, Coordinate][] {
    return adjacentCrossings(crossing).map(other => [crossing, other])
}

function crossingHasRequiredDistanceToAll(crossing: Coordinate, board: Board): boolean {
    function hasBuildingAt(coord: Coordinate) {
        return board.buildings.some(x => x[1][0] == coord[0] && x[1][1] == coord[1])
    }
    return !hasBuildingAt(crossing) && adjacentCrossings(crossing).every(cross => !hasBuildingAt(cross))
}

export function isAvailableBuildingPosition(crossing: Coordinate, board: Board, forPlayer: Color | undefined): boolean {
    return crossingAdjacentToLand(crossing, board) && crossingHasRequiredDistanceToAll(crossing, board)
    // TODO road connection, initial placement ?
}

export function availableBuildingPositions(board: Board, forPlayer: Color | undefined) {
    const allPositions: Coordinate[] = []
    for (let col = 0; col < 2 * board.columnCount + 2; col++)
        for (let row = 0; row < board.rowCount + 1; row++)
            allPositions.push([col, row])

    return allPositions.filter(x => isAvailableBuildingPosition(x, board, forPlayer))
}