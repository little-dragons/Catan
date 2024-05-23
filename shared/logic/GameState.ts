import { User } from "../authentication/User"
import { Board } from "./Board"
import { Color, PrivatePlayer, PublicPlayer, redactPlayer } from "./Player"

export type PublicGameState = {
    board: Board,
    currentPlayer: Color,
    players: PublicPlayer[],
}

export type PrivateGameState = {
    board: Board,
    currentPlayer: Color,
    players: PrivatePlayer[],
    userMapping: [Color, User][]
}

export function redactGameState(state: PrivateGameState): PublicGameState {
    return {
        board: state.board,
        currentPlayer: state.currentPlayer,
        players: state.players.map(redactPlayer)
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