import { newRandomPasswordNonce, LoginClientEventMap, LoginServerEventMap, validUsername } from "shared";
import { addUserToDb, getUserFromDb } from "../database/CommonQueries";
import bcrypt from 'bcrypt'
import { type Socket } from 'socket.io'
import { SocketDataType, SocketServerType } from "./Common";



async function checkNameInUse(io: SocketServerType, name: string) {
    const loggedIn = (await io.fetchSockets()).some(x => x.data.user?.name == name)
    const inDb = false // TODO
    return loggedIn || inDb
}
async function nameAllowed(io: SocketServerType, name: string) {
    // TODO check names currently handled
    if (await checkNameInUse(io, name))
        return 'name in use'
    if (!validUsername(name))
        return 'name not allowed'
    return true
}

type LoginSocket = Socket<LoginServerEventMap, LoginClientEventMap, {}, SocketDataType>
export function acceptLoginEvents(io: SocketServerType, socket: LoginSocket) {
    socket.on('guestLogin', async (name, cb) => {
        if (socket.data.user != undefined)
            return cb('invalid socket state')

        const nameRes = await nameAllowed(io, name)
        if (nameRes != true)
            return cb(nameRes)

        socket.data = { user: { type: 'guest', name } }
        return cb(true)
    })

    socket.on('registerMember', async (name, password, cb) => {
        if (socket.data.user != undefined)
            return cb('invalid socket state')

        const nameRes = await nameAllowed(io, name)
        if (nameRes != true)
            return cb(nameRes)

        const hashed = await bcrypt.hash(password, 12)
        const dbRes = await addUserToDb(name, hashed)
        // TODO check result

        socket.data = { user: { type: 'member', name } }
        return cb(true)
    })

    socket.on('requestMemberLoginData', async (name, cb) => {
        if (socket.data.user != undefined)
            return cb('invalid socket state')

        const dbUser = await getUserFromDb(name)
        if (dbUser == undefined)            
            return cb('name unknown')
    
        if (socket.data.nonce == undefined)
            socket.data.nonce = newRandomPasswordNonce()

        return cb(socket.data.nonce)
    })

    socket.on('memberLogin', async (name, password, nonce, cb) => {
        if (socket.data.user != undefined)
            return cb('invalid socket state')

        const dbUser = await getUserFromDb(name)
        if (dbUser == undefined)            
            return cb('name unknown')
    
        if (socket.data.nonce == undefined)
            return cb('invalid socket state')

        if (socket.data.nonce.value != nonce.value)
            return cb('invalid nonce')
    
        if (!await bcrypt.compare(password, dbUser.password_hash))
            return cb('invalid password')
    
        socket.data = { user: { type: 'member', name }}
        return cb(true)
    })

    socket.on('logout', cb => {
        if (socket.data.user == undefined)
            return cb('invalid socket state')

        // TODO potentially delete some data? leave room?
        socket.data = { user: undefined }
        return cb(true)
    })
}
