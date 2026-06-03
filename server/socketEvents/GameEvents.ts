import { type Color, type GameActionInfo, type GameActionInput, type GameClientEventMap, type GameServerEventMap, generateBotAction, RoomType, redactGameActionInfoFor, redactGameStateFor, requireActionFrom, tryDoAction, winners } from 'catan-shared'
import type { Socket } from 'socket.io'
import typia from 'typia'
import type { GameNamespace, GameSocketDataType } from './Common'
import { endGame, gameRoomFor, participantsForRoom, type ServerGameRoom } from './RoomManager'


export function acceptGameEvents(io: GameNamespace, socket: Socket<GameServerEventMap, GameClientEventMap, object & {}, GameSocketDataType>) {

    socket.on('gameState', cb => {
        if (typeof cb !== 'function') {
            console.warn('invalid arguments:', cb)
            return
        }


        const room = gameRoomFor(socket.data.roomID)
        if (room === undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }

        cb(redactGameStateFor(room.state, socket.data.color))
    })


    function handleGameAction(room: ServerGameRoom, executor: Color, action: GameActionInput) {
        const actionResult = tryDoAction(room.state, executor, action)
        if (actionResult === undefined)
            return 'action not allowed'

        room.state = actionResult[0]
        const gameAction = { type: action.type, input: action, response: actionResult[1] } as GameActionInfo
        for (const s of io.adapter.rooms.get(room.id)!) {
            const fullSocket = io.sockets.get(s)!
            fullSocket.emit('gameEvent', redactGameStateFor(room.state, fullSocket.data.color), 
                redactGameActionInfoFor(gameAction, executor, fullSocket.data.color))
        }

        return true
    }

    function checkAndHandleEndGame(room: ServerGameRoom): boolean {
        if (winners(room.state, room.settings.requiredVictoryPoints).length > 0) {
            endGame(io, room)
            return true
        }
        return false
    }

    socket.on('gameAction', (action, cb) => {
        if (!typia.is(action) && typeof cb !== 'function') {
            console.warn('invalid arguments:', action, cb)
            return
        }

        const room = gameRoomFor(socket.data.roomID)
        if (room === undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }
        
        const playerRes = handleGameAction(room, socket.data.color, action)
        if (playerRes === 'action not allowed')
            return cb(playerRes)

        cb(true)
        const ended = checkAndHandleEndGame(room)
        if (ended) return


        while (requireActionFrom(room.state).some(x => room.bots.some(([_, col]) => col === x))) {
            const botColors = requireActionFrom(room.state).filter(x => room.bots.some(bot => bot[1] === x))
            const botAction = generateBotAction(
                                    room.bots.find(x => x[1] === botColors[0])![0], 
                                    redactGameStateFor(room.state, botColors[0]))
            if (botAction === undefined) {
                console.warn('Bot generated an undefined action!')
                continue
            }
            const res = handleGameAction(room, botColors[0], botAction)
            if (res === 'action not allowed')
                console.warn('Bot generated invalid action!', botAction)
            const ended = checkAndHandleEndGame(room)
            if (ended) return
        }
    })

    socket.on('fullGameRoom', async cb => {
        if (typeof cb !== 'function') {
            console.warn('invalid arguments:', cb)
            return
        }

        const room = gameRoomFor(socket.data.roomID)
        if (room === undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }
        
        const participants = await participantsForRoom(io, socket.data.roomID)
        cb({
            id: room.id,
            name: room.name,
            owner: room.owner,
            settings: room.settings,
            participants: participants,
            type: RoomType.InGame,
            state: redactGameStateFor(room.state, socket.data.color),
            scenario: room.scenario
        })
    })
}