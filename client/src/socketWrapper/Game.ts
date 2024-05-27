import { gameSocket, lobbySocket } from "./Socket";
import { currentGameRoom, currentRoomBacking } from "./Room";
import { currentAuthUser } from "./Login";


export async function rollDice() {
    if (currentGameRoom.value == null) {
        console.warn('Tried to roll dice, but not in a game')
        return
    }
    if (currentAuthUser.value == null) {
        console.error('User is in a game, but not logged in???')
        return
    }

    return await gameSocket.emitWithAck('gameAction', currentGameRoom.value.id, currentAuthUser.value.authToken, { type: 'roll dice' })
}
export async function finishTurn() {
    if (currentGameRoom.value == null) {
        console.warn('Tried to roll dice, but not in a game')
        return
    }
    if (currentAuthUser.value == null) {
        console.error('User is in a game, but not logged in???')
        return
    }

    return await gameSocket.emitWithAck('gameAction', currentGameRoom.value.id, currentAuthUser.value.authToken, { type: 'finish turn' })
}

export async function fetchNewState() {
    if (currentRoomBacking.value == undefined || currentRoomBacking.value.type != 'ingame') {
        console.warn('Received game event, but not in active game.')
        return
    }
    if (currentAuthUser.value == undefined) {
        console.warn('In game, but user is not logged in???')
        return
    }

    const newState = await gameSocket.emitWithAck('gameState', currentRoomBacking.value.id, currentAuthUser.value.authToken)
    
    if (newState == 'invalid room id' || newState == 'invalid token') {
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
        const res = await gameSocket.emitWithAck('fullGameRoom', currentRoomBacking.value.id, currentAuthUser.value.authToken)
        
        if (res == 'invalid room id' || res == 'invalid token') {
            console.warn(`Could not fetch new game room: ${res}`)
            return
        }
    
        currentRoomBacking.value = res
    })    
}