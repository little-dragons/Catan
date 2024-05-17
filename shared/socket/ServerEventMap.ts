import { AuthId } from "../authentication/AuthId"

export type ServerEventMap = {
    stateRequest: (id: AuthId) => void
}