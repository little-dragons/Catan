<script setup lang="ts">
import { Resource, type Board } from 'shared';
import BoardRenderer from './board/Renderer.vue';
import { UserSelectionType, type UserSelectionDataType, type UserSelectionOptions, type UserSelectionResult } from './board/UserSelection'
import DiceRenderer from './DiceRenderer.vue';
import { onMounted, ref } from 'vue';
import CardsRenderer from './CardsRenderer.vue';
import PlayerOverviewRenderer, { type PlayerOverviewData } from './PlayerOverviewRenderer.vue';
import type { GameActionAllowedMap } from 'shared/logic/GameAction';
import type { List } from 'immutable';

defineEmits<{
    diceClicked: []
    resourceClicked: [resource: Resource]
    endTurn: []
    buildCity: []
    buildSettlement: []
    buildRoad: []
}>()

defineProps<{
    stockedCards: List<Resource>
    offeredCards: List<Resource>
    board: Board
    dice: [number, number] | undefined
    allowedActions: GameActionAllowedMap
    otherPlayers: List<PlayerOverviewData>
    otherPlayersDisplay: 'radial' | 'grid'
}>()

const boardContainer = ref<null | HTMLDivElement>(null)
const boardWidth = ref(300)
onMounted(() => {
    boardWidth.value = boardContainer.value!.children[0].clientWidth
    new ResizeObserver((entries, observer) => {
        if (boardContainer.value == undefined)
            return
        
        boardWidth.value = boardContainer.value!.children[0].clientWidth
    }).observe(boardContainer.value!.children[0])
})

const interactionRunning = ref(false)
const boardRenderer = ref<null | InstanceType<typeof BoardRenderer>>(null)
async function getUserSelection<T extends UserSelectionType, Options extends UserSelectionOptions | undefined>(type: T, data: List<UserSelectionDataType<T>>, options?: Options): Promise<UserSelectionResult<T, Options>> {
    interactionRunning.value = true
    const res = await boardRenderer.value!.getUserSelection(type, data, options)
    interactionRunning.value = false
    return res
}
defineExpose({ getUserSelection })
</script>

<template>
    <div class="other-players">
        <PlayerOverviewRenderer class="upper-left-radial" v-if="otherPlayers.size >= 1 && otherPlayersDisplay == 'radial'" v-bind="otherPlayers.get(0)!"/>
        <PlayerOverviewRenderer class="upper-left-grid" v-if="otherPlayers.size >= 1 && otherPlayersDisplay == 'grid'" v-bind="otherPlayers.get(0)!"/>
        <PlayerOverviewRenderer class="upper-right-radial" v-if="otherPlayers.size >= 2 && otherPlayersDisplay == 'radial'" v-bind="otherPlayers.get(1)!"/>
        <PlayerOverviewRenderer class="upper-right-grid" v-if="otherPlayers.size >= 2 && otherPlayersDisplay == 'grid'" v-bind="otherPlayers.get(1)!"/>
        <PlayerOverviewRenderer class="middle-left-radial" v-if="otherPlayers.size >= 3 && otherPlayersDisplay == 'radial'" v-bind="otherPlayers.get(2)!"/>
        <PlayerOverviewRenderer class="middle-left-grid" v-if="otherPlayers.size >= 3 && otherPlayersDisplay == 'grid'" v-bind="otherPlayers.get(2)!"/>
        <PlayerOverviewRenderer class="middle-right-radial" v-if="otherPlayers.size >= 4 && otherPlayersDisplay == 'radial'" v-bind="otherPlayers.get(3)!"/>
        <PlayerOverviewRenderer class="middle-right-grid" v-if="otherPlayers.size >= 4 && otherPlayersDisplay == 'grid'" v-bind="otherPlayers.get(3)!"/>
    </div>
    <div ref="boardContainer"class="main-box">   
            <BoardRenderer class="board" :board="board" ref="boardRenderer"/>
        <div class="below">
            <DiceRenderer 
                v-if="dice != undefined" 
                class="dice" 
                :dice="dice"
                :enabled="!interactionRunning && allowedActions.rollDice"
                @dice-clicked="() => $emit('diceClicked')"/>
            <CardsRenderer :cards="stockedCards" @resource-clicked="res => $emit('resourceClicked', res)"/>
            <div class="buttons">
                <button class="default-button-colors" @click="() => $emit('buildRoad')" :disabled="interactionRunning || !allowedActions.placeRoad">Road</button>
                <button class="default-button-colors" @click="() => $emit('buildSettlement')" :disabled="interactionRunning || !allowedActions.placeSettlement">Settlement</button>
                <button class="default-button-colors" @click="() => $emit('buildCity')" :disabled="interactionRunning || !allowedActions.placeCity">City</button>
                <button class="default-button-colors" @click="() => $emit('endTurn')" :disabled="interactionRunning || !allowedActions.finishTurn">Finish turn</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.other-players {
    position: absolute;
    top: 50%;
    left: 50%;

    --board-width: v-bind('boardWidth');
    --radius: calc(100px + 1px * var(--board-width) / 2);
    --upper-rotate-angle: 45deg;
    --middle-rotate-angle: 15deg;

    --grid-x-offset: calc(100px + 1px * var(--board-width) / 2);
    --upper-y-offset: -350px;
    --middle-y-offset: -150px;
}
.other-players > * {
    position: absolute;
    top: 0;
}


.middle-left-radial {
    transform: rotate(var(--middle-rotate-angle)) translateX(calc(-1 * var(--radius))) rotate(calc(-1 * var(--middle-rotate-angle))) translateX(-50%);
}
.middle-right-radial {
    transform: rotate(calc(-1 * var(--middle-rotate-angle))) translateX(var(--radius)) rotate(var(--middle-rotate-angle)) translateX(-50%);
}
.upper-left-radial {
    transform: rotate(var(--upper-rotate-angle)) translateX(calc(-1 * var(--radius))) rotate(calc(-1 * var(--upper-rotate-angle))) translateX(-50%);
}
.upper-right-radial {
    transform: rotate(calc(-1 * var(--upper-rotate-angle))) translateX(var(--radius)) rotate(var(--upper-rotate-angle)) translateX(-50%);
}


.middle-left-grid {
    transform: translateX(calc(-1 * var(--grid-x-offset))) translateY(var(--middle-y-offset)) translateX(-50%);
}
.middle-right-grid {
    transform: translateX(var(--grid-x-offset)) translateY(var(--middle-y-offset)) translateX(-50%);
}
.upper-left-grid {
    transform: translateX(calc(-1 * var(--grid-x-offset))) translateY(var(--upper-y-offset)) translateX(-50%);
}
.upper-right-grid {
    transform: translateX(var(--grid-x-offset)) translateY(var(--upper-y-offset)) translateX(-50%);
}


.main-box {
    height: calc(100% - 30px);
    width: max(100%, 900px);
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    margin-top: 30px;
}

.board {
    flex: 1 1;
    min-height: 0;
    display: flex;
}

.below {
    flex-shrink: 0;
    padding-top: 10px;
    position: relative;
    display: grid;
    grid-template-rows: 100%;
    grid-template-columns: 50% auto auto auto;
    gap: 10px;
    flex-direction: row;
}

.dice {
    position: absolute;
    right: 0;
    top: -50px;
    width: 100px;
    z-index: 100;
    margin-right: 0;
    margin-left: auto;
}


.buttons > button {
    height: 100%;
    border: 1px solid black;
    border-radius: 10px;
}

.buttons > button:hover:enabled {
    cursor: pointer;
}
.buttons > button:hover:not(:enabled) {
    cursor: not-allowed;
}

</style>