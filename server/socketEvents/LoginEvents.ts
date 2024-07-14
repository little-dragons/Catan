import { LoginClientEventMap, LoginServerEventMap, registerServerListener, SocketImplementation, validUsername } from "shared";
import { addUserToDb, getUserFromDb } from "../database/CommonQueries";
import bcrypt from 'bcrypt'
import { type Socket } from 'socket.io'
import { SocketDataType, SocketServerType } from "./Common";
import { v4 } from "uuid";



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
    const listener: SocketImplementation<LoginServerEventMap> = {
        guestLogin: [true, 
            async (name) => {
                if (socket.data.user != undefined)
                    return 'invalid socket state'
        
                const nameRes = await nameAllowed(io, name)
                if (nameRes != true)
                    return nameRes
        
                socket.data = { user: { type: 'guest', name } }
                return true
            }
        ],
        registerMember: [true,
            async (name, password) => {
                if (socket.data.user != undefined)
                    return 'invalid socket state'
        
                const nameRes = await nameAllowed(io, name)
                if (nameRes != true)
                    return nameRes
        
                const hashed = await bcrypt.hash(password, 12)
                const dbRes = await addUserToDb(name, hashed)
                // TODO check result
        
                socket.data = { user: { type: 'member', name } }
                return true
            }
        ],
        requestMemberLoginData: [true,
            async (name) => {
                if (socket.data.user != undefined)
                    return 'invalid socket state'
        
                const dbUser = await getUserFromDb(name)
                if (dbUser == undefined)            
                    return 'name unknown'
            
                if (socket.data.nonce == undefined)
                    socket.data.nonce = { value: v4() }
        
                return socket.data.nonce
            }
        ],
        memberLogin: [true,
            async (name, password, nonce) => {
                if (socket.data.user != undefined)
                    return 'invalid socket state'
        
                const dbUser = await getUserFromDb(name)
                if (dbUser == undefined)            
                    return 'name unknown'
            
                if (socket.data.nonce == undefined)
                    return 'invalid socket state'
        
                if (socket.data.nonce.value != nonce.value)
                    return 'invalid nonce'
            
                if (!await bcrypt.compare(password, dbUser.password_hash))
                    return 'invalid password'
            
                socket.data = { user: { type: 'member', name }}
                return true
            }
        ],
        logout: [true,
            async () => {
                if (socket.data.user == undefined)
                    return 'invalid socket state'
        
                // TODO potentially delete some data? leave room?
                socket.data = { user: undefined }
                return true
            }
        ],
        socketState: [true,
            () => socket.data
        ]
    }

    registerServerListener(socket, listener)
}
