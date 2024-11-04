<script setup lang="ts">
import { currentGameRoom } from '@/socketWrapper/Room';
import { BuildingType, Color, GamePhaseType, Resource, adjacentRoads, allowedActionsForMe, availableBuildingPositions, availableRoadPositions, canTradeWithBank, isValidOffer, victoryPointsFromRedacted, type Coordinate, type DieResult, type RedactedGameState, type RedactedPlayer, type Road, type User } from 'shared';
import { computed, ref, shallowRef, triggerRef, watchEffect } from 'vue';
import { gameSocket } from '@/socketWrapper/Socket';
import GameRenderer from './gameDrawing/GameRenderer.vue';
import { type PlayerOverviewData } from './gameDrawing/PlayerOverviewRenderer.vue';
import { UserSelectionType } from './gameDrawing/board/UserSelection';
import { type GameAction, GameActionType } from 'shared/logic/GameAction';
import { PopupSeverity, usePopups } from '@/popup/Popup';
import type { TradeRendererProps } from './gameDrawing/TradeRenderer.vue';

const renderer = ref<null | InstanceType<typeof GameRenderer>>(null)
const { insert: insertPopup } = usePopups()

async function sendAction(action: GameAction) {
    const response = await gameSocket.emitWithAck('gameAction', action)
    if (response == true)
        return

    insertPopup({ 
        title: 'Invalid action',
        message: `Game action did not complete correctly: ${response}, trying to reload local state.`,
        severity: PopupSeverity.Warning,
        autoCloses: false,
    })
    
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

const others = computed<[User, RedactedPlayer][]>(() => {
    if (currentState.value == undefined || currentGameRoom.value == undefined)
        return []

    const otherUsers: [User, Color][] = currentGameRoom.value.users.filter(x => x[1] != currentState.value?.self.color)
    return otherUsers.map(user => [user[0], currentState.value?.players.find(player => player.color == user[1])!] as [User, RedactedPlayer])
})

const othersOverview = computed(() => {
    return others.value.map<PlayerOverviewData>(
        ([user, player]) => {  
            return {
                name: user.name,
                isGuest: user.type == 'guest',
                color: player.color,
                victoryPoints: victoryPointsFromRedacted(currentState.value!, player.color),
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

const lastDice = ref<undefined | readonly [DieResult, DieResult]>(undefined)
watchEffect(() => {
    if (currentState.value?.phase.type == GamePhaseType.Normal && currentState.value.phase.diceRolled != false)
        lastDice.value = currentState.value.phase.diceRolled

    if (currentState.value?.phase.type == GamePhaseType.Normal && lastDice.value == undefined)
        // this is to show the dice once the user is first required to roll them
        lastDice.value = [3, 3]
})

const trade = ref<undefined | {
    // stocked cards are the cards meant to display during a trade
    // having a variable inside trade seems like the easiest way
    stockedCards: readonly Resource[],
    offeredCards: readonly Resource[],
    desiredCards: Resource[] }>(undefined)

const tradeProps = computed<TradeRendererProps | undefined>(() => {
    if (trade.value == undefined)
        return undefined

    return {
        canTradeWithBank: canTradeWithBank(currentState.value!.board, currentState.value!.self.color, trade.value.offeredCards, trade.value.desiredCards),
        validOffer: isValidOffer(trade.value.offeredCards, trade.value.desiredCards),
        desiredCards: trade.value.desiredCards,
        offeredCards: trade.value.offeredCards
    }
})

async function endTurn() {
    if (currentAllowedActions.value?.finishTurn != true)
        return

    sendAction({ type: GameActionType.FinishTurn })
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

async function offerTradeWithPlayer() {
    // TODO
}
async function bankTrade() {
    if (trade.value == undefined)
        return

    sendAction({ type: GameActionType.BankTrade, offeredCards: trade.value.offeredCards, desiredCards: trade.value.desiredCards})
    trade.value = undefined
}
function toggleTradeMenu() {
    if (currentState.value == undefined)
        return


    if (trade.value == undefined) {
        trade.value = {
            stockedCards: currentState.value?.self.handCards,
            desiredCards: [],
            offeredCards: []
        }
    }
    else {
        trade.value = undefined
    }
}

function addOfferedCard(res: Resource) {
    if (trade.value == undefined)
        return

    const index = trade.value.stockedCards.indexOf(res)
    if (index < 0)
        return

    const newCards = trade.value.stockedCards.slice()
    newCards.splice(index, 1)
    
    const newOffered = trade.value.offeredCards.slice()
    newOffered.push(res)

    trade.value = {
        stockedCards: newCards,
        desiredCards: trade.value.desiredCards,
        offeredCards: newOffered
    }
}
function removeOfferedCard(res: Resource) {
    if (trade.value == undefined)
        return

    const index = trade.value.offeredCards.indexOf(res)
    if (index < 0)
        return

    const newCards = trade.value.stockedCards.slice()
    newCards.push(res)

    const newOffered = trade.value.offeredCards.slice()
    newOffered.splice(index, 1)

    trade.value = {
        stockedCards: newCards,
        desiredCards: trade.value.desiredCards,
        offeredCards: newOffered
    }
}

</script>

<template>
    <div v-if="currentState != undefined" class="container">
        <GameRenderer ref="renderer" 
            :board="currentState.board" 
            :dice="lastDice" 
            :stocked-cards="trade == undefined ? currentState.self.handCards : trade.stockedCards"
            :allowed-actions="currentAllowedActions!"
            :other-players="othersOverview" 
            :trade="tradeProps"
            other-players-display="radial"
            @dice-clicked="rollDice"
            @build-road="buildRoad"
            @build-settlement="buildSettlement"
            @build-city="buildCity"
            @end-turn="endTurn"
            @trade-menu="toggleTradeMenu"
            @trade-with-player="offerTradeWithPlayer"
            @trade-with-bank="bankTrade"
            @resource-clicked="addOfferedCard"
            @add-desired-card="card => trade?.desiredCards.push(card)"
            @remove-desired-card="card => trade?.desiredCards.splice(trade?.desiredCards.indexOf(card), 1)"
            @remove-offered-card="removeOfferedCard"
        />
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

