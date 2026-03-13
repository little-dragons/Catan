import { Color, GameClientEventMap, GameActionInfo, GameActionInput, redactGameActionInfoFor, tryDoAction, GameServerEventMap, generateBotAction, redactGameStateFor, requireActionFrom, RoomType, victoryPointsFromFull } from "shared";
import { type Socket } from 'socket.io'
import { endGame, gameRoomFor, participantsForRoom, ServerGameRoom } from "./RoomManager";
import { SocketDataType, SocketServerType } from "./Common";


export function acceptGameEvents(io: SocketServerType, socket: Socket<GameServerEventMap, GameClientEventMap, {}, SocketDataType>) {

    socket.on('gameState', (cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = gameRoomFor(socket.data.room![0])
        if (room == undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }

        cb(redactGameStateFor(room.state, socket.data.room[1]))
    })


    function handleGameAction(room: ServerGameRoom, executor: Color, action: GameActionInput) {
        const actionResult = tryDoAction(room.state, executor, action)
        if (actionResult == undefined)
            return 'action not allowed'

        room.state = actionResult[0]
        const gameAction = { type: action.type, input: action, response: actionResult[1] } as GameActionInfo
        for (const s of io.of('/').adapter.rooms.get(room.id)!) {
            const fullSocket = io.sockets.sockets.get(s)!
            fullSocket.emit('gameEvent', redactGameStateFor(room.state, fullSocket.data.room![1]), 
                redactGameActionInfoFor(gameAction, executor, fullSocket.data.room![1]))
        }

        return true
    }

    function checkAndHandleEndGame(io: SocketServerType, room: ServerGameRoom): boolean {
        if (room.state.players.some(x => victoryPointsFromFull(room.state, x.color) >= room.settings.requiredVictoryPoints)) {
            endGame(io, room)
            return true
        }
        return false
    }

    socket.on('gameAction', (action, cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = gameRoomFor(socket.data.room![0])
        if (room == undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }
        
        const playerRes = handleGameAction(room, socket.data.room[1], action)
        if (playerRes == 'action not allowed')
            return cb(playerRes)

        cb(true)
        const ended = checkAndHandleEndGame(io, room)
        if (ended) return

        while (requireActionFrom(room.state).some(x => room.bots.some(([_, col]) => col == x))) {
            const botColors = requireActionFrom(room.state).filter(x => room.bots.some(bot => bot[1] == x))
            const botAction = generateBotAction(
                                    room.bots.find(x => x[1] == botColors[0])![0], 
                                    redactGameStateFor(room.state, botColors[0]))
            
            const res = handleGameAction(room, botColors[0], botAction)
            if (res == 'action not allowed')
                console.warn('Bot generated invalid action!', botAction)
            const ended = checkAndHandleEndGame(io, room)
            if (ended) return
        }
    })

    socket.on('fullGameRoom', async cb => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = gameRoomFor(socket.data.room![0])
        if (room == undefined) {
            console.error(`Socket had access to deleted room ${socket.data}`)
            return cb('invalid socket state')
        }
        
        const participants = await participantsForRoom(io, socket.data.room[0])
        cb({
            id: room.id,
            name: room.name,
            owner: room.owner,
            settings: room.settings,
            participants: participants,
            type: RoomType.InGame,
            state: redactGameStateFor(room.state, socket.data.room[1]),
            scenario: room.scenario
        })
    })
}