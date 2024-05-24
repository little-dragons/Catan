import { FullRoom, RoomId, LobbyRoom, FullGameRoom, allColors, FullPlayer, User, defaultBoard, RoomServerEventMap, newRandomRoomId } from "shared"
import { type Socket } from 'socket.io'
import { getUser } from "../authentication/AuthTokenMap"

const rooms = [] as FullRoom[]

export function roomFor(roomId: RoomId) {
    return rooms.findIndex(x => x.id == roomId)
}

export function initializeGame(room: LobbyRoom) {
    if (!rooms.includes(room)) {
        console.warn(`Tried to initialize game, but there was no such lobby: ${room}`)
        return
    }

    const availableColors = allColors.slice()
    const mapping: [User, FullPlayer][] =
        room.users.map(user => [user, {
            name: user.name,
            isGuest: user.isGuest,
            color: availableColors.pop()!,
            handCards: []
        }])
    
    const game = room as unknown as FullGameRoom
    game.type = 'ingame'
    game.state = {
        board: defaultBoard(0),
        currentPlayer: mapping[0][1].color,
        players: mapping.map(pair => pair[1]),
        dice: [1, 2],
    }
    game.users = mapping.map(x => [x[0], x[1].color])
}
export function loobies() { return rooms.filter(x => x.type == 'lobby') as LobbyRoom[] }
export function games() { return rooms.filter(x => x.type == 'ingame') as FullGameRoom[] }


export function acceptRoomEvents(socket: Socket<RoomServerEventMap, {}>) {
    socket.on('lobbyList', cb => {
        cb(loobies())
    })

    socket.on('createAndJoin', (name, token, cb) => {
        const user = getUser(token)
        if (user == undefined) {
            cb('invalid token')
            return
        }
        const room: LobbyRoom = {
            type: 'lobby',
            name: name,
            id: newRandomRoomId(),
            users: [user],
            owner: user
        }
        rooms.push(room)
        socket.join(room.id)
        cb(room)
    })

    socket.on('join', (roomId, userToken, cb) => {
        const user = getUser(userToken)
        if (user == undefined) {
            cb('invalid token')
            return
        }

        for (const room of loobies()) {
            if (room.id == roomId) {
                room.users.push(user)
                socket.join(roomId)
                cb(room)
                return
            }
        }

        cb('no such room id')
    })

    socket.on('leave', (room, token, cb) => {
        const user = getUser(token)
        if (user == undefined) {
            cb('invalid token')
            return
        }

        const search = roomFor(room)
        if (search != undefined)
            console.warn('remove user from room is not implemented')

        socket.leave(room)
        cb(true)
    })
}