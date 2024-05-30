<script setup lang="ts">
import { currentGameRoom, currentRoom } from '@/socketWrapper/Room';
import { adjacentRoads, availableBuildingPositions, type Coordinate, type RedactedGameState } from 'shared';
import { computed, ref, watch, watchEffect } from 'vue';
import { currentAuthUser } from '@/socketWrapper/Login';
import { gameSocket } from '@/socketWrapper/Socket';
import StateRenderer from '@/drawing/StateRenderer.vue';
import { finishTurn, rollDice } from '@/socketWrapper/Game';

const currentState = computed(() => {
    if (currentGameRoom.value?.state != undefined)
        return currentGameRoom.value.state as unknown as RedactedGameState
    else
        return undefined
})
const renderer = ref<null | InstanceType<typeof StateRenderer>>(null)

const myColor = computed(() => {
    if (currentAuthUser.value == undefined || currentGameRoom.value == undefined) {
        console.warn('Does not meet prerequisites')
        return
    }

    return currentGameRoom.value.users.filter(x => x[0].name == currentAuthUser.value!.name)[0][1]
})

const myTurn = computed(() => {
    return myColor.value != undefined && currentState.value?.currentPlayer == myColor.value
})

const myTurnForInitialPlacement = computed(() => {
    return myTurn.value && currentState.value?.phase.type == 'initial'
})

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
            console.log(res)
        })
    })
})

async function place1() {
    const res = 
        await gameSocket.emitWithAck('gameAction', currentRoom.value!.id, currentAuthUser.value!.authToken, 
        { type: 'place initial buildings', road: [[5,6], [5,5]], settlement: [5, 6]})
    console.log(res)
}
async function place2() {
    const res = 
        await gameSocket.emitWithAck('gameAction', currentRoom.value!.id, currentAuthUser.value!.authToken, 
        { type: 'place initial buildings', road: [[3,4], [4,4]], settlement: [4, 4]})
    console.log(res)
}
async function place3() {
    const res = 
        await gameSocket.emitWithAck('gameAction', currentRoom.value!.id, currentAuthUser.value!.authToken, 
        { type: 'place initial buildings', road: [[9,2], [10,2]], settlement: [10, 2]})
    console.log(res)
}
async function place4() {
    const res = 
        await gameSocket.emitWithAck('gameAction', currentRoom.value!.id, currentAuthUser.value!.authToken, 
        { type: 'place initial buildings', road: [[7,4], [8,4]], settlement: [8, 4]})
    console.log(res)
}

function throwDice() {
    console.log('throw dice')
    rollDice()
} 
</script>

<template>    
    <div v-if="currentState != undefined">
        <p v-if="myTurn">It's your turn.</p>
        <button @click="place1">Place at 1</button>
        <button @click="place2">Place at 2</button>
        <button @click="place3">Place at 3</button>
        <button @click="place4">Place at 4</button>
        <button @click="finishTurn">Finish turn</button>
        <StateRenderer ref="renderer" v-model="currentState" @dice-clicked="rollDice"/>
    </div>
</template>

