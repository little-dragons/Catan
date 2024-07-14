import { GameClientEventMap, GameServerEventMap, nativeGame, nativeState, redactGameStateFor, RoomType } from "shared";
import { type Socket } from 'socket.io'
import { games, usersForRoom } from "./RoomManager";
import { SocketDataType, SocketServerType } from "./Common";
import { tryDoAction } from "shared/logic/GameAction";


export function acceptGameEvents(io: SocketServerType, socket: Socket<GameServerEventMap, GameClientEventMap, {}, SocketDataType>) {

    socket.on('gameState', (cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = games().find(x => x.id == socket.data.room![0])
        if (room == undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }

        cb(nativeState(redactGameStateFor(room.state, socket.data.room[1])))
    })

    socket.on('gameAction', (action, cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = games().find(x => x.id == socket.data.room![0])
        if (room == undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }
        
        const nextState = tryDoAction(room.state, socket.data.room[1], action)
        if (nextState == undefined)
            return cb('action not allowed')
        else {
            room.state = nextState
            socket.emit('gameEvent')
            socket.to(socket.data.room[0]).emit('gameEvent')
    
            return cb(true)
        }
    })

    socket.on('fullGameRoom', async cb => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = games().find(x => x.id == socket.data.room![0])
        if (room == undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }
        
        const users = await usersForRoom(io, socket.data.room[0])
        cb({
            id: room.id,
            name: room.name,
            owner: room.owner,
            settings: room.settings,
            users: users.toArray(),
            type: RoomType.InGame,
            state: nativeState(redactGameStateFor(room.state, socket.data.room[1]))
        })
    })
}