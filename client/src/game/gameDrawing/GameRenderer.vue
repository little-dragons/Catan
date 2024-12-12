<script setup lang="ts">
import { Color, Resource, type Board, type DieResult, type OpenTradeOffer, type TradeOffer } from 'shared';
import BoardRenderer from './board/Renderer.vue';
import { type InteractionPoints, type UserSelectionOptions, type UserSelectionResult } from './board/UserSelection'
import DiceRenderer from './DiceRenderer.vue';
import { onMounted, ref } from 'vue';
import CardsRenderer from './CardsRenderer.vue';
import PlayerOverviewRenderer, { type PlayerOverviewData } from './PlayerOverviewRenderer.vue';
import TradeRenderer, { type TradeMenuRendererProps } from './trade/TradeMenuRenderer.vue';
import OwnTradeOverview from './trade/OwnTradeOverview.vue';

defineEmits<{
    diceClicked: []
    endTurn: []
    buildCity: []
    buildSettlement: []
    buildRoad: []
    tradeMenu: []
    tradeWithPlayer: []
    tradeWithBank: []
    stockedCardClicked: [resource: Resource]
    addDesiredCard: [card: Resource]
    removeDesiredCard: [card: Resource]
    removeOfferedCard: [card: Resource]
    acceptTrade: [trade: TradeOffer]
    rejectTrade: [trade: TradeOffer]
    finalizeTrade: [trade: TradeOffer, color: Color]
    abortTrade: [trade: TradeOffer]
}>()
export type ForbiddableButtons = {
    rollDice: boolean
    offerTrade: boolean
    placeCity: boolean
    placeRoad: boolean
    placeSettlement: boolean
    finishTurn: boolean
}

defineProps<{
    stockedCards: readonly Resource[]
    board: Board
    dice: readonly [DieResult, DieResult] | undefined
    forbiddableButtons: ForbiddableButtons
    otherPlayers: readonly PlayerOverviewData[]
    otherPlayersDisplay: 'radial' | 'grid'
    tradeMenu: TradeMenuRendererProps | undefined
    ownTrades: OpenTradeOffer[]
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
async function getUserSelection<T extends InteractionPoints, Options extends UserSelectionOptions | undefined>(value: T, options?: Options): Promise<UserSelectionResult<T['type'], Options>> {
    interactionRunning.value = true
    const res = await boardRenderer.value!.getUserSelection(value, options)
    interactionRunning.value = false
    return res
}
defineExpose({ getUserSelection })
</script>

<template>
    <div class="other-players">
        <PlayerOverviewRenderer 
            v-if="otherPlayers.length >= 1 && otherPlayersDisplay == 'radial'" 
            v-bind="otherPlayers[0]!"
            @accept-trade="trade => $emit('acceptTrade', trade)"
            @reject-trade="trade => $emit('rejectTrade', trade)"
            class="upper-left-radial"/>
        <PlayerOverviewRenderer 
            v-if="otherPlayers.length >= 1 && otherPlayersDisplay == 'grid'" 
            v-bind="otherPlayers[0]!"
            @accept-trade="trade => $emit('acceptTrade', trade)"
            @reject-trade="trade => $emit('rejectTrade', trade)"
            class="upper-left-grid"/>
        <PlayerOverviewRenderer 
            v-if="otherPlayers.length >= 2 && otherPlayersDisplay == 'radial'" 
            v-bind="otherPlayers[1]!"
            @accept-trade="trade => $emit('acceptTrade', trade)"
            @reject-trade="trade => $emit('rejectTrade', trade)"
            class="upper-right-radial"/>
        <PlayerOverviewRenderer 
            v-if="otherPlayers.length >= 2 && otherPlayersDisplay == 'grid'" 
            v-bind="otherPlayers[1]!"
            @accept-trade="trade => $emit('acceptTrade', trade)"
            @reject-trade="trade => $emit('rejectTrade', trade)"
            class="upper-right-grid"/>
        <PlayerOverviewRenderer 
            v-if="otherPlayers.length >= 3 && otherPlayersDisplay == 'radial'" 
            v-bind="otherPlayers[2]!"
            @accept-trade="trade => $emit('acceptTrade', trade)"
            @reject-trade="trade => $emit('rejectTrade', trade)"
            class="middle-left-radial"/>
        <PlayerOverviewRenderer 
            v-if="otherPlayers.length >= 3 && otherPlayersDisplay == 'grid'" 
            v-bind="otherPlayers[2]!"
            @accept-trade="trade => $emit('acceptTrade', trade)"
            @reject-trade="trade => $emit('rejectTrade', trade)"
            class="middle-left-grid"/>
        <PlayerOverviewRenderer 
            v-if="otherPlayers.length >= 4 && otherPlayersDisplay == 'radial'" 
            v-bind="otherPlayers[3]!"
            @accept-trade="trade => $emit('acceptTrade', trade)"
            @reject-trade="trade => $emit('rejectTrade', trade)"
            class="middle-right-radial"/>
        <PlayerOverviewRenderer 
            v-if="otherPlayers.length >= 4 && otherPlayersDisplay == 'grid'" 
            v-bind="otherPlayers[3]!"
            @accept-trade="trade => $emit('acceptTrade', trade)"
            @reject-trade="trade => $emit('rejectTrade', trade)"
            class="middle-right-grid"/>
    </div>
    <div ref="boardContainer"class="main-box">   
        <BoardRenderer :board="board" ref="boardRenderer"/>
        <div class="below">
            <div class="rowAbove">
                <TradeRenderer
                    v-if="tradeMenu != undefined"
                    v-bind="tradeMenu"
                    class="tradeRenderer"
                    @tradeWithPlayer="() => $emit('tradeWithPlayer')"
                    @tradeWithBank="() => $emit('tradeWithBank')"
                    @addDesiredCard="card => $emit('addDesiredCard', card)"
                    @removeDesiredCard="card => $emit('removeDesiredCard', card)"
                    @removeOfferedCard="card => $emit('removeOfferedCard', card)"
                />
                <div class="rightAnchored">
                    <div class="ownTrades">
                        <OwnTradeOverview 
                            v-for="trade in ownTrades" 
                            v-bind="trade" 
                            @abort="() => $emit('abortTrade', trade)"
                            @accept="color => $emit('finalizeTrade', trade, color)"/>
                    </div>
                    <DiceRenderer 
                        v-if="dice != undefined" 
                        class="dice" 
                        :dice="dice"
                        :enabled="!interactionRunning && forbiddableButtons.rollDice"
                        @dice-clicked="() => $emit('diceClicked')"
                    />
                </div>
            </div>
            <CardsRenderer class="cards" :cards="stockedCards" @resource-clicked="res => $emit('stockedCardClicked', res)"/>
            <div class="buttons">
                <button class="default-button-colors" @click="() => $emit('tradeMenu')" :disabled="interactionRunning || !forbiddableButtons.offerTrade">Trade</button>
                <button class="default-button-colors" @click="() => $emit('buildRoad')" :disabled="interactionRunning || !forbiddableButtons.placeRoad">Road</button>
                <button class="default-button-colors" @click="() => $emit('buildSettlement')" :disabled="interactionRunning || !forbiddableButtons.placeSettlement">Settlement</button>
                <button class="default-button-colors" @click="() => $emit('buildCity')" :disabled="interactionRunning || !forbiddableButtons.placeCity">City</button>
                <button class="default-button-colors" @click="() => $emit('endTurn')" :disabled="interactionRunning || !forbiddableButtons.finishTurn">Finish turn</button>
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
    transform: rotate(var(--middle-rotate-angle)) translateX(calc(-1 * var(--radius))) rotate(calc(-1 * var(--middle-rotate-angle))) translateX(calc(-1 * var(--player-overview-width)));
}
.middle-right-radial {
    transform: rotate(calc(-1 * var(--middle-rotate-angle))) translateX(var(--radius)) rotate(var(--middle-rotate-angle)) translateX(calc(-1 * var(--player-overview-width)));
}
.upper-left-radial {
    transform: rotate(var(--upper-rotate-angle)) translateX(calc(-1 * var(--radius))) rotate(calc(-1 * var(--upper-rotate-angle))) translateX(calc(-1 * var(--player-overview-width)));
}
.upper-right-radial {
    transform: rotate(calc(-1 * var(--upper-rotate-angle))) translateX(var(--radius)) rotate(var(--upper-rotate-angle)) translateX(calc(-1 * var(--player-overview-width)));
}


