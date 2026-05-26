import type { Color, GameClientEventMap, GameServerEventMap, QueryServerEventMap, RoomId, User } from "catan-shared"
import type { Namespace, Socket } from 'socket.io'

export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

if (!isDevelopment && !isProduction)
    console.error('NO ENVIRONMENT WAS GIVEN, CANNOT PROCEED')

export type GameSocketDataType = {
    sessionID: string
    user: User
    roomID: RoomId,
    color: Color
    /**
     * For the purpose of this, see the current room creation flow.
     */
    pendingRoomNameRequest: string | undefined
}

export type GameNamespace = Namespace<GameServerEventMap, GameClientEventMap, object & {}, GameSocketDataType>
export type GameSocket = Socket<GameServerEventMap, GameClientEventMap, object & {}, GameSocketDataType>
export type QueryNamespace = Namespace<QueryServerEventMap, object & {}, object & {}, object & {}>
