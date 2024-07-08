import { List } from "immutable";
import { Board, Coordinate, adjacentCrossings, adjacentRoads, allCrossingPositions, crossingAdjacentToLand, sameRoad} from "./Board";
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
        return board.buildings.some(x => x[1][0] == coord[0] && x[1][1] == coord[1])
    }
    return !hasBuildingAt(crossing) && adjacentCrossings(crossing).every(cross => !hasBuildingAt(cross))
}

export function isAvailableBuildingPosition(crossing: Coordinate, board: Board, forPlayer: Color | undefined): boolean {
    const freeSpots = crossingAdjacentToLand(crossing, board) && crossingHasRequiredDistanceToAll(crossing, board)
    if (forPlayer == undefined)
        return freeSpots
    
    return adjacentRoads(crossing).some(road => board.roads.some(built => sameRoad(road, built[1]) && built[0] == forPlayer))
}

export function availableBuildingPositions(board: Board, forPlayer: Color | undefined) {
    return allCrossingPositions(board).filter(x => isAvailableBuildingPosition(x, board, forPlayer))
}


export const roadCost = List([Resource.Lumber, Resource.Brick])
export const settlementCost = List([Resource.Lumber, Resource.Brick, Resource.Grain, Resource.Wool])
export const cityCost = List([Resource.Grain, Resource.Grain, Resource.Ore, Resource.Ore, Resource.Ore])

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