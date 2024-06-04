import { AuthToken, AuthUser, LoginClientEventMap, LoginServerEventMap, RoomId, validUsername } from 'shared';
import { type Socket } from 'socket.io'
import { addGuest, removeUser } from './AuthTokenMap';
import { leaveRoom } from '../rooms/RoomManager';

type LoginSocket = Socket<LoginServerEventMap, LoginClientEventMap, {}, { userToken?: AuthToken, roomId?: RoomId }>

export function logout(socket: LoginSocket) {
    if (socket.data.userToken == undefined)
        return

    if (socket.data.roomId != undefined)
        leaveRoom(socket, socket.data.roomId, socket.data.userToken)

    removeUser(socket.data.userToken)
}

export function acceptLoginEvents(socket: LoginSocket) {
    socket.on('login', request => {
        if (request.type == 'guest') {
            if (validUsername(request.name) != true) {
                socket.emit('rejectLogin', 'name not allowed')
                return
            }
            const token = addGuest(request)
            if (token == undefined)
                socket.emit('rejectLogin', 'name in use')
            else {
                const user: AuthUser = { isGuest: true, name: request.name, authToken: token }
                socket.data.userToken = token
                socket.emit('loggedIn', user)
            }
        }
        else if (request.type == 'member')
            socket.emit('rejectLogin', 'not implemented')
        else 
            socket.emit('rejectLogin', 'invalid auth object')
    })

    socket.on('logout', id => {
        logout(socket)
        socket.data = { }
    })
}