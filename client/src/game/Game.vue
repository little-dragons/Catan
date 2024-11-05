<script setup lang="ts">
import { BuildingType, Color, GamePhaseType, Resource, RoomType, UserType, adjacentRoads, allowedActionsForMe, availableBuildingPositions, availableRoadPositions, canTradeWithBank, isValidOffer, victoryPointsFromRedacted, type Coordinate, type DieResult, type RedactedPlayer, type Road, type User } from 'shared';
import { computed, ref, watchEffect } from 'vue';
import GameRenderer from './gameDrawing/GameRenderer.vue';
import { type PlayerOverviewData } from './gameDrawing/PlayerOverviewRenderer.vue';
import { UserSelectionType } from './gameDrawing/board/UserSelection';
import { type GameAction, GameActionType } from 'shared/logic/GameAction';
import { PopupSeverity, usePopups } from '@/popup/Popup';
import type { TradeRendererProps } from './gameDrawing/TradeRenderer.vue';
import { useCurrentRoomStore } from '@/socket/CurrentRoomStore';

const renderer = ref<null | InstanceType<typeof GameRenderer>>(null)

const popups = usePopups()
const room = useCurrentRoomStore()
const state = computed(() => room.info?.type == RoomType.InGame ? room.info.state : undefined)

async function sendAction(action: GameAction) {
    const response = await room.trySendAction(action)
    if (response == true)
        return

    popups.insert({ 
        title: 'Invalid action',
        message: `Game action did not complete correctly: ${response}, trying to reload local state.`,
        severity: PopupSeverity.Warning,
        autoCloses: false,
    })
    
    // TODO handle errors elegantly. An idea is given below
    // potentially, if a action is rejected, the state may be completely wrong. Probably, triggering the state 
    // again will not destroy it further, only potentially help
}

const currentAllowedActions = computed(() => {
    if (state.value == undefined)
        return undefined
    else
        return allowedActionsForMe(state.value)
})

const others = computed<[User, RedactedPlayer][]>(() => {
    if (state.value == undefined || room.info == undefined)
        return []

    const otherUsers: [User, Color][] = room.info.users.filter(x => x[1] != state.value?.self.color)
    return otherUsers.map(user => [user[0], state.value?.players.find(player => player.color == user[1])!] as [User, RedactedPlayer])
})

const othersOverview = computed(() => {
    return others.value.map<PlayerOverviewData>(
        ([user, player]) => {  
            return {
                name: user.name,
                isGuest: user.type == UserType.Guest,
                color: player.color,
                victoryPoints: victoryPointsFromRedacted(state.value!, player.color),
            }
        })
})

// set interaction points for initial placements
watchEffect(async () => {
    if (currentAllowedActions.value?.placeInitial != true || renderer.value == null || state.value == undefined)
        return

    const freeSettlements = availableBuildingPositions(state.value.board, undefined)

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
    if (state.value?.phase.type == GamePhaseType.Normal && state.value.phase.diceRolled != false)
        lastDice.value = state.value.phase.diceRolled

    if (state.value?.phase.type == GamePhaseType.Normal && lastDice.value == undefined)
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
        canTradeWithBank: canTradeWithBank(state.value!.board, state.value!.self.color, trade.value.offeredCards, trade.value.desiredCards),
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
    if (currentAllowedActions.value?.placeCity != true || renderer.value == null || state.value == undefined)
        return

    const possiblePositions = 
        state.value.board.buildings
            .filter(([color, coord, type]) => 
                color == state.value!.self.color &&
                type == BuildingType.Settlement)
            .map(x => x[1])


    const settlement = await renderer.value.getUserSelection(UserSelectionType.Crossing, possiblePositions)

    if (settlement != undefined)
        sendAction({ type: GameActionType.PlaceCity, coordinate: settlement })
}
async function buildRoad() {
    if (currentAllowedActions.value?.placeRoad != true || renderer.value == null || state.value == undefined)
        return

    const data = 
        availableRoadPositions(state.value.board, state.value.self.color)

    const road = await renderer.value.getUserSelection(UserSelectionType.Connection, data)

    if (road != undefined)
        sendAction({ type: GameActionType.PlaceRoad, coordinates: road })
}
async function buildSettlement() {
    if (currentAllowedActions.value?.placeSettlement != true || renderer.value == null || state.value == undefined)
        return

    const possiblePositions = 
        availableBuildingPositions(state.value.board, state.value.self.color)

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
    if (state.value == undefined)
        return


    if (trade.value == undefined) {
        trade.value = {
            stockedCards: state.value?.self.handCards,
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
    <div v-if="state != undefined" class="container">
        <GameRenderer ref="renderer" 
            :board="state.board" 
            :dice="lastDice" 
            :stocked-cards="trade == undefined ? state.self.handCards : trade.stockedCards"
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
