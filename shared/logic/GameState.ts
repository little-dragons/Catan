import { Board } from "./Board"
import { Color, FullPlayer, RedactedPlayer, redactPlayer } from "./Player"

export type PublicGameState = {
    board: Board,
    currentPlayer: Color,
    players: RedactedPlayer[],
    dice: [number, number]
}
export type RedactedGameState = PublicGameState & {
    self: FullPlayer
}

export type FullGameState = {
    board: Board,
    currentPlayer: Color,
    players: FullPlayer[],
    dice: [number, number]
}

export function redactGameState(state: FullGameState): PublicGameState {
    return {
        board: state.board,
        currentPlayer: state.currentPlayer,
        players: state.players.map(redactPlayer),
        dice: state.dice
    }
}

export function redactGameStateFor(state: FullGameState, color: Color): RedactedGameState {
    return {
        ...redactGameState(state),
        self: state.players.find(player => player.color == color)!
    }
}
