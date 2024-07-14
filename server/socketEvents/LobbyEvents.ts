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
            if (room.id != socket.data.room[0]) 
                continue
            
            if (room.owner.name != socket.data.user.name)
                return cb('not the owner') 
            
            initializeGame(server, room)
            socket.in(room.id).emit('gameStarted')
            socket.emit('gameStarted')
            return cb(true)
        }

        // room not found? Should not happen
        console.warn(`The room ${socket.data.room[0]} was stored in a socket, but did not actually exist on the server.`)
        return cb('invalid socket state')
    })

    socket.on('changeSettings', (property, value, cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = lobbies().find(x => x.id == socket.data.room![0])
        if (room == undefined) {
            console.error(`invalid room: ${socket.data.room} from user ${socket.data.user}`)
            return cb('invalid socket state')
        }

        if (socket.data.user?.name != room.owner.name)
            return cb('not the owner')
        
        room.settings[property] = value
        socket.emit('settingsChange', room.settings)
        socket.to(socket.data.room[0]).emit('settingsChange', room.settings)
        return cb(true)
    })
}