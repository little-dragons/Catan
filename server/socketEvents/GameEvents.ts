import { BuildingType, GameClientEventMap, GameServerEventMap, adjacentResourceTiles, buyCity, buyRoad, buySettlement, canBuyCity, canBuyRoad, canBuySettlement, isAvailableBuildingPosition, redactGameStateFor, setNextPlayer } from "shared";
import { type Socket } from 'socket.io'
import { games, usersForRoom } from "./RoomManager";
import { SocketDataType, SocketServerType } from "./Common";


export function acceptGameEvents(io: SocketServerType, socket: Socket<GameServerEventMap, GameClientEventMap, {}, SocketDataType>) {

    socket.on('gameState', (cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = games().find(x => x.id == socket.data.room![0])
        if (room == undefined)
            return console.error(`Socket had access to deleted room ${socket.data}`)

        cb(redactGameStateFor(room.state, socket.data.room[1]))
    })

    socket.on('gameAction', (action, cb) => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = games().find(x => x.id == socket.data.room![0])
        if (room == undefined)
            return console.error(`Socket had access to deleted room ${socket.data}`)
        
        if (room.state.currentPlayer != socket.data.room[1]) {
            cb('action not allowed')
            return
        }
        const currentPlayer = room.state.players.find(x => x.color == room.state.currentPlayer)!

        if (action.type == 'roll dice' && room.state.phase.type == 'normal' && room.state.phase.diceRolled == false) {
            const dice1 = Math.floor(Math.random() * 6) + 1
            const dice2 = Math.floor(Math.random() * 6) + 1
            room.state.phase.diceRolled = [dice1, dice2]

            const sum  = dice1 + dice2
            for (const building of room.state.board.buildings) {
                const resources = adjacentResourceTiles(building[1], room.state.board, sum)
                const player = room.state.players.find(x => x.color == building[0])
                for (const res of resources) {
                    if (building[2] == BuildingType.Settlement)
                        player?.handCards.push(res)
                    else if (building[2] == BuildingType.City) {
                        player?.handCards.push(res)
                        player?.handCards.push(res)
                    }
                }
            }
        }

        else if (action.type == 'place initial buildings' && room.state.phase.type == 'initial') {
            if (!isAvailableBuildingPosition(action.settlement, room.state.board, undefined)) {
                cb('action not allowed')
                return
            }
            
            room.state.board.buildings.push([room.state.currentPlayer, action.settlement, BuildingType.Settlement])
            room.state.board.roads.push([room.state.currentPlayer, action.road])

            if (!room.state.phase.forward) {
                const resources = adjacentResourceTiles(action.settlement, room.state.board, undefined)
                for (const res of resources)
                    currentPlayer.handCards.push(res)
            }

            setNextPlayer(room.state)
        }

        else if (action.type == 'place building' && room.state.phase.type == 'normal' && room.state.phase.diceRolled) {
            // if (!isAvailableBuildingPosition(action.settlement, game.state.board, game.state.currentPlayer)) {
            //     cb('action not allowed')
            //     return
            // }
            
            const currentHandCards = room.state.players.find(x => x.color == room.state.currentPlayer)!.handCards

            if (action.building == 'city' && !canBuyCity(currentHandCards) ||  
                action.building == 'settlement' && !canBuySettlement(currentHandCards) ||  
                action.building == 'road' && !canBuyRoad(currentHandCards)) { 
                cb('action not allowed')
                return
            }
            
            // remove hand cards
            if (action.building == 'city') { 
                buyCity(currentHandCards)
            }
            else if (action.building == 'settlement') {
                buySettlement(currentHandCards)
            }
            else if (action.building == 'road') {
                buyRoad(currentHandCards)
            }

            if(action.building == 'city') 
                room.state.board.buildings.push([room.state.currentPlayer, action.coordinate, BuildingType.City])
            else if(action.building == 'settlement')
                room.state.board.buildings.push([room.state.currentPlayer, action.coordinate, BuildingType.Settlement])
            else if (action.building == 'road')
                room.state.board.roads.push([room.state.currentPlayer, action.coordinates])
        }

        else if (action.type == 'finish turn' && room.state.phase.type == 'normal' && room.state.phase.diceRolled != false) {
            setNextPlayer(room.state)
        }

        else {
            cb('action not allowed')
            return
        }

        socket.emit('gameEvent')
        socket.to(socket.data.room[0]).emit('gameEvent')

        cb(true)
    })

    socket.on('fullGameRoom', async cb => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = games().find(x => x.id == socket.data.room![0])
        if (room == undefined)
            return console.error(`Socket had access to deleted room ${socket.data}`)
        
        const users = await usersForRoom(io, socket.data.room[0])
        cb({
            id: room.id,
            name: room.name,
            owner: room.owner,
            settings: room.settings,
            users,
            type: 'ingame',
            state: redactGameStateFor(room.state, socket.data.room[1])
        })
    })
}