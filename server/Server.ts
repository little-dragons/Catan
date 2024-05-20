import { BuildingType, ClientEventMap, Color, ConnectionError, GuestLogin, MemberLogin, ServerEventMap, SocketPort, UserWithAuth, defaultBoard } from "shared"
import { Server } from "socket.io"
import { addGuest, checkUser, removeUser } from "./authentication/AuthIdMap"

const io = new Server<ServerEventMap, ClientEventMap, {}, UserWithAuth | 'anonymous'>(SocketPort, {
    cors: {
        origin: '*',
        allowedHeaders: ['Access-Control-Allow-Origin']
    }
})

console.log('Server is listening.')

const board = defaultBoard(0)
board.roads.push([Color.Red, [6,6], [7,6]])
board.buildings.push([Color.Green, [4,4], BuildingType.Settlement])

io
.on('connection', socket => {
    socket.on('login', request => {
        if (request.type == 'guest') {
            const id = addGuest(request)
            if (id == undefined)
                socket.emit('rejectLogin', 'name in use')
            else {
                const user: UserWithAuth = { isGuest: true, name: request.name, authId: id }
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

    socket.on('stateRequest', id => {
        if (!checkUser(id)) {
            socket.emit('rejectedRequestInvalidId')
            return
        }

        socket.emit('state', { board })
    })

    socket.on('disconnect', (reason, desc) => {
        if (socket.data != 'anonymous')
            removeUser(socket.data.authId)
    })
})