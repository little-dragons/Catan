import { type Board, type Coordinate, sameCoordinate, isLandTile, crossingAdjacentToTile, adjacentCrossings, adjacentBuildingsToTile } from "./Board"
import { type PublicGameState } from "./GameState"
import { Color } from "./Player"

export function isNewRobberPosition(board: Board, robberPositon: Coordinate): boolean {
    if (sameCoordinate(board.robber, robberPositon))
        return false

    return board.tiles.some(tile => sameCoordinate(tile.coord, robberPositon) && isLandTile(tile))
}

export function newRobberPositions(board: Board): Coordinate[] {
    return board.tiles.filter(x => isNewRobberPosition(board, x.coord))
                      .map(x => x.coord)
}


/**
 * Calculates which crossings can be robbed. Respects if a player has handcards.
 * @param tile The assumed new position of the robber.
 * @param except A color to exclude, e.g. the current player
 * @returns A tuple for each robbable crossing.
 */
export function robbableCrossings(state: PublicGameState, tile: Coordinate, except: Color | undefined): [Color, Coordinate][] {
    const buildings = adjacentBuildingsToTile(state.board, tile)
                      .map<[Color, Coordinate]>(x => [x.color, x.coord])


    const robbablePlayers = state.players.filter(x => x.handCardsCount > 0)
                                         .map(x => x.color)

    const result = buildings.filter(x => robbablePlayers.includes(x[0]))


    if (except == undefined)
        return result
    else
        return result.filter(x => x[0] != except)
}

/**
 * Calculates which crossings can be robbed. Respects if a player has handcards. Excludes the currently active player to not rob himself.
 * See {@link robbableCrossings}.
 */
export function robbableCrossingsExceptCurrent(state: PublicGameState, tile: Coordinate): [Color, Coordinate][] {
    return robbableCrossings(state, tile, state.currentPlayer)
}
