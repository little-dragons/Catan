import { AuthToken } from "../authentication/AuthToken"
import { AnyLogin } from "../authentication/AuthObject"

export type ServerEventMap = GameServerEventMap & LoginServerEventMap

export type GameServerEventMap = {
    stateRequest: (id: AuthToken) => void
}

export type LoginServerEventMap = {
    login: (data: AnyLogin) => void
    logout: (id: AuthToken) => void
}