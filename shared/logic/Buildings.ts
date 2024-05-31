import { Board, Coordinate, adjacentCrossings, crossingAdjacentToLand} from "./Board";
import { Color } from "./Player";

export enum BuildingType {
    Settlement, City
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
