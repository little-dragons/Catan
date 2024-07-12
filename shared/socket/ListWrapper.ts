import { List } from "immutable"
import { RedactedGameState } from "../logic/GameState"
import { LobbyRoom, RedactedGameRoom } from "../logic/Room"

type ReplaceList<ObjectProp> = 
    ObjectProp extends List<infer R> ? R[] : 
    ObjectProp extends object ? ImmutableToNative<ObjectProp> : ObjectProp

export type ImmutableToNative<Object extends object> = {
    [Prop in keyof Object]: ReplaceList<Object[Prop]>
}


export function nativeState(state: RedactedGameState): ImmutableToNative<RedactedGameState> {
    return {
        currentPlayer: state.currentPlayer,
        phase: state.phase,
        self: {
            color: state.self.color,
            handCards: state.self.handCards.toArray()
        },
        players: state.players.toArray(),
        board: {
            ...state.board,
            buildings: state.board.buildings.toArray(),
            roads: state.board.roads.toArray(),
            tiles: state.board.tiles.toArray()
        }
    }
}

export function nativeGame(room: RedactedGameRoom): ImmutableToNative<RedactedGameRoom> {
    return {
        ...room,
        state: nativeState(room.state),
        users: room.users.toArray()
    }
}

export function nativeLobby(room: LobbyRoom): ImmutableToNative<LobbyRoom> {
    return {
        ...room,
        users: room.users.toArray()
    }
}

export function immutableState(state: ImmutableToNative<RedactedGameState>): RedactedGameState {
    return {
        currentPlayer: state.currentPlayer,
        phase: state.phase,
        board: {
            ...state.board,
            buildings: List(state.board.buildings),
            roads: List(state.board.roads),
            tiles: List(state.board.tiles)
        },
        self: {
            color: state.self.color,
            handCards: List(state.self.handCards)
        },
        players: List(state.players)
    }
}

export function immutableGame(room: ImmutableToNative<RedactedGameRoom>): RedactedGameRoom {
    return {
        ...room,
        state: immutableState(room.state),
        users: List(room.users)
    }
}

export function immutableLobby(room: ImmutableToNative<LobbyRoom>): LobbyRoom {
    return {
        ...room,
        users: List(room.users)
    }
}