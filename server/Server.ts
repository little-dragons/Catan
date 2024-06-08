import { ClientEventMap, ServerEventMap, SocketPort, AuthUser, AuthToken, RoomId } from "shared"
import { Server } from "socket.io"
import { removeUser } from "./authentication/AuthTokenMap"
import { createServer, Server as HttpsServer } from 'https'
import { readFileSync } from  'fs'
import { acceptLobbyEvents } from "./rooms/LobbyEvents"
import { acceptGameEvents } from "./rooms/GameEvents"
import { acceptRoomEvents, leaveRoom } from "./rooms/RoomManager"
import { acceptLoginEvents, logout } from "./authentication/LoginEvents"
import { instrument } from "@socket.io/admin-ui"
import { DataType, isDevelopment, isProduction } from "./Common"
import { db } from "./database/Connection"


let httpsServer: HttpsServer<any, any> = undefined!
if (isDevelopment)
    httpsServer = createServer()
else if (isProduction)
    httpsServer = createServer({
        key: readFileSync(`${process.env.SSL_DIR}/privkey.pem`),
        cert: readFileSync(`${process.env.SSL_DIR}/fullchain.pem`)
    })

const io = new Server<ServerEventMap, ClientEventMap, {}, DataType>(httpsServer, {
    cors: {
        origin: [ 'https://admin.socket.io', 'http://localhost:5173', 'https://ichigancs.com:5173', 'http://127.0.0.1:5173' ],
        allowedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
        credentials: true
    }    
})

if (isDevelopment)
    instrument(io, {
        auth: false,
        mode: 'development'
    })
if (isProduction && process.env.SOCKET_ADMIN_AUTH)
    instrument(io, {
        auth: {
            type: 'basic',
            username: readFileSync(`${process.env.SOCKET_ADMIN_AUTH}/username.txt`).toString(),
            password: readFileSync(`${process.env.SOCKET_ADMIN_AUTH}/password.txt`).toString()
        },
        mode: 'production'
    })

if (isDevelopment)
    io.listen(SocketPort)
else if (isProduction)
    httpsServer.listen(SocketPort)

console.log(`Server is listening on port ${SocketPort}`)
async function printMemberCount() {
    const promise = await db.selectFrom('members').select(({ fn }) => fn.countAll().as("total_count")).execute()
    console.log(`Currently with ${promise[0].total_count} member(s)`)
}
printMemberCount()

io.on('connection', socket => {
   
    acceptLoginEvents(socket)
    acceptRoomEvents(socket)
    acceptLobbyEvents(socket)
    acceptGameEvents(socket)

    socket.on('disconnect', (reason, desc) => {
        logout(socket)
    })
})