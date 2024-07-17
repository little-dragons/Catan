import { gameSocket, lobbySocket } from "./Socket";
import { currentRoomBacking } from "./Room";
import { currentAuthUser } from "./Login";
import { RoomType } from "shared";


export async function fetchNewState() {
    if (currentRoomBacking.value == undefined || currentRoomBacking.value.type != RoomType.InGame) {
        console.warn('Received game event, but not in active game.')
        return
    }
    if (currentAuthUser.value == undefined) {
        console.warn('In game, but user is not logged in???')
        return
    }

    const newState = await gameSocket.emitWithAck('gameState')
    
    if (newState == 'invalid socket state') {
        console.warn(`Could not fetch new game state: ${newState}`)
        return
    }

    currentRoomBacking.value.state = newState
}

export function acceptGameEvents() {
    gameSocket.on('gameEvent', fetchNewState)
    
    lobbySocket.on('gameStarted', async() => {
        if (currentRoomBacking.value == undefined) {
            console.warn('Received game started, but not in a room.')
            return
        }
        if (currentAuthUser.value == undefined) {
            console.warn('In room, but user is not logged in???')
            return
        }
        const res = await gameSocket.emitWithAck('fullGameRoom')
        
        if (res == 'invalid socket state') {
            console.warn(`Could not fetch new game room: ${res}`)
            return
        }
    
        currentRoomBacking.value = res
    })

    gameSocket.on('gameOver', history => {
        // TODO
    })
}