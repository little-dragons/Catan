import { AuthId } from "../authentication/AuthId"
import { GuestLogin, MemberLogin } from "../authentication/AuthObject"

export type ServerEventMap = {
    stateRequest: (id: AuthId) => void
    login: (data: MemberLogin | GuestLogin) => void
    logout: (id: AuthId) => void
}