import { FullRoom, RoomId, LobbyRoom, FullGameRoom, allColors, FullPlayer, User, defaultBoard, RoomServerEventMap, newRandomRoomId, AuthToken, RoomClientEventMap } from "shared"
import { type Socket } from 'socket.io'
import { checkRealUser, getUser } from "../authentication/AuthTokenMap"
import { DataType } from "../Common"
import { defaultSettings } from "shared/logic/Settings"

const rooms = [] as FullRoom[]
export function lobbies() { return rooms.filter(x => x.type == 'lobby') as LobbyRoom[] }
export function games() { return rooms.filter(x => x.type == 'ingame') as FullGameRoom[] }

type RoomSocket = Socket<RoomServerEventMap, RoomClientEventMap, {}, DataType>


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
        board: defaultBoard(room.settings.seed),
        currentPlayer: mapping[0][1].color,
        players: mapping.map(pair => pair[1]),
        phase: {
            type: 'initial',
            forward: true,
        },
    }
    game.users = mapping.map(x => [x[0], x[1].color])

    
}

export function createRoomWithOwner(socket: RoomSocket, name: string, token: AuthToken) {
    const user = getUser(token)
    if (user == undefined)
        return 'invalid token'

    if (rooms.some(x => x.name == name))
        return 'room name in use'
    
    const room: LobbyRoom = {
        type: 'lobby',
        name: name,
        id: newRandomRoomId(),
        users: [user],
        owner: user,
        settings: defaultSettings()
    }
    rooms.push(room)
    socket.join(room.id)
    return room
}

export function joinRoom(socket: RoomSocket, id: RoomId, token: AuthToken) {
    const room = rooms.find(x => x.id == id)
    if (room == undefined)
        return 'invalid room id'

    if (room.type == 'ingame')
        return 'room is ingame'


    if (room.users.some(x => checkRealUser(token, x.name)))
        return 'user already joined'

    const user = getUser(token)
    if (user == undefined)
        return 'invalid token'

    room.users.push(user)

    socket.join(id)
    socket.in(id).emit('userChange', room.users)

    return room
}

export function leaveRoom(socket: RoomSocket, id: RoomId, token: AuthToken) {
    const room = rooms.find(x => x.id == id)
    if (room == undefined)
        return 'invalid room id'

    let userIdx: number = -1
    if (room.type == 'ingame')
        userIdx = room.users.findIndex(x => checkRealUser(token, x[0].name))
    else
        userIdx = room.users.findIndex(x => checkRealUser(token, x.name))

    if (userIdx < 0)
        return 'invalid token'

    let user: User = undefined!
    if (room.type == 'ingame')
        user = room.users[userIdx][0]
    else
        user = room.users[userIdx]

    if (room.owner.name == user.name || room.users.length <= 1) {
        return closeRoom(socket, id)
    }
    else {
        room.users.splice(userIdx, 1)
        socket.leave(id)
        socket.in(id).emit('userChange', room.users)
    }

    return true
}

export function closeRoom(socket: RoomSocket, id: RoomId) {
    const roomIdx = rooms.findIndex(x => x.id == id)
    if (roomIdx < 0)
        return 'invalid room id'

    rooms.splice(roomIdx, 1)
    socket.emit('closed')
    socket.in(id).emit('closed')

    socket.leave(id)
    socket.in(id).socketsLeave(id)
    return true
}

export function acceptRoomEvents(socket: RoomSocket) {
    socket.on('lobbyList', cb => {
        cb(lobbies())
    })

    socket.on('createAndJoin', (name, token, cb) => {
        cb(createRoomWithOwner(socket, name, token))
    })

    socket.on('join', (roomId, userToken, cb) => {
        cb(joinRoom(socket, roomId, userToken))
    })

    socket.on('leave', (room, token, cb) => {
        cb(leaveRoom(socket, room, token))
    })
}
