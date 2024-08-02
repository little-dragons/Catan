import { FullRoom, RoomId, LobbyRoom, FullGameRoom, allColors, User, defaultBoard, RoomServerEventMap, RoomClientEventMap, Color, GamePhaseType, RoomType } from "shared"
import { type Socket } from 'socket.io'
import { SocketDataType, SocketServerType } from "./Common.js"
import { defaultSettings } from "shared/logic/Settings.js"
import { v4 } from "uuid"

type ServerLobbyRoom = Omit<LobbyRoom, 'users'>
type ServerGameRoom = Omit<FullGameRoom, 'users'>
type ServerRoom = Omit<FullRoom, 'users'>

const rooms = [] as ServerRoom[]


function isLobby(room: ServerRoom): room is ServerLobbyRoom {
    return room.type == RoomType.Lobby
}
function isGame(room: ServerRoom): room is ServerGameRoom {
    return room.type == RoomType.InGame
}

export function lobbies() { return rooms.filter(isLobby) }
export function games() { return rooms.filter(isGame) }

type RoomSocket = Socket<RoomServerEventMap, RoomClientEventMap, {}, SocketDataType>


export function roomIdxFor(roomId: RoomId) {
    return rooms.findIndex(x => x.id == roomId)
}
export function roomFor(roomId: RoomId) {
    const idx = roomIdxFor(roomId)
    if (idx < 0)
        return undefined
    else
        return rooms[idx]
}
export async function usersForRoom(io: SocketServerType, roomId: RoomId) {
    return (await io.in(roomId).fetchSockets()).map(x => [x.data.user, x.data.room![1]] as [User, Color])
}

export async function initializeGame(io: SocketServerType, room: ServerLobbyRoom) {
    if (!rooms.includes(room)) {
        console.warn(`Tried to initialize game, but there was no such lobby: ${room}`)
        return
    }

    const users = await usersForRoom(io, room.id)
    const game = room as unknown as ServerGameRoom
    game.type = RoomType.InGame
    game.state = {
        board: defaultBoard(room.settings.seed),
        currentPlayer: users[0][1],
        players: users.map(([user, color]) => { return { color, handCards: [] } }),
        phase: {
            type: GamePhaseType.Initial,
            forward: true,
        },
    }
}

export function createRoom(socket: RoomSocket, name: string) {
    if (socket.data.user == undefined || socket.data.room != undefined)
        return 'invalid socket state'

    if (rooms.some(x => x.name == name))
        return 'room name in use'

    const color = allColors[Math.floor(Math.random() * allColors.length)]
    const room: ServerLobbyRoom = {
        type: RoomType.Lobby,
        name: name,
        id: v4(),
        owner: socket.data.user,
        settings: defaultSettings()
    }
    rooms.push(room)
    socket.data.room = [room.id, color]
    socket.join(room.id)
    return room
}


async function joinRoom(io: SocketServerType, socket: RoomSocket, id: RoomId) {
    if (socket.data.user == undefined || socket.data.room != undefined)
        return 'invalid socket state'

    const room = rooms.find(x => x.id == id)
    if (room == undefined || room.type != RoomType.Lobby) {
        return 'invalid room id'
    }


    const otherUsers = await usersForRoom(io, id)
    const usedColors = otherUsers.map(x => x[1])
    const remainingColors = allColors.filter(x => !usedColors.includes(x))
    socket.data.room = [id, remainingColors[Math.floor(Math.random() * remainingColors.length)]]
    socket.join(id)
    // this excludes the current socket instance, which is logical
    socket.in(id).emit('userChange', (await usersForRoom(io, id)))

    return room as ServerLobbyRoom
}


async function leaveRoom(io: SocketServerType, socket: RoomSocket) {
    if (socket.data.user == undefined || socket.data.room == undefined)
        return 'invalid socket state'

    const room = rooms.find(x => x.id == socket.data.room![0])
    if (room == undefined) {
        // TODO this is not supposed to happen
        console.warn('Socket contained invalid room id.')
        socket.data.room = undefined
        return 'invalid socket state'
    }

    const users = await usersForRoom(io, socket.data.room[0])
    if (room.owner.name == socket.data.user.name || users.length <= 1) {
        rooms.splice(rooms.indexOf(room), 1)

        const sockets = await io.in(socket.data.room[0]).fetchSockets()
        sockets.forEach(s => s.emit('closed'))
        sockets.forEach(s => s.leave(socket.data.room![0]))

        for (const other of sockets)
            other.data.room = undefined
    }
    else {
        socket.leave(socket.data.room[0])
        const otherUsers = await usersForRoom(io, socket.data.room[0])
        io.in(socket.data.room[0]).emit('userChange', otherUsers)
        socket.data.room = undefined
    }

    return true
}


export function acceptRoomEvents(io: SocketServerType, socket: RoomSocket) {
    socket.on('lobbyList', async cb => {
        cb(await Promise.all(lobbies().map(async (x) => { return { ...x, users: (await usersForRoom(io, x.id)) } })))
    })

    socket.on('createAndJoin', async (name, cb) => {
        const res = createRoom(socket, name)
        if (res == 'invalid socket state' || res == 'room name in use')
            return cb(res)

        const users = await usersForRoom(io, res.id)
        cb({ ...res, users })
    })

    socket.on('join', async (roomId, cb) => {
        const res = await joinRoom(io, socket, roomId)
        if (res == 'invalid room id' || res == 'invalid socket state')
            return cb(res)

        const users = await usersForRoom(io, res.id)
        return cb({ ...res, users })
    })

    socket.on('leave', async cb => {
        cb(await leaveRoom(io, socket))
    })
}
