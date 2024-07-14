import { GameClientEventMap, GameServerEventMap, nativeGame, nativeState, redactGameStateFor, registerServerListener, RoomType, SocketImplementation } from "shared";
import { type Socket } from 'socket.io'
import { games, usersForRoom } from "./RoomManager";
import { SocketDataType, SocketServerType } from "./Common";
import { tryDoAction } from "shared/logic/GameAction";


export function acceptGameEvents(io: SocketServerType, socket: Socket<GameServerEventMap, GameClientEventMap, {}, SocketDataType>) {
    const listener: SocketImplementation<GameServerEventMap> = {
        gameState: [true, () => {
            if (socket.data.room == undefined)
                return 'invalid socket state'
    
            const room = games().find(x => x.id == socket.data.room![0])
            if (room == undefined) {
                console.error(`Socket had access to deleted room ${socket.data}`)
                return 'invalid socket state'
            }
    
            return nativeState(redactGameStateFor(room.state, socket.data.room[1]))
        }],
        gameAction: [true, (action) => {
            if (socket.data.room == undefined)
                return 'invalid socket state'
    
            const room = games().find(x => x.id == socket.data.room![0])
            if (room == undefined) {
                console.error(`Socket had access to deleted room ${socket.data}`)
                return 'invalid socket state'
            }
            
            const nextState = tryDoAction(room.state, socket.data.room[1], action)
            if (nextState == undefined)
                return 'action not allowed'
            else {
                room.state = nextState
                socket.emit('gameEvent')
                socket.to(socket.data.room[0]).emit('gameEvent')
        
                return true
            }
        }],
        fullGameRoom: [true, async () => {
            if (socket.data.room == undefined)
                return 'invalid socket state'
    
            const room = games().find(x => x.id == socket.data.room![0])
            if (room == undefined) {
                console.error(`Socket had access to deleted room ${socket.data}`)
                return 'invalid socket state'
            }
            
            const users = await usersForRoom(io, socket.data.room[0])
            return {
                id: room.id,
                name: room.name,
                owner: room.owner,
                settings: room.settings,
                users: users.toArray(),
                type: RoomType.InGame,
                state: nativeState(redactGameStateFor(room.state, socket.data.room[1]))
            }
        }]
    }

    registerServerListener(socket, listener)
}