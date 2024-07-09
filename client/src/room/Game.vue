<script setup lang="ts">
import { currentGameRoom } from '@/socketWrapper/Room';
import { BuildingType, Color, GamePhaseType, Resource, adjacentRoads, allowedActionsForMe, availableBuildingPositions, availableRoadPositions, type Coordinate, type RedactedGameState, type RedactedPlayer, type Road, type User } from 'shared';
import { computed, ref, shallowRef, triggerRef, watchEffect } from 'vue';
import { gameSocket } from '@/socketWrapper/Socket';
import GameRenderer from './gameDrawing/GameRenderer.vue';
import { type PlayerOverviewData } from './gameDrawing/PlayerOverviewRenderer.vue';
import { UserSelectionType } from './gameDrawing/board/UserSelection';
import { type GameAction, GameActionType } from 'shared/logic/GameAction';
import { List } from 'immutable';

const renderer = ref<null | InstanceType<typeof GameRenderer>>(null)

async function sendAction(action: GameAction) {
    const response = await gameSocket.emitWithAck('gameAction', action)
    if (response == true)
        return

    console.warn(`Game action did not complete correctly: ${response}, triggering state again`)
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

// set interaction points for initial placements
watchEffect(async () => {
    if (currentAllowedActions.value?.placeInitial != true || renderer.value == null)
        return

    const freeSettlements = availableBuildingPositions(currentState.value!.board, undefined)

    let settlement: Coordinate | undefined = undefined
    let road: Road | undefined = undefined
    do {
        settlement = await renderer.value.getUserSelection(UserSelectionType.Crossing, freeSettlements, { noAbort: true })
        road = await renderer.value.getUserSelection(UserSelectionType.Connection, adjacentRoads(settlement))
    } while(settlement == undefined || road == undefined)

    await sendAction(
        { 
            type: GameActionType.PlaceInitial, 
            road: road,
            settlement: settlement
        })
})

async function rollDice() {
    if (currentAllowedActions.value?.rollDice != true)
        return

    sendAction({ type: GameActionType.RollDice })
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

    sendAction({ type: GameActionType.FinishTurn })
}

function resourceClicked(res: Resource) {
    //TODO
}
async function buildCity() {
    if (currentAllowedActions.value?.placeCity != true || renderer.value == null || currentState.value == undefined)
        return

    const possiblePositions = 
        currentState.value.board.buildings
            .filter(([color, coord, type]) => 
                color == currentState.value!.self.color &&
                type == BuildingType.Settlement)
            .map(x => x[1])


    const settlement = await renderer.value.getUserSelection(UserSelectionType.Crossing, possiblePositions)

    if (settlement != undefined)
        sendAction({ type: GameActionType.PlaceCity, coordinate: settlement })
}
async function buildRoad() {
    if (currentAllowedActions.value?.placeRoad != true || renderer.value == null || currentState.value == undefined)
        return

    const data = 
        availableRoadPositions(currentState.value.board, currentState.value.self.color)

    const road = await renderer.value.getUserSelection(UserSelectionType.Connection, data)

    if (road != undefined)
        sendAction({ type: GameActionType.PlaceRoad, coordinates: road })
}
async function buildSettlement() {
    if (currentAllowedActions.value?.placeSettlement != true || renderer.value == null || currentState.value == undefined)
        return

    const possiblePositions = 
        availableBuildingPositions(currentState.value.board, currentState.value.self.color)

    const settlement = await renderer.value.getUserSelection(UserSelectionType.Crossing, possiblePositions)

    if (settlement != undefined)
        sendAction({ type: GameActionType.PlaceSettlement, coordinate: settlement })
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

