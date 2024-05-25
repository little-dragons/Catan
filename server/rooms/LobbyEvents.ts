import { AuthToken, LobbyClientEventMap, LobbyServerEventMap, RoomId } from 'shared';
import { type Socket } from 'socket.io'
import { checkRealUser, getUser } from '../authentication/AuthTokenMap';
import { initializeGame, lobbies } from './RoomManager';
import { Settings } from 'shared/logic/Settings';


type LobbySocket = Socket<LobbyServerEventMap, LobbyClientEventMap>
function changeSettings<Property extends keyof Settings>(socket: LobbySocket, roomId: RoomId, token: AuthToken, property: Property, value: Settings[Property]) {
    const room = lobbies().find(x => x.id == roomId)
    if (room == undefined)
        return 'invalid room id'

    if (!checkRealUser(token, room.owner.name))
        return 'not the owner'
    
    room.settings[property] = value
    socket.emit('settingsChange', room.settings)
    socket.to(roomId).emit('settingsChange', room.settings)
    return true
}

export function acceptLobbyEvents(socket: LobbySocket) {
    socket.on('startGame', (roomId, token, cb) => {
        const user = getUser(token)
        if (user == undefined) {
            cb('invalid token')
            return
        }

        for (const room of lobbies()) {
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

    socket.on('changeSettings', (roomId, token, setting, value, cb) => {
        cb(changeSettings(socket, roomId, token, setting, value))
    })
}