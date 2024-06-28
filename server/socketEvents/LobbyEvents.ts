import { LobbyClientEventMap, LobbyServerEventMap, RoomId } from 'shared';
import { type Socket } from 'socket.io'
import { initializeGame, lobbies } from './RoomManager';
import { SocketDataType, SocketServerType } from './Common';

type LobbySocket = Socket<LobbyServerEventMap, LobbyClientEventMap, {}, SocketDataType>
export function acceptLobbyEvents(server: SocketServerType, socket: LobbySocket) {
    socket.on('startGame', cb => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        for (const room of lobbies()) {
            if (room.id == socket.data.room[0]) {
                if (room.owner.name == socket.data.user.name) {
                    initializeGame(server, room)
                    socket.in(room.id).emit('gameStarted')
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

        return
    })

    socket.on('changeSettings', (property, value, cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = lobbies().find(x => x.id == socket.data.room![0])
        if (room == undefined)
            return console.error(`invalid room: ${socket.data.room} from user ${socket.data.user}`)

        if (socket.data.user?.name != room.owner.name)
            return cb('not the owner')
        
        room.settings[property] = value
        socket.emit('settingsChange', room.settings)
        socket.to(socket.data.room[0]).emit('settingsChange', room.settings)
        return cb(true)
    })
}