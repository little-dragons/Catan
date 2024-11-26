import { LobbyRoom, RedactedGameRoom, RoomId } from "../logic/Room.js"
import { RedactedGameState } from "../logic/GameState.js"
import { Settings } from "../logic/Settings.js"
import { GameActionInput } from "../logic/GameAction.js"
import { User } from "../authentication/User.js"
import { PasswordNonce } from "../authentication/Password.js"

export type GuestLoginError = 'name in use' | 'name not allowed'
export type MemberLoginError = 'invalid password' | 'name unknown' | 'already logged in'
export type LoginError = 
    GuestLoginError | MemberLoginError | 'invalid socket state'

export type ServerEventMap = LoginServerEventMap & RoomServerEventMap & GameServerEventMap & LobbyServerEventMap

type Callback<T> = (arg: T) => void

export type GameServerEventMap = {
    fullGameRoom: (cb: Callback<RedactedGameRoom | 'invalid socket state'>) => void
    gameState: (cb: Callback<RedactedGameState | 'invalid socket state'>) => void
    gameAction: (action: GameActionInput, cb: Callback<true | 'invalid socket state' | 'action not allowed'>) => void
}

export type RoomServerEventMap = {
    lobbyList: (cb: Callback<LobbyRoom[]>) => void
    createAndJoin: (roomName: string, cb: Callback<LobbyRoom | 'room name in use' | 'invalid socket state'>) => void
    join: (roomId: RoomId, cb: Callback<LobbyRoom | 'invalid room id' | 'invalid socket state'>) => void
    leave: (cb: Callback<true | 'invalid socket state'>) => void
}

export type LobbyServerEventMap = {
    startGame: (cb: Callback<true | 'invalid socket state' | 'not the owner'>) => void
    changeSettings: <Property extends keyof Settings>(
        setting: Property,
        value: Settings[Property],
        cb: Callback<true | 'invalid socket state' | 'not the owner' |'room is ingame'>) => void
}

export type LoginServerEventMap = {
    guestLogin: (name: string, cb: Callback<true | 'invalid socket state' | 'name in use' | 'name not allowed'>) => void

    registerMember: (name: string, password: string, cb: Callback<true | 'invalid socket state' | 'name in use' | 'name not allowed'>) => void
    requestMemberLoginData: (name: string, cb: Callback<PasswordNonce | 'invalid socket state' | 'name unknown' | 'already logged in'>) => void
    memberLogin: (name: string, password: string, nonce: PasswordNonce, cb: Callback<true | 'invalid socket state' | 'invalid nonce' | 'name unknown' | 'invalid password'>) => void

    logout: (cb: Callback<true | 'invalid socket state'>) => void

    socketState: (cb: Callback<{ user?: User, roomId?: RoomId }>) => void
}
