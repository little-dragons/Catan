<script setup lang="ts">
import { currentGameRoom, currentRoom } from '@/socketWrapper/Room';
import { adjacentRoads, availableBuildingPositions, type Coordinate, type RedactedGameState, type RedactedPlayer, type User } from 'shared';
import { computed, ref, watch, watchEffect } from 'vue';
import { currentAuthUser } from '@/socketWrapper/Login';
import { gameSocket } from '@/socketWrapper/Socket';
import StateRenderer from '@/drawing/StateRenderer.vue';

const renderer = ref<null | InstanceType<typeof StateRenderer>>(null)

function handleGameActionResult(res: true | 'invalid token' | 'invalid room id'| 'action not allowed') {
    if (res == true)
        return

    console.warn(`Game action did not complete correctly: ${res}`)
}

const currentState = computed(() => {
    if (currentGameRoom.value?.state != undefined)
        return currentGameRoom.value.state as unknown as RedactedGameState
    else
        return undefined
})

const myColor = computed(() => {
    if (currentAuthUser.value == undefined || currentGameRoom.value == undefined) {
        console.warn('Does not meet prerequisites')
        return
    }

    return currentGameRoom.value.users.filter(x => x[0].name == currentAuthUser.value!.name)[0][1]
})
const others = computed(() => {
    if (currentState.value == undefined || currentGameRoom.value == undefined || currentAuthUser.value == undefined)
        return undefined
    
    const otherUsers = currentGameRoom.value.users.filter(x => x[0].name != currentAuthUser.value!.name)
    return otherUsers.map(user => [user[0], currentState.value?.players.find(player => player.color == user[1])!] as [User, RedactedPlayer])
})

const myTurn = computed(() => {
    return myColor.value != undefined && currentState.value?.currentPlayer == myColor.value
})

const myTurnForInitialPlacement = computed(() => {
    return myTurn.value && currentState.value?.phase.type == 'initial'
})

// set interaction points for initial placements
watchEffect(() => {
    if (myTurnForInitialPlacement.value != true || renderer.value == null)
        return

    const freeSettlements = availableBuildingPositions(currentState.value!.board, undefined)
    const mapping = freeSettlements.map(coord => [coord, 'test'] as [Coordinate, string])
    renderer.value.setInteractionPoints({ type: 'settlement', data: mapping }, finalSettlement => {
        const chosenRoads = adjacentRoads(finalSettlement[0]).map(x => [x, false] as [[Coordinate, Coordinate], boolean])
        renderer.value!.setInteractionPoints({ type: 'road', data: chosenRoads}, async finalRoad => {
            const res = 
                await gameSocket.emitWithAck('gameAction', currentRoom.value!.id, currentAuthUser.value!.authToken, 
                { type: 'place initial buildings', road: finalRoad[0], settlement: finalSettlement[0] })
            handleGameActionResult(res)
            renderer.value!.clearInteractionPoints()
        })
    })
})

const myTurnToRollDice = computed(() => {
    return myTurn && currentState.value?.phase.type == 'normal' && currentState.value.phase.diceRolled == false
})
async function rollDice() {
    if (!myTurnToRollDice.value)
        return

    const res = await gameSocket.emitWithAck('gameAction', currentGameRoom.value!.id, currentAuthUser.value!.authToken, { type: 'roll dice' })
    handleGameActionResult(res)
}

const canFinishMyTurn = computed(() => {
    // TODO
    // robber?
    return myTurn.value && currentState.value?.phase.type == 'normal' && currentState.value.phase.diceRolled != false
})

async function finishTurn() {
    if (!canFinishMyTurn)
        return

    handleGameActionResult(
        await gameSocket.emitWithAck('gameAction', currentGameRoom.value!.id, currentAuthUser.value!.authToken, { type: 'finish turn' })
    )
}

</script>

<template>
    <button :disabled="!canFinishMyTurn" @click="finishTurn">Finish turn</button>
    <div v-if="currentState != undefined" class="container">
        <div class="board">            
            <p v-if="myTurn">It's your turn.</p>
            <StateRenderer ref="renderer" v-model="currentState" :stocked-cards="currentState.self.handCards" :offered-cards="[]" @dice-clicked="rollDice"/>
        </div>
        <div class="others">
            <div v-if="others != undefined" v-for="other in others">
                <p>{{ other[0].name }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    width: calc(100vw - 100px);
    display: flex;
    flex-direction: row;
}

.board {
    width: 50rem;
}


</style>

