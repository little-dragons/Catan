import { GameClientEventMap, GameServerEventMap, redactGameStateFor, RoomType, victoryPointsFromFull } from "shared";
import { type Socket } from 'socket.io'
import { endGame, games, usersForRoom } from "./RoomManager.js";
import { SocketDataType, SocketServerType } from "./Common.js";
import { GameActionInfo, redactGameActionInfoFor, tryDoAction } from "shared/logic/GameAction.js";


export function acceptGameEvents(io: SocketServerType, socket: Socket<GameServerEventMap, GameClientEventMap, {}, SocketDataType>) {

    socket.on('gameState', (cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = games().find(x => x.id == socket.data.room![0])
        if (room == undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }

        cb(redactGameStateFor(room.state, socket.data.room[1]))
    })

    socket.on('gameAction', (action, cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = games().find(x => x.id == socket.data.room![0])
        if (room == undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }
        
        const actionResult = tryDoAction(room.state, socket.data.room[1], action)
        if (actionResult == undefined)
            return cb('action not allowed')
        else {
            room.state = actionResult[0]
            const gameAction: GameActionInfo = { type: action.type, input: action, response: actionResult[1] } as GameActionInfo
            for (const s of io.of('/').adapter.rooms.get(socket.data.room[0])!) {
                const fullSocket = io.sockets.sockets.get(s)!
                fullSocket.emit('gameEvent', redactGameStateFor(room.state, fullSocket.data.room![1]), redactGameActionInfoFor(gameAction, socket.data.room[1], fullSocket.data.room![1]))
            }
            cb(true)

            if (room.state.players.some(x => victoryPointsFromFull(room.state, x.color) >= room.settings.requiredVictoryPoints)) {
                endGame(io, room)
            }
    
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
            users: users,
            type: RoomType.InGame,
            state: redactGameStateFor(room.state, socket.data.room[1])
        })
    })
}