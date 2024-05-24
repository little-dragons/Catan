import { GameClientEventMap, GameServerEventMap, redactGameStateFor } from "shared";
import { type Socket } from 'socket.io'
import { checkRealUser, checkUser } from "../authentication/AuthTokenMap";
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

        const userMappingSearch = game.users.find(pair => checkRealUser(token, pair[0]))
        if (userMappingSearch == undefined) {
            cb('invalid room id')
            return
        }

        cb(redactGameStateFor(game.state, userMappingSearch[1]))
    })

    socket.on('rollDice', (room, token, cb) => {
        if (!checkUser(token)) {
            cb('invalid token')
            return
        }

        const game = games().find(game => game.id == room)
        if (game == undefined) {
            cb('invalid room id')
            return
        }

        const userMappingSearch = game.users.find(pair => checkRealUser(token, pair[0]))
        if (userMappingSearch == undefined) {
            cb('invalid room id')
            return
        }

        const dice1 = Math.floor(Math.random() * 6) + 1
        const dice2 = Math.floor(Math.random() * 6) + 1
        game.state.dice = [dice1, dice2]

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

        const userMappingSearch = game.users.find(pair => checkRealUser(token, pair[0]))
        if (userMappingSearch == undefined) {
            cb('invalid room id')
            return
        }

        cb({
            id: game.id,
            name: game.name,
            owner: game.owner,
            users: game.users,
            type: 'ingame',
            state: redactGameStateFor(game.state, userMappingSearch[1])
        })
    })
}