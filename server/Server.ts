import { ClientEventMap, ServerEventMap, SocketPort, type HonoSchema } from "catan-shared"
import { Server } from "socket.io"
import { Server as Engine, WebSocketData } from '@socket.io/bun-engine'
import { Hono } from 'hono'
import { readFileSync } from  'fs'
import { acceptLobbyEvents } from "./socketEvents/LobbyEvents"
import { acceptGameEvents } from "./socketEvents/GameEvents"
import { acceptRoomEvents, leaveRoom } from "./socketEvents/RoomManager"
import { instrument } from "@socket.io/admin-ui"
import { SocketDataType, isDevelopment, isProduction } from "./socketEvents/Common"
import { db } from "./database/Connection"
import { acceptLoginEvents } from "./socketEvents/LoginEvents"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { cors } from "hono/cors"

const io = new Server<ServerEventMap, ClientEventMap, {}, SocketDataType>()
const engine = new Engine({
    cors: {
        origin: [ 'https://admin.socket.io', 'http://localhost:5173', 'https://ichigancs.com:5173', 'http://127.0.0.1:5173' ],
        allowedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
        credentials: true
    },
})
io.bind(engine)

const app = new Hono()
    .use(cors({
        origin: [ 'https://admin.socket.io', 'http://localhost:5173', 'https://ichigancs.com:5173', 'http://127.0.0.1:5173' ],
        credentials: true
    }))
    .post('/auth/register', zValidator('json', z.object({ username: z.string(), password: z.string() })), c => {
        return c.json({ success: true, name: c.req.valid('json').username }, 200)
    })

type OnlyTrue<T extends true> = T
type AssertContract = OnlyTrue<
    typeof app extends Hono<any, infer Sch, any> ? 
        Sch extends HonoSchema ? HonoSchema extends Sch ? true : false : 
    false : false>



if (isDevelopment)
    instrument(io, {
        auth: false,
        mode: 'development'
    })
if (isProduction && process.env.SOCKET_ADMIN_AUTH)
    instrument(io, {
        auth: {
            type: 'basic',
            username: readFileSync(`${process.env.SOCKET_ADMIN_AUTH}/username.txt`).toString(),
            password: readFileSync(`${process.env.SOCKET_ADMIN_AUTH}/password.txt`).toString()
        },
        mode: 'production'
    })

    
export default {
    port: SocketPort,
    tls: isProduction ? {
        key: readFileSync(`${process.env.SSL_DIR}/privkey.pem`),
        cert: readFileSync(`${process.env.SSL_DIR}/fullchain.pem`)
    } : undefined,
    fetch(req: Request, server: Bun.Server<WebSocketData>) {
        const url = new URL(req.url)
        if (url.pathname.startsWith('/socket.io/'))
            return engine.handleRequest(req, server)
        else
            return app.fetch(req)
    },
    websocket: engine.handler().websocket
}


// console.log(`Server is listening on port ${SocketPort}`)
async function printMemberCount() {
    const promise = await db.selectFrom('members').select(({ fn }) => fn.countAll().as("total_count")).execute()
    console.log(`Currently with ${promise[0].total_count} member(s)`)
}
printMemberCount()

io.on('connection', socket => {
   
    acceptLoginEvents(io, socket)
    acceptRoomEvents(io, socket)
    acceptLobbyEvents(io, socket)
    acceptGameEvents(io, socket)

    socket.on('disconnect', async (reason, desc) => {
        if (socket.data.room != undefined) {
            await leaveRoom(io, socket)
        }
        socket.data = { user: undefined }
    })
})