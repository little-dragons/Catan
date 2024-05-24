import { ClientEventMap, ServerEventMap, SocketPort, AuthUser } from "shared"
import { Server } from "socket.io"
import { addGuest, removeUser } from "./authentication/AuthTokenMap"
import { createServer, Server as HttpsServer } from 'https'
import { readFileSync } from  'fs'
import { acceptLobbyEvents } from "./rooms/LobbyEvents"
import { acceptGameEvents } from "./rooms/GameEvents"
import { acceptRoomEvents } from "./rooms/RoomManager"
import { acceptLoginEvents } from "./authentication/LoginEvents"
import { instrument } from "@socket.io/admin-ui"


const isDevelopment = process.env.NODE_ENV == 'development'
const isProduction = process.env.NODE_ENV == 'production'

let httpsServer: HttpsServer<any, any> = undefined!
if (isDevelopment)
    httpsServer = createServer()
else if (isProduction)
    httpsServer = createServer({
        key: readFileSync(`${process.env.SSL_DIR}/privkey.pem`),
        cert: readFileSync(`${process.env.SSL_DIR}/fullchain.pem`)
    })
else
    console.error('NO ENVIRONMENT WAS GIVEN, CANNOT PROCEED')

const io = new Server<ServerEventMap, ClientEventMap, {}, AuthUser | 'anonymous'>(httpsServer, {
    cors: {
        origin: [ 'https://admin.socket.io', 'http://localhost:5173' ],
        allowedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
        credentials: true
    },
    
})

if (isDevelopment)
    instrument(io, {
        auth: false,
        mode: 'development'
    })

if (isDevelopment)
    io.listen(SocketPort)
else if (isProduction)
    httpsServer.listen(SocketPort)

console.log(`Server is listening on port ${SocketPort}`)


io.on('connection', socket => {
   
    acceptLoginEvents(socket)
    acceptRoomEvents(socket)
    acceptLobbyEvents(socket)
    acceptGameEvents(socket)

    socket.on('disconnect', (reason, desc) => {
        if (socket.data != 'anonymous')
            removeUser(socket.data.authToken)
    })
})