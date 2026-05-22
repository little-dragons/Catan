import { FullRoom, RoomId, LobbyRoom, FullGameRoom, History, Color, RoomType, PostGameRoom, defaultScenario, ParticipantType, Participant, generateStateFromScenario, randomUnusedColor, GameServerEventMap, GameClientEventMap, randomSeed, RoomRequestSchema, socketConnectError, SocketConnectErrorCode, gameNamespace } from "catan-shared"
import { RemoteSocket } from 'socket.io'
import { GameNamespace, GameSocket, GameSocketDataType } from "./Common"
import { defaultSettings, Bot, BotPersonality } from "catan-shared"


export type ServerLobbyRoom    = Omit<LobbyRoom   , 'participants'> & { bots : [Bot, Color][] }
export type ServerGameRoom     = Omit<FullGameRoom, 'participants'> & { bots : [Bot, Color][] }
export type ServerPostGameRoom = Omit<PostGameRoom, 'participants'> & { bots : [Bot, Color][] }
export type ServerRoom         = Omit<FullRoom    , 'participants'> & { bots : [Bot, Color][] }

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


/**
 * Returns an array for each socket in the room.
 */
export function socketsForRoom(io: GameNamespace, roomId: RoomId): Promise<RemoteSocket<GameClientEventMap, GameSocketDataType>[]> {
    return io.in(roomId).fetchSockets()
}
export async function participantsForRoom(io: GameNamespace, roomId: RoomId): Promise<Participant[]> {
    const users = (await socketsForRoom(io, roomId)).map<Participant>(x => ({ 
        type: ParticipantType.User, 
        user: x.data.user, 
        color: x.data.color 
    }))
    const bots = rooms.get(roomId)?.bots.map<Participant>(bot => ({ 
        type: ParticipantType.Bot, bot: bot[0], color: bot[1] 
    }))
    return users.concat(bots ?? [])
}

export async function emitParticipantsChange(io: GameNamespace, roomId: RoomId) {
    const parts = await participantsForRoom(io, roomId)
    io.in(roomId).emit('participantChange', parts)
}

export async function initializeGame(io: GameNamespace, room: ServerLobbyRoom) {
    if (!rooms.has(room.id)) {
        console.warn(`Tried to initialize game, but there was no such lobby: ${room}`)
        return 'no correct room'
    }
    const participants = await participantsForRoom(io, room.id)
    // TODO correct current player
    const state = generateStateFromScenario(room.scenario, participants.map(x => x.color), participants[0].color, room.settings.seed)
    if (state == undefined)
        return 'could not generate state'

    const game: ServerGameRoom = {
        ...room,
        type: RoomType.InGame,
        state: state
    }
    rooms.set(room.id, game)

    return true
}

export function endGame(io: GameNamespace, room: ServerGameRoom) {
    const history: History = {
        lastState: room.state
    }

    io.in(room.id).emit('gameOver', history)

    const newRoom: ServerPostGameRoom = {
        ...room,
        type: RoomType.PostGame,
        history
    }
    rooms.set(room.id, newRoom)
}

/**
 * Registers a middleware on a given server and namespace to establish that each connection attempt
 * lists a valid join or create room request. Also creates the rooms.
 * 
 * Implementation detail: since the middleware should be side effect free, the rooms are not created 
 * during the middleware calls. Instead an additional listener on 'connection' is registered and the
 * actual room creation and socket room joins are delayed until the connection is truly accepted. This
 * is also the purpose of {@link GameSocketDataType.pendingRoomNameRequest}
 */
export function registerRoomMiddleware(io: GameNamespace) {
    io.use(async (socket, next) => {
        const auth = RoomRequestSchema.safeParse(socket.handshake.auth)
        if (!auth.success)
            return next(new Error('Malformed auth'))
    
        switch(auth.data.request) {
            case "join":
                const room = rooms.get(auth.data.roomID)
                if (room == undefined)
                    return next(socketConnectError('Room does not exist', SocketConnectErrorCode.RoomNameInvalid))
                
                const p = await participantsForRoom(io, room.id)
                if (room.scenario.players.maxAllowedCount <= p.length)
                    return next(socketConnectError('Room full', SocketConnectErrorCode.RoomFull))
                
                socket.data.roomID = auth.data.roomID
                return next()
    
            case "create":
                socket.data.roomID = randomSeed()
                socket.data.pendingRoomNameRequest = auth.data.roomName
                return next()
        }
    })

    io.on('connection', async s => {
        s.join(s.data.roomID)
        if (s.data.pendingRoomNameRequest !== undefined)
            rooms.set(s.data.roomID, {
                type: RoomType.Lobby,
                name: s.data.pendingRoomNameRequest,
                id: s.data.roomID,
                owner: s.data.user,
                settings: defaultSettings(),
                scenario: defaultScenario,
                bots: []
            })

        s.data.color = randomUnusedColor((await participantsForRoom(io, s.data.roomID)).map(x => x.color))!
        await emitParticipantsChange(io, s.data.roomID)
    })
}

export async function allLobbies(io: GameNamespace) {
    return (await Promise.all(
        Array.from(rooms.values()).filter(isLobby).map<Promise<LobbyRoom>>(async room => ({ 
            ...room,
            participants: await participantsForRoom(io, room.id)
        }))
    ))
}

export function acceptRoomEvents(io: GameNamespace, socket: GameSocket) {
    socket.on('addBot', async cb => {
        if (typeof cb != 'function') {
            console.warn('invalid arguments:', cb)
            return (cb as any)('invalid arguments')
        }

        const room = lobbyRoomFor(socket.data.roomID)
        if (room == undefined)
            return cb('invalid socket state')

        if (room.owner.name != socket.data.user.name)
            return cb('not the owner')

        const participants = await participantsForRoom(io, room.id)
        if (participants.length >= room.scenario.players.maxAllowedCount)
            return cb('room full')

        room.bots.push([{
            name: 'Vincent',
            personality: BotPersonality.Vincent
        }, randomUnusedColor(participants.map(x => x.color))! ])
        
        await emitParticipantsChange(io, room.id)
        return cb(true)
    })

    socket.on('disconnect', async () => {
        const id = socket.data.roomID
        const room = rooms.get(id)
        if (room == undefined) {
            console.warn('Socket contained invalid room id.')
            return
        }

        const users = await socketsForRoom(io, id)
        if (room.owner.name == socket.data.user.name || users.length < 1 || room.type == RoomType.InGame) {
            // the ingame check is because the logic currently breaks when a participant leaves.
            // see: https://github.com/little-dragons/Catan/issues/32
            
            rooms.delete(id)
            io.in(id).disconnectSockets()
        }
        else {
            emitParticipantsChange(io, id)
        }
    })
}
