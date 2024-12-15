import { Board, Coordinate, adjacentCrossings, adjacentRoads, allCrossings, crossingAdjacentToLand, sameCoordinate, sameRoad} from "./Board.js";
import { Color } from "./Player.js";
import { Resource } from "./Resource.js";

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