import { FullRoom, RoomId, LobbyRoom, FullGameRoom, allColors, User, RoomServerEventMap, RoomClientEventMap, Color, GamePhaseType, RoomType, PostGameRoom, generateBoardFromScenario, defaultScenario, ParticipantType, Participant, generateStateFromScenario } from "shared"
import { type Socket } from 'socket.io'
import { SocketDataType, SocketServerType } from "./Common.js"
import { defaultSettings } from "shared/logic/Settings.js"
import { v4 } from "uuid"
import { Bot, BotPersonality } from "shared/logic/Bots.js"

type ServerLobbyRoom    = Omit<LobbyRoom, 'participants'>    & { bots : [Bot, Color][] }
type ServerGameRoom     = Omit<FullGameRoom, 'participants'> & { bots : [Bot, Color][] }
type ServerPostGameRoom = Omit<PostGameRoom, 'participants'> & { bots : [Bot, Color][] }
type ServerRoom         = Omit<FullRoom, 'participants'>     & { bots : [Bot, Color][] }

const rooms = new Map<RoomId, ServerRoom>()

function isLobby(room: ServerRoom): room is ServerLobbyRoom {
    return room.type == RoomType.Lobby
}
function isGame(room: ServerRoom): room is ServerGameRoom {
    return room.type == RoomType.InGame
}

export function gameRoomFor(roomId: RoomId): ServerGameRoom | undefined {
    const val = rooms.get(roomId)
    if (val == undefined || !isGame(val))
        return undefined
    return val
}
export function lobbyRoomFor(roomId: RoomId): ServerLobbyRoom | undefined {
    const val = rooms.get(roomId)
    if (val == undefined || !isLobby(val))
        return undefined
    return val
}

type RoomSocket = Socket<RoomServerEventMap, RoomClientEventMap, {}, SocketDataType>

export async function usersForRoom(io: SocketServerType, roomId: RoomId) {
    return (await io.in(roomId).fetchSockets()).map(x => [x.data.user, x.data.room![1]] as [User, Color])
}
export async function participantsForRoom(io: SocketServerType, roomId: RoomId): Promise<[Participant, Color][]> {
    const users = (await io.in(roomId).fetchSockets()).map<[Participant, Color]>(x => 
                        [{ type: ParticipantType.User, user: x.data.user! }, x.data.room![1]])
    const bots = rooms.get(roomId)?.bots.map<[Participant, Color]>(([bot, col]) => [{ type: ParticipantType.Bot, bot: bot }, col])
    return users.concat(bots ?? [])
}

export async function initializeGame(io: SocketServerType, room: ServerLobbyRoom) {
    if (!rooms.has(room.id)) {
        console.warn(`Tried to initialize game, but there was no such lobby: ${room}`)
        return 'no correct room'
    }
    const participants = await participantsForRoom(io, room.id)
    // TODO correct current player
    const state = generateStateFromScenario(room.scenario, participants.map(x => x[1]), participants[0][1], room.settings.seed)
    if (state == undefined)
        return 'could not generate state'

    const game = room as unknown as ServerGameRoom
    game.type = RoomType.InGame
    game.state = state
    return true
}

export function endGame(io: SocketServerType, room: ServerGameRoom) {
    for (const s of io.of('/').adapter.rooms.get(room.id)!) {
        const fullSocket = io.sockets.sockets.get(s)!
        fullSocket.emit('gameOver', {
            lastState: room.state
        })
    }

    const newRoom = room as unknown as ServerPostGameRoom
    newRoom.type = RoomType.PostGame
    newRoom.history = {
        lastState: room.state
    }
}

export function createRoom(socket: RoomSocket, name: string) {
    if (socket.data.user == undefined || socket.data.room != undefined)
        return 'invalid socket state'

    if (Array.from(rooms.values()).some(x => x.name == name))
        return 'room name in use'

    const color = allColors[Math.floor(Math.random() * allColors.length)]
    const room: ServerLobbyRoom = {
        type: RoomType.Lobby,
        name: name,
        id: v4(),
        owner: socket.data.user,
        settings: defaultSettings(),
        scenario: defaultScenario,
        bots: []
    }
    rooms.set(room.id, room)
    socket.data.room = [room.id, color]
    socket.join(room.id)
    return room
}


