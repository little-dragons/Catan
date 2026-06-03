import type { GameClientEventMap, GameServerEventMap } from 'catan-shared'
import type { Socket } from 'socket.io'
import typia from 'typia'
import type { GameNamespace, GameSocketDataType } from './Common'
import { emitParticipantsChange, initializeGame, lobbyRoomFor, participantsForRoom, socketsForRoom } from './RoomManager'

type LobbySocket = Socket<GameServerEventMap, GameClientEventMap, object & {}, GameSocketDataType>
export function acceptLobbyEvents(server: GameNamespace, socket: LobbySocket) {
    socket.on('startGame', async cb => {
        if (typeof cb !== 'function') {
            console.warn('invalid arguments:', cb)
        }


        const room = lobbyRoomFor(socket.data.roomID)
        if (room === undefined)
            return cb('invalid socket state')
        
        if (room.owner.name !== socket.data.user.name)
            return cb('not the owner') 
        
        const res = await initializeGame(server, room)
        if (res === 'could not generate state')
            return cb('generation error')
        if (res === 'no correct room')
            return cb('invalid socket state')

        const _: true = res
        socket.in(room.id).emit('gameStarted')
        socket.emit('gameStarted')
        return cb(true)
    })

    socket.on('changeSettings', (property, value, cb) => {
        if (typeof cb !== 'function') {
            console.warn('invalid arguments:', cb)
        }
        switch (property) {
            case 'longestRoadMinimum':
                if (!typia.is(value)) return
                else break
            case 'requiredVictoryPoints':
                if (!typia.is(value)) return
                else break
            case 'seed': 
                if (!typia.is(value)) return
                else break
            default: return
        }


        const room = lobbyRoomFor(socket.data.roomID)
        if (room === undefined) {
            console.error(`invalid room: ${socket.data.roomID} from user ${socket.data.user}`)
            return cb('invalid socket state')
        }

        if (socket.data.user?.name !== room.owner.name)
            return cb('not the owner')
        
        room.settings[property] = value
        socket.emit('settingsChange', room.settings)
        socket.to(socket.data.roomID).emit('settingsChange', room.settings)
        return cb(true)
    })

    socket.on('changeColor', async (oldColor, newColor, cb) => {
        // runtime validation
        if (typeof cb !== 'function') {
            console.warn('invalid arguments:', cb)
            return
        }
        if (!typia.is(oldColor) && !typia.is(newColor) && typeof cb !== 'function') {
            console.warn('invalid arguments:', oldColor, newColor, cb)
            return
        }

        const room = lobbyRoomFor(socket.data.roomID)
        if (room === undefined)
            return cb('invalid socket state')
        


        const isOwner = room.owner.name === socket.data.user.name
        const sockets = await socketsForRoom(server, room.id)


        const playerWithOldColor = sockets.find(x => x.data.color === oldColor)
        const botWithOldColor = room.bots.find(x => x[1] === oldColor)
        const playerWithNewColor = sockets.find(x => x.data.color === newColor)
        const botWithNewColor = room.bots.find(x => x[1] === newColor)

        if (playerWithOldColor === undefined && botWithOldColor === undefined)
            return cb('color not in use')

        if (!isOwner) {
            // check that oldColor is current player
            if (playerWithOldColor === undefined)
                return cb('not the owner')

            if (playerWithOldColor.data.user!.name !== socket.data.user.name)
                return cb('not the owner')
            
            if (playerWithNewColor !== undefined)
                return cb('not the owner')

            // operation allowed: swap with bot if necessary, select new color
            if (botWithNewColor !== undefined)
                botWithNewColor[1] = oldColor

            playerWithOldColor.data.color = newColor

            await emitParticipantsChange(server, socket.data.roomID)
            return cb(true)
        }

        // is owner: simply swap

        if (playerWithNewColor !== undefined)
            playerWithNewColor.data.color = oldColor
        if (botWithNewColor !== undefined)
            botWithNewColor[1] = oldColor

        if (playerWithOldColor !== undefined)
            playerWithOldColor.data.color = newColor
        if (botWithOldColor !== undefined)
            botWithOldColor[1] = newColor

        await emitParticipantsChange(server, socket.data.roomID)
        return cb(true)
    }) 

    socket.on('fullLobbyRoom', async cb => {
        if (typeof cb !== 'function') {
            console.warn('invalid arguments:', cb)
            return
        }

        const room = lobbyRoomFor(socket.data.roomID)
        if (room === undefined)
            return cb('invalid socket state')
        
        return cb({ ...room, participants: await participantsForRoom(server, socket.data.roomID)!})
    })
}