.middle-left-grid {
    transform: translateX(calc(-1 * var(--grid-x-offset))) translateY(var(--middle-y-offset)) translateX(calc(-1 * var(--player-overview-width)));
}
.middle-right-grid {
    transform: translateX(var(--grid-x-offset)) translateY(var(--middle-y-offset)) translateX(calc(-1 * var(--player-overview-width)));
}
.upper-left-grid {
    transform: translateX(calc(-1 * var(--grid-x-offset))) translateY(var(--upper-y-offset)) translateX(calc(-1 * var(--player-overview-width)));
}
.upper-right-grid {
    transform: translateX(var(--grid-x-offset)) translateY(var(--upper-y-offset)) translateX(calc(-1 * var(--player-overview-width)));
}


.main-box {
    height: calc(100% - 30px);
    width: max(100%, 900px);
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    margin-top: 30px;
}

.below {
    flex-shrink: 0;
    margin-top: 10px;
    position: relative;
    width: 100%;
    height: 80px;
    display: flex;
    flex-direction: row;
}

.rowAbove {    
    position: absolute;
    top: -10px;
    width: 100%;
}

.tradeRenderer {
    position: absolute;
    bottom: 0;
    height: 200px;
}

.rightAnchored {
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    height: 200px;
    flex-direction: row;
    align-items: end;
}
.rightAnchored > * {
    margin-left: 1rem;
}

.dice {
    width: 100px;
    z-index: 100;
}
.cards {
    width: 100%;
}
.buttons {
    width: max-content;
    height: 100%;
    flex-shrink: 0;
}

.buttons > button {
    height: 100%;
    aspect-ratio: 1;
    margin-left: 10px;
    border: 1px solid black;
    border-radius: 10px;
}

.buttons > button:hover:enabled {
    cursor: pointer;
}
.buttons > button:hover:not(:enabled) {
    cursor: not-allowed;
}

.ownTrades > * {
    height: 100px;
    width: 250px;
}
</style>