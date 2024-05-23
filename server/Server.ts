import { BuildingType, ClientEventMap, Color, ServerEventMap, SocketPort, AuthUser, defaultBoard } from "shared"
import { Server } from "socket.io"
import { addGuest, checkUser, removeUser } from "./authentication/AuthTokenMap"
import { createServer, Server as HttpsServer } from 'https'
import { readFileSync } from  'fs'
import { acceptRoomEvents } from "./rooms/Rooms"
import { acceptGameEvents } from "./rooms/Games"


let httpsServer: HttpsServer<any, any> = undefined!
if (process.env.NODE_ENV == 'development')
    httpsServer = createServer()
else if (process.env.NODE_ENV == 'production')
    httpsServer = createServer({
        key: readFileSync(`${process.env.SSL_DIR}/privkey.pem`),
        cert: readFileSync(`${process.env.SSL_DIR}/fullchain.pem`)
    })
else
    console.error('NO ENVIRONMENT WAS GIVEN, CANNOT PROCEED')

const io = new Server<ServerEventMap, ClientEventMap, {}, AuthUser | 'anonymous'>(httpsServer, {
    cors: {
        origin: '*',
        allowedHeaders: ['Access-Control-Allow-Origin']
    },
    
})

if (process.env.NODE_ENV == 'development')
    io.listen(SocketPort)
else if (process.env.NODE_ENV == 'production')
    httpsServer.listen(SocketPort)

console.log(`Server is listening on port ${SocketPort}`)


io
.on('connection', socket => {
    socket.on('login', request => {
        if (request.type == 'guest') {
            const token = addGuest(request)
            if (token == undefined)
                socket.emit('rejectLogin', 'name in use')
            else {
                const user: AuthUser = { isGuest: true, name: request.name, authToken: token }
                socket.data = user
                socket.emit('loggedIn', user)
            }
        }
        else if (request.type == 'member')
            socket.emit('rejectLogin', 'not implemented')
        else 
            socket.emit('rejectLogin', 'invalid auth object')
    })

    socket.on('logout', id => {
        removeUser(id)
    })

    acceptRoomEvents(socket)
    acceptGameEvents(socket)

    socket.on('disconnect', (reason, desc) => {
        if (socket.data != 'anonymous')
            removeUser(socket.data.authToken)
    })
})