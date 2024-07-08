<script setup lang="ts">
import { currentGameRoom, currentRoom } from '@/socketWrapper/Room';
import { Color, GamePhaseType, Resource, adjacentRoads, allowedActionsForMe, availableBuildingPositions, availableRoadPositions, type Coordinate, type RedactedGameState, type RedactedPlayer, type Road, type User } from 'shared';
import { computed, ref, render, shallowRef, triggerRef, watchEffect } from 'vue';
import { currentAuthUser } from '@/socketWrapper/Login';
import { gameSocket } from '@/socketWrapper/Socket';
import GameRenderer from './gameDrawing/GameRenderer.vue';
import { type PlayerOverviewData } from './gameDrawing/PlayerOverviewRenderer.vue';
import { type InteractionPoints } from './gameDrawing/board/Renderer.vue';
import { type GameActionAllowedMap, GameActionType } from 'shared/logic/GameAction';
import { List } from 'immutable';

const renderer = ref<null | InstanceType<typeof GameRenderer>>(null)

function handleGameActionResult(res: true | 'invalid socket state' | 'action not allowed') {
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
const currentAllowedActions = computed(() => {
    if (currentState.value == undefined)
        return undefined
    else
        return allowedActionsForMe(currentState.value)
})

const others = computed<List<[User, RedactedPlayer]>>(() => {
    if (currentState.value == undefined || currentGameRoom.value == undefined)
        return List()

    const otherUsers: List<[User, Color]> = currentGameRoom.value.users.filter(x => x[1] != currentState.value?.self.color)
    return otherUsers.map(user => [user[0], currentState.value?.players.find(player => player.color == user[1])!] as [User, RedactedPlayer])
})

const othersOverview = computed(() => {
    return others.value.map<PlayerOverviewData>(
        ([user, player]) => {  
            return {
                name: user.name,
                isGuest: user.type == 'guest',
                color: player.color,
                // TODO
                victoryPoints: 4,
            }
        })
})

const interactionPoints = ref<InteractionPoints<any> | undefined>(undefined)
// set interaction points for initial placements
watchEffect(() => {
    if (currentAllowedActions.value?.placeInitial != true || renderer.value == null)
        return

    const freeSettlements = availableBuildingPositions(currentState.value!.board, undefined)
    const mapping = freeSettlements.map(coord => [coord, false] as [Coordinate, boolean])
    interactionPoints.value = { 
        type: 'settlement', 
        data: mapping, 
        callback([finalSettlement, _]) {
            const chosenRoads = adjacentRoads(finalSettlement).map(x => [x, false] as [Road, boolean])
            interactionPoints.value = { 
                type: 'road', 
                data: chosenRoads, 
                async callback([finalRoad, _]) {
                    const res = 
                        await gameSocket.emitWithAck(
                            'gameAction', 
                            { 
                                type: GameActionType.PlaceInitial, 
                                road: finalRoad,
                                settlement: finalSettlement
                            })

                    handleGameActionResult(res)
                    interactionPoints.value = undefined
                }
            }
        }
    }
})

async function rollDice() {
    if (currentAllowedActions.value?.rollDice != true)
        return

    const res = await gameSocket.emitWithAck('gameAction', { type: GameActionType.RollDice })
    handleGameActionResult(res)
}

const lastDice = ref<undefined | [number, number]>(undefined)
watchEffect(() => {
    if (currentState.value?.phase.type == GamePhaseType.Normal && currentState.value.phase.diceRolled != false)
        lastDice.value = currentState.value.phase.diceRolled

    if (currentState.value?.phase.type == GamePhaseType.Normal && lastDice.value == undefined)
        // this is to show the dice once the user is first required to roll them
        lastDice.value = [3, 3]
})

async function endTurn() {
    if (currentAllowedActions.value?.finishTurn != true)
        return

    handleGameActionResult(
        await gameSocket.emitWithAck('gameAction', { type: GameActionType.FinishTurn })
    )
}

function resourceClicked(res: Resource) {
    //TODO
}
function buildCity() {
    // TODO
}
function buildRoad() {
    if (currentAllowedActions.value?.placeRoad != true || renderer.value == null || currentState.value == undefined)
        return

    const data = 
        availableRoadPositions(currentState.value.board, currentState.value.self.color)
        .map(x => [x, false] as [Road, boolean])

    console.log('place road')
    interactionPoints.value = {
        type: 'road',
        data: data,
        async callback([road, _]) {
            const res = await gameSocket.emitWithAck('gameAction', { type: GameActionType.PlaceRoad, coordinates: road })
            handleGameActionResult(res)
            interactionPoints.value = undefined
        }
    }
}
function buildSettlement() {
    // TODO
}

</script>

<template>
    <div v-if="currentState != undefined" class="container">
        <GameRenderer ref="renderer" 
            :board="currentState.board" 
            :dice="lastDice" 
            :stocked-cards="currentState.self.handCards" 
            :offered-cards="List()"
            :allowed-actions="currentAllowedActions!"
            :other-players="othersOverview"            
            other-players-display="radial"
            :interaction-points="interactionPoints"
            @dice-clicked="rollDice"
            @resource-clicked="resourceClicked"
            @build-road="buildRoad"
            @build-settlement="buildSettlement"
            @build-city="buildCity"
            @end-turn="endTurn"/>
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

