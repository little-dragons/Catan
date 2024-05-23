import { RoomServerEventMap, Room, RoomClientEventMap } from 'shared';
import { type Socket } from 'socket.io'
import { getUser } from '../authentication/AuthTokenMap';
import { initializeGame } from './Games';
import { v4 as uuidv4 } from 'uuid';


const rooms = [] as Room[]

export function acceptRoomEvents(socket: Socket<RoomServerEventMap, RoomClientEventMap>) {
    socket.on('roomList', cb => {
        cb(rooms)
    })
    socket.on('createAndJoin', (name, token, cb) => {
        const user = getUser(token)
        if (user == undefined) {
            cb('invalid token')
            return
        }
        const room: Room = {
            name: name,
            id: uuidv4(),
            users: [user],
            owner: user
        }
        rooms.push(room)
        cb(room)
    })
    socket.on('join', (roomId, userToken, cb) => {
        const user = getUser(userToken)
        if (user == undefined) {
            cb('invalid token')
            return
        }

        for (const room of rooms) {
            if (room.id == roomId) {
                room.users.push(user)
                socket.join(roomId)
                cb(room)
                return
            }
        }

        cb('no such room id')
    })
    socket.on('leave', (room, token, cb) => {
        const user = getUser(token)
        if (user == undefined) {
            cb('invalid token')
            return
        }

        socket.leave(room)
        cb(true)
    })
    socket.on('startGame', (roomId, token, cb) => {
        const user = getUser(token)
        if (user == undefined) {
            cb('invalid token')
            return
        }

        for (const room of rooms) {
            if (room.id == roomId) {
                if (room.owner == user) {
                    rooms.splice(rooms.indexOf(room), 1)
                    initializeGame(room)
                    socket.in(roomId).emit('gameStarted', room.id)
                    cb(true)
                    return
                }
            }
        }

        cb('no such room id')
        return
    })
}