import { ClientEventMap, Color, PasswordNonce, RoomId, ServerEventMap, User } from "shared"
import { type Server } from 'socket.io'

export const isDevelopment = process.env.NODE_ENV == 'development'
export const isProduction = process.env.NODE_ENV == 'production'

if (!isDevelopment && !isProduction)
    console.error('NO ENVIRONMENT WAS GIVEN, CANNOT PROCEED')

export type SocketServerType = Server<ServerEventMap, ClientEventMap, {}, SocketDataType>
export type SocketDataType = 
    { user: User, room?: [RoomId, Color] } |
    { user: undefined, nonce?: PasswordNonce, room?: undefined }
    
