import { AuthUser, LoginClientEventMap, LoginServerEventMap } from 'shared';
import { type Socket } from 'socket.io'
import { addGuest, removeUser } from './AuthTokenMap';

export function acceptLoginEvents(socket: Socket<LoginServerEventMap, LoginClientEventMap, {}, AuthUser | 'anonymous'>) {
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
        socket.data = 'anonymous'
    })
}