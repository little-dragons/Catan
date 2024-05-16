import { BuildingType, ClientEventMap, Color, ServerEventMap, SocketPort, defaultBoard } from "shared"
import { Server, Socket } from "socket.io"

const io = new Server<ServerEventMap, ClientEventMap>(SocketPort, {
    cors: {
        origin: '*',
        allowedHeaders: ['Access-Control-Allow-Origin']
    }
})

console.log('Server is listening.')

const board = defaultBoard(0)
board.roads.push([Color.Red, [6,6], [7,6]])
board.buildings.push([Color.Green, [4,4], BuildingType.Settlement])

io.on('connection', socket => {
    console.log('User connected.')

    socket.on('requestState', () => {
        socket.emit('state', { board })
    })
})