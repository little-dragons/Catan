import { GameClientEventMap, GameServerEventMap, PrivateGameState, PrivatePlayer, Room, RoomId, User, allColors, defaultBoard, redactGameStateFor } from "shared";
import { type Socket } from 'socket.io'
import { checkRealUser, checkUser } from "../authentication/AuthTokenMap";

const games = [] as (PrivateGameState & { roomId: RoomId })[]

export function initializeGame(room: Room) {    
    const availableColors = allColors.slice()
    const mapping: [PrivatePlayer, User][] = 
        room.users.map(user => [{
            name: user.name,
            isGuest: user.isGuest,
            color: availableColors.pop()!,
            handCards: []
        }, user])
    const game: PrivateGameState & { roomId: RoomId } = {
        board: defaultBoard(0),
        currentPlayer: mapping[0][0].color,
        players: mapping.map(pair => pair[0]),
        userMapping: mapping.map(pair => [pair[0].color, pair[1]]),
        roomId: room.id
    }
    games.push(game)
}

export function acceptGameEvents(socket: Socket<GameServerEventMap, GameClientEventMap>) {

    socket.on('gameState', (room, token, cb) => {
        if (!checkUser(token)) {
            cb('invalid token')
            return
        }

        const game = games.find(game => game.roomId == room)
        if (game == undefined) {
            cb('invalid room id')
            return
        }

        const userMappingSearch = game.userMapping.find(pair => checkRealUser(token, pair[1]))
        if (userMappingSearch == undefined) {
            cb('invalid room id')
            return
        }

        cb(redactGameStateFor(game, userMappingSearch[0]))
    })
}