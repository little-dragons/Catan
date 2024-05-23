import { User } from "../authentication/User"
import { Board } from "./Board"
import { Color, PrivatePlayer, PublicPlayer, redactPlayer } from "./Player"

export type PublicGameState = {
    board: Board,
    currentPlayer: Color,
    players: PublicPlayer[],
    dice: [number, number]
}

export type PrivateGameState = {
    board: Board,
    currentPlayer: Color,
    players: PrivatePlayer[],
    userMapping: [Color, User][],
    dice: [number, number]
}

export function redactGameState(state: PrivateGameState): PublicGameState {
    return {
        board: state.board,
        currentPlayer: state.currentPlayer,
        players: state.players.map(redactPlayer),
        dice: state.dice
    }
}

export function redactGameStateFor(state: PrivateGameState, color: Color): RedactedGameState {
    return {
        ...redactGameState(state),
        self: state.players.find(player => player.color == color)!
    }
}

export type RedactedGameState = PublicGameState & {
    self: PrivatePlayer
}