async function joinRoom(io: SocketServerType, socket: RoomSocket, id: RoomId) {
    if (socket.data.user == undefined || socket.data.room != undefined)
        return 'invalid socket state'

    const room = lobbyRoomFor(id)
    if (room == undefined || room.type != RoomType.Lobby) {
        return 'invalid room id'
    }


    const otherParticipants = await participantsForRoom(io, id)
    const usedColors = otherParticipants.map(x => x[1])
    const remainingColors = allColors.filter(x => !usedColors.includes(x))
    socket.data.room = [id, remainingColors[Math.floor(Math.random() * remainingColors.length)]]
    socket.join(id)
    // this excludes the current socket instance, which is logical
    socket.in(id).emit('participantChange', await participantsForRoom(io, id))

    return room as ServerLobbyRoom
}


async function leaveRoom(io: SocketServerType, socket: RoomSocket) {
    if (socket.data.user == undefined || socket.data.room == undefined)
        return 'invalid socket state'

    // TODO what if index changes between here and following?
    const room = rooms.get(socket.data.room![0])
    if (room == undefined) {
        // TODO this is not supposed to happen
        console.warn('Socket contained invalid room id.')
        socket.data.room = undefined
        return 'invalid socket state'
    }

    const users = await usersForRoom(io, socket.data.room[0])
    if (room.owner.name == socket.data.user.name || users.length <= 1) {
        rooms.delete(socket.data.room![0])

        const sockets = await io.in(socket.data.room[0]).fetchSockets()
        sockets.forEach(s => s.emit('closed'))
        sockets.forEach(s => s.leave(socket.data.room![0]))

        for (const other of sockets)
            other.data.room = undefined
    }
    else {
        socket.leave(socket.data.room[0])
        const otherParticipants = await participantsForRoom(io, socket.data.room[0])
        io.in(socket.data.room[0]).emit('participantChange', otherParticipants)
        socket.data.room = undefined
    }

    return true
}


export function acceptRoomEvents(io: SocketServerType, socket: RoomSocket) {
    socket.on('lobbyList', async cb => {
        cb(await Promise.all(Array.from(rooms.values()).filter(isLobby).map<Promise<LobbyRoom>>(async (x) => { 
            return { 
                ...x,
                participants: await participantsForRoom(io, x.id)                
            } })))
    })

    socket.on('createAndJoin', async (name, cb) => {
        const res = createRoom(socket, name)
        if (res == 'invalid socket state' || res == 'room name in use')
            return cb(res)

        const participants = await participantsForRoom(io, res.id)
        cb({ ...res, participants: participants })
    })

    socket.on('join', async (roomId, cb) => {
        if (!rooms.has(roomId))
            return cb('invalid room id')

        const old = await participantsForRoom(io, roomId)
        if (old.length >= rooms.get(roomId)!.scenario.players.maxAllowedCount)
            return cb('game full')

        const res = await joinRoom(io, socket, roomId)
        if (res == 'invalid room id' || res == 'invalid socket state')
            return cb(res)

        return cb({ ...res, participants: await participantsForRoom(io, roomId) })
    })


    socket.on('addBot', async cb => {
        if (socket.data.room == undefined)
            return cb('invalid socket state')

        const room = lobbyRoomFor(socket.data.room[0])
        if (room == undefined)
            return cb('invalid socket state')

        if (room.owner.name != socket.data.user.name)
            return cb('not the owner')

        const participants = await participantsForRoom(io, room.id)
        if (participants.length >= room.scenario.players.maxAllowedCount)
            return cb('room full')

        const freeColor = allColors.filter(x => !participants.some(([_, col]) => x == col))
        room.bots.push([{
            name: 'bottest',
            personality: BotPersonality.Vincent
        }, freeColor[0]])
        
        socket.emit('participantChange', await participantsForRoom(io, room.id))
        socket.in(room.id).emit('participantChange', await participantsForRoom(io, room.id))
    })

    socket.on('leave', async cb => {
        cb(await leaveRoom(io, socket))
    })
}
