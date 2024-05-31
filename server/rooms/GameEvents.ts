import { BuildingType, FullGameState, GameClientEventMap, GameServerEventMap, adjacentResourceTiles, buyCity, buyRoad, buySettlement, canBuyCity, canBuyRoad, canBuySettlement, isAvailableBuildingPosition, redactGameStateFor, setNextPlayer } from "shared";
import { type Socket } from 'socket.io'
import { checkRealUser as checkName, checkUser } from "../authentication/AuthTokenMap";
import { games } from "./RoomManager";


export function acceptGameEvents(socket: Socket<GameServerEventMap, GameClientEventMap>) {

    socket.on('gameState', (room, token, cb) => {
        if (!checkUser(token)) {
            cb('invalid token')
            return
        }

        const game = games().find(game => game.id == room)
        if (game == undefined) {
            cb('invalid room id')
            return
        }

        const userMappingSearch = game.users.find(pair => checkName(token, pair[0].name))
        if (userMappingSearch == undefined) {
            cb('invalid room id')
            return
        }

        cb(redactGameStateFor(game.state, userMappingSearch[1]))
    })

    socket.on('gameAction', (room, token, action, cb) => {
        if (!checkUser(token)) {
            cb('invalid token')
            return
        }

        const game = games().find(game => game.id == room)
        if (game == undefined) {
            cb('invalid room id')
            return
        }

        const userMappingSearch = game.users.find(pair => checkName(token, pair[0].name))
        if (userMappingSearch == undefined) {
            cb('invalid room id')
            return
        }

        if (game.state.currentPlayer != userMappingSearch[1]) {
            cb('action not allowed')
            return
        }
        const currentPlayer = game.state.players.find(x => x.color == game.state.currentPlayer)!

        if (action.type == 'roll dice' && game.state.phase.type == 'normal' && game.state.phase.diceRolled == false) {
            const dice1 = Math.floor(Math.random() * 6) + 1
            const dice2 = Math.floor(Math.random() * 6) + 1
            game.state.phase.diceRolled = [dice1, dice2]

            const sum  = dice1 + dice2
            for (const building of game.state.board.buildings) {
                const resources = adjacentResourceTiles(building[1], game.state.board, sum)
                const player = game.state.players.find(x => x.color == building[0])
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

        else if (action.type == 'place initial buildings' && game.state.phase.type == 'initial') {
            if (!isAvailableBuildingPosition(action.settlement, game.state.board, userMappingSearch[1])) {
                cb('action not allowed')
                return
            }
            
            game.state.board.buildings.push([game.state.currentPlayer, action.settlement, BuildingType.Settlement])
            game.state.board.roads.push([game.state.currentPlayer, action.road[0], action.road[1]])

            if (!game.state.phase.forward) {
                const resources = adjacentResourceTiles(action.settlement, game.state.board, undefined)
                for (const res of resources)
                    currentPlayer.handCards.push(res)
            }

            setNextPlayer(game.state)
        }

        else if (action.type == 'place building' && game.state.phase.type == 'normal' && game.state.phase.diceRolled) {

            const currentHandCards = game.state.players.find(x => x.color == game.state.currentPlayer)!.handCards

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
                game.state.board.buildings.push([game.state.currentPlayer, action.coordinate, BuildingType.City])
            else if(action.building == 'settlement')
                game.state.board.buildings.push([game.state.currentPlayer, action.coordinate, BuildingType.Settlement])
            else if (action.building == 'road')
                game.state.board.roads.push([game.state.currentPlayer, action.coordinates[0], action.coordinates[1]])
        }

        else if (action.type == 'finish turn' && game.state.phase.type == 'normal' && game.state.phase.diceRolled != false) {
            setNextPlayer(game.state)
        }

        else {
            cb('action not allowed')
            return
        }


        socket.emit('gameEvent')
        socket.to(room).emit('gameEvent')

        cb(true)
    })

    socket.on('fullGameRoom', (id, token, cb) => {
        if (!checkUser(token)) {
            cb('invalid token')
            return
        }

        const game = games().find(game => game.id == id)
        if (game == undefined) {
            cb('invalid room id')
            return
        }

        const userMappingSearch = game.users.find(pair => checkName(token, pair[0].name))
        if (userMappingSearch == undefined) {
            cb('invalid room id')
            return
        }

        cb({
            id: game.id,
            name: game.name,
            owner: game.owner,
            users: game.users,
            settings: game.settings,
            type: 'ingame',
            state: redactGameStateFor(game.state, userMappingSearch[1])
        })
    })
}