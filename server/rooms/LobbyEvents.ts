import { LobbyClientEventMap, LobbyServerEventMap } from 'shared';
import { type Socket } from 'socket.io'
import { getUser } from '../authentication/AuthTokenMap';
import { initializeGame, loobies } from './RoomManager';


export function acceptLobbyEvents(socket: Socket<LobbyServerEventMap, LobbyClientEventMap>) {
    socket.on('startGame', (roomId, token, cb) => {
        const user = getUser(token)
        if (user == undefined) {
            cb('invalid token')
            return
        }

        for (const room of loobies()) {
            if (room.id == roomId) {
                if (room.owner == user) {
                    initializeGame(room)
                    socket.in(roomId).emit('gameStarted')
                    socket.emit('gameStarted')
                    cb(true)
                    return
                }
                else {
                    cb('not the owner')
                    return
                }
            }
        }

        cb('no such room id')
        return
    })
}