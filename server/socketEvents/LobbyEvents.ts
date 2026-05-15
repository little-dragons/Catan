import { LobbyClientEventMap, LobbyServerEventMap } from 'catan-shared';
import { type Socket } from 'socket.io'
import { emitParticipantsChange, initializeGame, lobbyRoomFor, socketsForRoom } from './RoomManager';
import { SocketDataType, SocketServerType } from './Common';
import typia from 'typia';

type LobbySocket = Socket<LobbyServerEventMap, LobbyClientEventMap, {}, SocketDataType>
export function acceptLobbyEvents(server: SocketServerType, socket: LobbySocket) {
    socket.on('startGame', async cb => {
        if (typeof cb != 'function') {
            console.warn('invalid arguments:', cb)
            return (cb as any)('invalid arguments')
        }

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
        if (typeof cb != 'function') {
            console.warn('invalid arguments:', cb)
            return (cb as any)('invalid arguments')
        }
        switch (property) {
            case 'longestRoadMinimum':
                if (!typia.is(value)) return (cb as any)('invalid arguments')
                else break
            case 'requiredVictoryPoints':
                if (!typia.is(value)) return (cb as any)('invalid arguments')
                else break
            case 'seed': 
                if (!typia.is(value)) return (cb as any)('invalid arguments')
                else break
            default: return (cb as any)('invalid arguments')
        }

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

    socket.on('changeColor', async (oldColor, newColor, cb) => {
        // runtime validation
        if (typeof cb != 'function') {
            console.warn('invalid arguments:', cb)
            return (cb as any)('invalid arguments')
        }
        if (!typia.is(oldColor) && !typia.is(newColor) && typeof cb != 'function') {
            console.warn('invalid arguments:', oldColor, newColor, cb)
            return (cb as any)('invalid arguments')
        }

        
        // establishing preconditions
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = lobbyRoomFor(socket.data.room[0])
        if (room == undefined)
            return cb('invalid socket state')
        


        const isOwner = room.owner.name == socket.data.user.name
        const sockets = await socketsForRoom(server, room.id)


        const playerWithOldColor = sockets.find(x => x.data.room![1] == oldColor)
        const botWithOldColor = room.bots.find(x => x[1] == oldColor)
        const playerWithNewColor = sockets.find(x => x.data.room![1] == newColor)
        const botWithNewColor = room.bots.find(x => x[1] == newColor)

        if (playerWithOldColor == undefined && botWithOldColor == undefined)
            return cb('color not in use')

        if (!isOwner) {
            // check that oldColor is current player
            if (playerWithOldColor == undefined)
                return cb('not the owner')

            if (playerWithOldColor.data.user!.name != socket.data.user.name)
                return cb('not the owner')
            
            if (playerWithNewColor != undefined)
                return cb('not the owner')

            // operation allowed: swap with bot if necessary, select new color
            if (botWithNewColor != undefined)
                botWithNewColor[1] = oldColor

            playerWithOldColor.data.room![1] = newColor

            await emitParticipantsChange(server, socket.data.room[0])
            return cb(true)
        }

        // is owner: simply swap

        if (playerWithNewColor != undefined)
            playerWithNewColor.data.room![1] = oldColor
        if (botWithNewColor != undefined)
            botWithNewColor[1] = oldColor

        if (playerWithOldColor != undefined)
            playerWithOldColor.data.room![1] = newColor
        if (botWithOldColor != undefined)
            botWithOldColor[1] = newColor

        await emitParticipantsChange(server, socket.data.room[0])
        return cb(true)
    }) 
}