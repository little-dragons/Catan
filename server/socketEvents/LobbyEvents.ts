import { allColors, LobbyClientEventMap, LobbyServerEventMap, RoomId } from 'catan-shared';
import { type Socket } from 'socket.io'
import { initializeGame, lobbyRoomFor, participantsForRoom } from './RoomManager';
import { SocketDataType, SocketServerType } from './Common';
import { BotPersonality } from 'shared/logic/Bots';

type LobbySocket = Socket<LobbyServerEventMap, LobbyClientEventMap, {}, SocketDataType>
export function acceptLobbyEvents(server: SocketServerType, socket: LobbySocket) {
    socket.on('startGame', async cb => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = lobbyRoomFor(socket.data.room[0])
        if (room == undefined)
            return cb('invalid socket state')
        
        if (room.owner.name != socket.data.user.name)
            return cb('not the owner') 
        
        const res = await initializeGame(server, room)
        if (res == 'could not generate state')
            return cb('generation error')
        if (res == 'no correct room')
            return cb('invalid socket state')

        const _: true = res
        socket.in(room.id).emit('gameStarted')
        socket.emit('gameStarted')
        return cb(true)
    })


    socket.on('changeSettings', (property, value, cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = lobbyRoomFor(socket.data.room![0])
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