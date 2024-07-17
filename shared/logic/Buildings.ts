import { Board, Coordinate, adjacentCrossings, adjacentRoads, allCrossingPositions, crossingAdjacentToLand, sameCoordinate, sameRoad} from "./Board";
import { Color } from "./Player";
import { Resource } from "./Resource";

export enum BuildingType {
    Settlement, City
}
export enum ConnectionType {
    Road
}

function crossingHasRequiredDistanceToAll(crossing: Coordinate, board: Board): boolean {
    function hasBuildingAt(coord: Coordinate) {
        return board.buildings.some(x => sameCoordinate(x[1], coord))
    }
    return !hasBuildingAt(crossing) && adjacentCrossings(crossing).every(cross => !hasBuildingAt(cross))
}

export function isAvailableBuildingPosition(crossing: Coordinate, board: Board, forPlayer: Color | undefined): boolean {
    const isFree = crossingAdjacentToLand(crossing, board) && crossingHasRequiredDistanceToAll(crossing, board)

    if (!isFree)
        return false

    if (forPlayer == undefined)
        return true
    
    return adjacentRoads(crossing).some(road => board.roads.some(built => sameRoad(road, built[1]) && built[0] == forPlayer))
}

export function availableBuildingPositions(board: Board, forPlayer: Color | undefined) {
    return allCrossingPositions(board).filter(x => isAvailableBuildingPosition(x, board, forPlayer))
}


export const roadCost: readonly Resource[] = [Resource.Lumber, Resource.Brick]
export const settlementCost: readonly Resource[] = [Resource.Lumber, Resource.Brick, Resource.Grain, Resource.Wool]
export const cityCost: readonly Resource[] = [Resource.Grain, Resource.Grain, Resource.Ore, Resource.Ore, Resource.Ore]

export function buildingCost(type: BuildingType) {
    switch (type) {
        case BuildingType.Settlement: return settlementCost
        case BuildingType.City: return cityCost
    }
}
export function connectionCost(type: ConnectionType) {
    switch (type) {
        case ConnectionType.Road: return roadCost
    }
}