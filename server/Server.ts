import { ClientEventMap, ServerEventMap, SocketPort } from "shared"
import { Server } from "socket.io"
import { createServer, Server as HttpsServer } from 'https'
import { readFileSync } from  'fs'
import { acceptLobbyEvents } from "./socketEvents/LobbyEvents.js"
import { acceptGameEvents } from "./socketEvents/GameEvents.js"
import { acceptRoomEvents } from "./socketEvents/RoomManager.js"
import { instrument } from "@socket.io/admin-ui"
import { SocketDataType, SocketServerType, isDevelopment, isProduction } from "./socketEvents/Common.js"
import { db } from "./database/Connection.js"
import { acceptLoginEvents } from "./socketEvents/LoginEvents.js"


let httpsServer: HttpsServer<any, any> = undefined!
if (isDevelopment)
    httpsServer = createServer()
else if (isProduction)
    httpsServer = createServer({
        key: readFileSync(`${process.env.SSL_DIR}/privkey.pem`),
        cert: readFileSync(`${process.env.SSL_DIR}/fullchain.pem`)
    })

const io: SocketServerType = new Server<ServerEventMap, ClientEventMap, {}, SocketDataType>(httpsServer, {
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
   
    acceptLoginEvents(io, socket)
    acceptRoomEvents(io, socket)
    acceptLobbyEvents(io, socket)
    acceptGameEvents(io, socket)

    socket.on('disconnect', (reason, desc) => {
        // TODO potentially delete some data? leave room?
        // maybe call the logout method?
        socket.data = { user: undefined }
    })
})