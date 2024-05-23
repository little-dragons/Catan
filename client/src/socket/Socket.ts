import { isDevelopment, isProduction } from "@/misc/Globals"
import { SocketPort, type ClientEventMap, type GameClientEventMap, type GameServerEventMap, type LoginClientEventMap, type LoginServerEventMap, type RoomClientEventMap, type RoomServerEventMap, type ServerEventMap } from "shared"
import { io, Socket } from "socket.io-client"

let address: string = undefined!
if (isDevelopment)
    address = `http://localhost:${SocketPort}`
else if (isProduction)
    address = `https://ichigancs.com:${SocketPort}`

const fullSocket: Socket<ClientEventMap, ServerEventMap> = io(address)
export const gameSocket: Socket<GameClientEventMap, GameServerEventMap> = fullSocket
export const roomSocket: Socket<RoomClientEventMap, RoomServerEventMap> = fullSocket
export const loginSocket: Socket<LoginClientEventMap, LoginServerEventMap> = fullSocket
