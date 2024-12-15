import { Board, Coordinate, sameCoordinate, isLandTile, allCrossings, CoordinateTile, adjacentCrossings, crossingAdjacentToTile } from "./Board.js"
import { MinimalGameState } from "./GameState.js"
import { Color } from "./Player.js"

export function validNewRobberPosition(board: Board, robberPositon: Coordinate): boolean {
    if (sameCoordinate(board.robber, robberPositon))
        return false

    return board.tiles.some(tile => sameCoordinate(tile.coord, robberPositon) && isLandTile(tile))
}

export function validNewRobberPositions(board: Board): CoordinateTile[] {
    return board.tiles.filter(x => validNewRobberPosition(board, x.coord))
}



export function robbableCrossingsForColor(state: MinimalGameState, tileCoord: Coordinate, color: Color): Coordinate[] {
    const player = state.players.find(x => x.color == color)
    if (player == undefined)
        return []

    if (player.color == state.currentPlayer || player.handCardsCount == 0)
        return []

    return state.board.buildings
        .filter(x => x.color == player.color && crossingAdjacentToTile(x.coord, tileCoord))
        .map(x => x.coord)
}


export function allRobbableCrossings(state: MinimalGameState, tileCoord: Coordinate): ReadonlyMap<Color, Coordinate[]> {
    return new Map(state.players
        .map(x => [x.color, robbableCrossingsForColor(state, tileCoord, x.color)] as [Color, Coordinate[]])
        .filter(([_, coords]) => coords.length > 0)
    )
}
