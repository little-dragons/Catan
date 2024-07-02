import { SocketPort, type ClientEventMap, type LobbyRoom, type RedactedGameRoom, type RoomId, type ServerEventMap, type User } from "shared"
import { readonly, ref, watch, type DeepReadonly } from "vue"
// import { fullSocket } from "./socketWrapper/Socket"
import { io, type Socket } from "socket.io-client"
import { isDevelopment, isProduction } from "./misc/Globals"

let address: string = undefined!
if (isDevelopment)
    address = `http://localhost:${SocketPort}`
else if (isProduction)
    address = `https://ichigancs.com:${SocketPort}`

const socket: Socket<ClientEventMap, ServerEventMap> = io(address)

export enum RejectedLoginReason {
    InvalidPassword,
    InvalidUsername,
    // invalid state always means that something unexpected occured
    InvalidServerState
}

export enum ActionResult {
    InvalidClientState,
    UnknownError,
    Success
}

export enum UserStateType {
    Anonymous,
    PendingLogin,
    LoggedInNoRoom,
    LoggedInJoiningRoom,
    LoggedInWithRoom
}
type DataForStateType = {
    Anonymous: 'tryMemberLogin' | 'tryGuestLogin'
    PendingLogin: 'pendingLogin'
    LoggedInNoRoom: 'user' | 'logout' | 'joinRoom'
    LoggedInJoiningRoom: 'user' | 'pendingRoom'
    LoggedInWithRoom: 'user' | 'room' | 'leaveRoom'
}
type AllData = {
    user: User
    tryGuestLogin: typeof tryGuestLogin
    tryMemberLogin: typeof tryMemberLogin
    pendingLogin: User
    logout: typeof logout

    room: LobbyRoom | RedactedGameRoom
    joinRoom: typeof joinRoom
    pendingRoom: RoomId
    leaveRoom: typeof leaveRoom
}
type ToUndef<T> = {
    [P in keyof T]?: undefined;
}

type UserState<Current extends keyof typeof UserStateType> = 
    ToUndef<Omit<AllData, DataForStateType[Current]>> & Pick<AllData, DataForStateType[Current]>

type TaggedType<Type extends keyof typeof UserStateType> = { tag: typeof UserStateType[Type], val: UserState<Type> }
function makeTagged<Type extends keyof typeof UserStateType>(type: Type, x: UserState<Type>) {
    return { tag: UserStateType[type], val: x }
}
type AnyUserState = 
    { [x in keyof typeof UserStateType]: TaggedType<x> } [keyof typeof UserStateType]



const userStateBacking = ref<AnyUserState>(makeTagged('Anonymous', { tryGuestLogin, tryMemberLogin }))
export const userState = readonly(userStateBacking)


async function tryGuestLogin(name: string): Promise<ActionResult | RejectedLoginReason> {
    if (userStateBacking.value.tag != UserStateType.Anonymous) {
        console.warn('Guest login was attempted although the user state was not correct.')
        return ActionResult.InvalidClientState
    }

    const request: User = { type: 'guest', name }
    userStateBacking.value = makeTagged('PendingLogin', { pendingLogin: request })

    const res = await socket.emitWithAck('guestLogin', name)
    if (res == true) {
        userStateBacking.value =  makeTagged('LoggedInNoRoom', { user: request, logout, joinRoom })
        return ActionResult.Success
    }

    userStateBacking.value = makeTagged('Anonymous', { tryGuestLogin, tryMemberLogin})
    if (res == 'invalid socket state')
        return RejectedLoginReason.InvalidServerState
    if (res == 'name in use' || res == 'name not allowed')
        return RejectedLoginReason.InvalidUsername
    

    console.warn(`Unexpected guest login attempt with result: ${res}`)
    return ActionResult.UnknownError
}

async function tryMemberLogin(name: string, password: string): Promise<ActionResult | RejectedLoginReason> {
    if (userStateBacking.value.tag != UserStateType.Anonymous) {
        console.warn('Member login was attempted although the user state was not correct.')
        return ActionResult.InvalidClientState
    }

    const request: User = { type: 'member', name }
    userStateBacking.value = makeTagged('PendingLogin', { pendingLogin: request })

    const loginData = await socket.emitWithAck('requestMemberLoginData', name)
    if (loginData == 'already logged in' || loginData == 'invalid socket state')
        // TODO handle already logged in
        return RejectedLoginReason.InvalidServerState

    if (loginData == 'name unknown')
        return RejectedLoginReason.InvalidUsername

    const res = await socket.emitWithAck('memberLogin', name, password, loginData)
    if (res == true) {
        userStateBacking.value =  makeTagged('LoggedInNoRoom', { user: request, logout, joinRoom })
        return ActionResult.Success
    }

    if (res == 'invalid socket state' || res == 'invalid nonce')
        return RejectedLoginReason.InvalidServerState
    if (res == 'name unknown')
        return RejectedLoginReason.InvalidUsername
    if (res == 'invalid password')
        return RejectedLoginReason.InvalidPassword

    console.warn(`Unexpected guest login attempt with result: ${res}`)
    return ActionResult.UnknownError
}

async function logout(): Promise<ActionResult> {
    if (userStateBacking.value.tag != UserStateType.LoggedInNoRoom) {
        console.warn(`Cannot log out from state ${userStateBacking.value.tag}`)
        return ActionResult.InvalidClientState
    }
    await socket.emitWithAck('logout')
    userStateBacking.value = makeTagged('Anonymous', { tryGuestLogin, tryMemberLogin })
    return ActionResult.Success
}

export enum RejectRoomJoin {
    InvalidRoomId,
    InvalidSocketState,
}

async function joinRoom(id: RoomId): Promise<ActionResult | RejectRoomJoin> {
    if (userStateBacking.value.tag != UserStateType.LoggedInNoRoom) {
        console.warn(`Cannot join room out from state ${userStateBacking.value.tag}`)
        return ActionResult.InvalidClientState
    }

    const user = userStateBacking.value.val.user
    userStateBacking.value = makeTagged('LoggedInJoiningRoom', { user, pendingRoom: id })
    const res = await socket.emitWithAck('join', id)
    if (res == 'invalid room id') {
        userStateBacking.value = makeTagged('LoggedInNoRoom', { user, logout, joinRoom })
        return RejectRoomJoin.InvalidRoomId
    }
    if (res == 'invalid socket state') {
        userStateBacking.value = makeTagged('LoggedInNoRoom', { user, logout, joinRoom })
        return RejectRoomJoin.InvalidSocketState
    }

    userStateBacking.value = makeTagged('LoggedInWithRoom', { user, leaveRoom, room: res })
    return ActionResult.Success
}

async function leaveRoom(): Promise<ActionResult> {
    return ActionResult.Success
}

// TODO
socket.on('gameEvent', () => {})
socket.on('gameStarted', () => {})
socket.on('settingsChange', () => {})
socket.on('userChange', () => {})