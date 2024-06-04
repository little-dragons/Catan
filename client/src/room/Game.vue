<script setup lang="ts">
import { currentGameRoom, currentRoom } from '@/socketWrapper/Room';
import { Resource, adjacentRoads, availableBuildingPositions, type Coordinate, type RedactedGameState, type RedactedPlayer, type Road, type User } from 'shared';
import { computed, ref, shallowRef, triggerRef, watch, watchEffect } from 'vue';
import { currentAuthUser } from '@/socketWrapper/Login';
import { gameSocket } from '@/socketWrapper/Socket';
import GameRenderer from './gameDrawing/GameRenderer.vue';

const renderer = ref<null | InstanceType<typeof GameRenderer>>(null)

function handleGameActionResult(res: true | 'invalid token' | 'invalid room id'| 'action not allowed') {
    if (res == true)
        return

    console.warn(`Game action did not complete correctly: ${res}, triggering state again`)
    // TODO handle errors elegantly. An idea is given below
    // potentially, if a action is rejected, the state may be completely wrong. Probably, triggering the state 
    // again will not destroy it further, only potentially help

    triggerRef(recompute)
}

const recompute = shallowRef(undefined)
const currentState = computed(() => {
    // when recompute is triggered, this function is recomputed
    recompute.value

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
    renderer.value.setInteractionPoints({ type: 'settlement', data: mapping, callback([finalSettlement, _]) {
        const chosenRoads = adjacentRoads(finalSettlement).map(x => [x, false] as [Road, boolean])
        renderer.value!.setInteractionPoints({ type: 'road', data: chosenRoads, async callback([finalRoad, _]) {
            const res = 
                await gameSocket.emitWithAck('gameAction', currentRoom.value!.id, currentAuthUser.value!.authToken, 
                { type: 'place initial buildings', road: finalRoad, settlement: finalSettlement })
            handleGameActionResult(res)
            renderer.value!.setInteractionPoints(undefined)
        }})
    }})
})

const myTurnToRollDice = computed(() => {
    return myTurn.value && currentState.value?.phase.type == 'normal' && currentState.value.phase.diceRolled == false
})
async function rollDice() {
    if (!myTurnToRollDice.value)
        return

    const res = await gameSocket.emitWithAck('gameAction', currentGameRoom.value!.id, currentAuthUser.value!.authToken, { type: 'roll dice' })
    handleGameActionResult(res)
}

const lastDice = ref<undefined | [number, number]>(undefined)
watchEffect(() => {
    if (currentState.value?.phase.type == 'normal' && currentState.value.phase.diceRolled != false)
        lastDice.value = currentState.value.phase.diceRolled

    if (currentState.value?.phase.type == 'normal' && lastDice.value == undefined)
        // this is to show the dice once the user is first required to roll them
        lastDice.value = [3, 3]
})

const canEndMyTurn = computed(() => {
    // TODO
    // robber?
    return myTurn.value && currentState.value?.phase.type == 'normal' && currentState.value.phase.diceRolled != false
})

async function endTurn() {
    if (!canEndMyTurn.value)
        return

    handleGameActionResult(
        await gameSocket.emitWithAck('gameAction', currentGameRoom.value!.id, currentAuthUser.value!.authToken, { type: 'finish turn' })
    )
}

function resourceClicked(res: Resource) {
    //TODO
}

</script>

<template>
    <div v-if="currentState != undefined" class="container">
        <GameRenderer ref="renderer" 
            :board="currentState.board" 
            :dice="lastDice" 
            :stocked-cards="currentState.self.handCards" 
            :offered-cards="[]"
            :is-my-turn="myTurn"
            :can-end-turn="canEndMyTurn"
            :other-players="[]"
            @dice-clicked="rollDice"
            @resource-clicked="resourceClicked"
            @end-turn-clicked="endTurn"/>
    </div>
</template>

<style scoped>
.container {
    width: max(min(calc(100vw - 200px), 1500px), 400px);
    display: flex;
    flex-direction: row;
    height: 90vh;
}

</style>

