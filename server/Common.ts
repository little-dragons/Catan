import { AuthToken, RoomId } from "shared"

export const isDevelopment = process.env.NODE_ENV == 'development'
export const isProduction = process.env.NODE_ENV == 'production'

if (!isDevelopment && !isProduction)
    console.error('NO ENVIRONMENT WAS GIVEN, CANNOT PROCEED')

export type DataType = { userToken?: AuthToken, roomId?: RoomId }