import { ClientEventMap, ServerEventMap, SocketPort } from "shared"
import { Server, Socket } from "socket.io"

const io = new Server<ServerEventMap, ClientEventMap>(SocketPort, {
    cors: {
        origin: '*',
        allowedHeaders: ['Access-Control-Allow-Origin']
    }
})

console.log('Server is listening.')

io.on('connection', socket => {
    socket.emit('sendHello', 'Hello, world!')
    socket.on('requestDisconnect', msg => console.log(msg))
    console.log('User connected.')
})