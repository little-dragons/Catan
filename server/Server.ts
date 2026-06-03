import { readFileSync } from  'node:fs'
import { zValidator } from '@hono/zod-validator'
import { instrument } from '@socket.io/admin-ui'
import { Server as Engine, type WebSocketData } from '@socket.io/bun-engine'
import { compare, hash } from 'bcrypt'
import { CookieMap, randomUUIDv7 } from 'bun'
import { type GameClientEventMap, type GameServerEventMap, gameNamespace, type HonoSchema, queryNamespace, SocketPort, type User, UserType, validUsername } from 'catan-shared'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { cors } from 'hono/cors'
import type { CookieOptions } from 'hono/utils/cookie'
import { Server } from 'socket.io'
import z from 'zod'
import { addUserToDb, getUserFromDb, hasUserInDb } from './database/CommonQueries'
import { db } from './database/Connection'
import { type GameNamespace, type GameSocketDataType, isDevelopment, isProduction, type QueryNamespace } from './socketEvents/Common'
import { acceptGameEvents } from './socketEvents/GameEvents'
import { acceptLobbyEvents } from './socketEvents/LobbyEvents'
import { acceptRoomEvents, allLobbies, registerRoomMiddleware } from './socketEvents/RoomManager'

const io = new Server<GameServerEventMap, GameClientEventMap, object & {}, GameSocketDataType>()
const engine = new Engine({
    cors: {
        origin: [ 'https://admin.socket.io', 'http://localhost:5173', 'https://ichigancs.com:5173', 'http://127.0.0.1:5173' ],
        allowedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
        credentials: true
    },
})
io.bind(engine)

const cookieSessionName = 'session'
const cookieSessionOpts: CookieOptions = {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
}
const sessions = new Map<string, User>()

function hasUserInSessions(name: string) {
    for (const [_, user] of sessions)
        if (user.name === name)
            return true
    return false
}

const app = new Hono()
    .use(cors({
        origin: [ 'https://admin.socket.io', 'http://localhost:5173', 'https://ichigancs.com:5173', 'http://127.0.0.1:5173' ],
        credentials: true
    }))
    .post('/auth/check', c => {
        const cookie = getCookie(c, cookieSessionName)
        if (cookie === undefined)
            return c.json({ code: 'ANONYMOUS' as const }, 200)

        const user = sessions.get(cookie)
        if (user === undefined) {
            deleteCookie(c, cookieSessionName)
            return c.json({ code: 'ANONYMOUS' as const }, 200)
        }

        // refresh token
        setCookie(c, cookieSessionName, cookie, cookieSessionOpts)
        return c.json({ code: 'SIGNEDIN' as const, user: user }, 200)
    })
    .post('/auth/logout', c => {
        deleteCookie(c, cookieSessionName)
        return c.json({}, 200)
    })
    .post('/auth/register', zValidator('json', z.object({ username: z.string(), password: z.string() })), async c => {
        const { username, password } = c.req.valid('json')
        if (!validUsername(username))
            return c.json({ message: 'Name not allowed', code: 'NAME_INVALID' as const } , 422)
        if (hasUserInSessions(username) || await hasUserInDb(username))
            return c.json({ message: 'Name is taken', code: 'NAME_TAKEN' as const } , 409)

        const _dbRes = await addUserToDb(username, await hash(password, 12))
        // TODO check result

        const id = randomUUIDv7()
        sessions.set(id, { name: username, type: UserType.Member })
        setCookie(c, cookieSessionName, id, cookieSessionOpts)
        return c.json({}, 200)
    })
    .post('/auth/login/member', zValidator('json', z.object({ username: z.string(), password: z.string() })), async c => {
        const { username, password } = c.req.valid('json')
        const dbRes = await getUserFromDb(username)
        if (dbRes === undefined)
            return c.json({ message: 'Name not found', code: 'NAME_INVALID' as const }, 401)
        if (!(await compare(password, dbRes.password_hash)))
            return c.json({ message: 'Password invalid', code: 'PASSWORD_INVALID' as const }, 401)

        const id = randomUUIDv7()
        sessions.set(id, { name: username, type: UserType.Member })
        setCookie(c, cookieSessionName, id, cookieSessionOpts)
        return c.json({}, 200)
    })
    .post('/auth/login/guest', zValidator('json', z.object({ username: z.string() })), async c => {
        const name = c.req.valid('json').username
        if (!validUsername(name))
            return c.json({ message: 'Name not allowed', code: 'NAME_INVALID' as const } , 422)
        if (hasUserInSessions(name) || await hasUserInDb(name))
            return c.json({ message: 'Name is taken', code: 'NAME_TAKEN' as const } , 409)

        const sessionID = randomUUIDv7()
        setCookie(c, cookieSessionName, sessionID, cookieSessionOpts)
        sessions.set(sessionID, { name, type: UserType.Guest })
        return c.json({}, 200)
    })

type AppSchema = typeof app extends Hono<infer _Env, infer Sch, infer _Path> ? Sch : never

type _Debug1<_T extends HonoSchema> = true
type _Debug2<_T extends AppSchema> = true
type _Test1 = _Debug1<AppSchema>
type _Test2 = _Debug2<HonoSchema>



if (isDevelopment) {
    instrument(io, {
        auth: false,
        mode: 'development'
    })
}
if (isProduction && process.env.SOCKET_ADMIN_AUTH)
    instrument(io, {
        auth: {
            type: 'basic',
            username: readFileSync(`${process.env.SOCKET_ADMIN_AUTH}/username.txt`).toString(),
            password: readFileSync(`${process.env.SOCKET_ADMIN_AUTH}/password.txt`).toString()
        },
        mode: 'production'
    })

// automatically runs this configuration as server
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


async function printMemberCount() {
    const promise = await db.selectFrom('members').select(({ fn }) => fn.countAll().as('total_count')).execute()
    console.log(`Currently with ${promise[0].total_count} member(s)`)
}
printMemberCount()

const gn: GameNamespace = io.of(gameNamespace)
const qn: QueryNamespace = io.of(queryNamespace)


// valid login middleware
gn.use((socket, next) => {
    const cookie = socket.handshake.headers.cookie
    if (cookie === undefined)
        return next(new Error('Cookie not provided'))

    const map = new CookieMap(cookie)
    const sessionID = map.get(cookieSessionName)
    if (sessionID === null)
        return next(new Error('Session ID not provided'))

    const user = sessions.get(sessionID)
    if (user === undefined)
        return next(new Error('Invalid session ID'))

    socket.data.sessionID = sessionID
    socket.data.user = user
    next()
})

registerRoomMiddleware(gn)

gn.on('connection', socket => {
    acceptRoomEvents(gn, socket)
    acceptLobbyEvents(gn, socket)
    acceptGameEvents(gn, socket)
})

qn.on('connection', socket => {
    socket.on('lobbyList', async cb => cb(await allLobbies(gn)))
})