import { Board, Coordinate, adjacentCrossings, adjacentRoads, allCrossings, crossingAdjacentToLand, sameCoordinate, sameRoad} from "./Board";
import { Color } from "./Player";

export enum BuildingType {
    Settlement, City
}
export enum ConnectionType {
    Road
}

function crossingHasRequiredDistanceToAll(crossing: Coordinate, board: Board): boolean {
    function hasBuildingAt(coord: Coordinate) {
        return board.buildings.some(x => sameCoordinate(x.coord, coord))
    }
    return !hasBuildingAt(crossing) && adjacentCrossings(crossing).every(cross => !hasBuildingAt(cross))
}

/**
 * Returns either all free crossings or only those reachable by the rules (that means connected by roads) for a given color.
 * @param crossing 
 * @param board 
 * @param forPlayer Can be undefiend to not filter any crossings. If a color is given, the list might be empty if no settlement can be built.
 * @returns 
 */
export function isAvailableBuildingPosition(crossing: Coordinate, board: Board, forPlayer: Color | undefined): boolean {
    const isFree = crossingAdjacentToLand(crossing, board) && crossingHasRequiredDistanceToAll(crossing, board)

    if (!isFree)
        return false

    if (forPlayer == undefined)
        return true
    
    return adjacentRoads(crossing).some(road => board.roads.some(built => sameRoad(road, built.coord) && built.color == forPlayer))
}

export function availableBuildingPositions(board: Board, forPlayer: Color | undefined) {
    return allCrossings(board).filter(x => isAvailableBuildingPosition(x, board, forPlayer))
}

