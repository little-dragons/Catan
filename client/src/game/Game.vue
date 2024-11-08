<script setup lang="ts">
import { BuildingType, Color, GamePhaseType, Resource, RoomType, UserType, addCards, adjacentRoads, allowedActionsForMe, availableBuildingPositions, availableRoadPositions, canTradeWithBank, isValidOffer, sameTradeOffer, tryRemoveCard, tryRemoveCards, victoryPointsFromRedacted, type Coordinate, type DieResult, type RedactedPlayer, type Road, type TradeOffer, type User } from 'shared';
import { computed, ref, watchEffect } from 'vue';
import GameRenderer from './gameDrawing/GameRenderer.vue';
import { type PlayerOverviewData } from './gameDrawing/PlayerOverviewRenderer.vue';
import { UserSelectionType } from './gameDrawing/board/UserSelection';
import { type GameAction, GameActionType } from 'shared/logic/GameAction';
import { PopupSeverity, usePopups } from '@/popup/Popup';
import type { TradeMenuRendererProps } from './gameDrawing/trade/TradeMenuRenderer.vue';
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
                openTrades: 
                    state.value?.phase.type != GamePhaseType.Normal || 
                    state.value.phase.diceRolled == false 
                        ? [] 
                        : state.value.phase.tradeOffers
                            .filter(x => x.offeringColor != state.value!.self.color)
                            .map(offer => { return { 
                                offer, 
                                canAccept: tryRemoveCards(state.value!.self.handCards, offer.desiredCards) != undefined,
                                ownColor: state.value!.self.color } 
                            })
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

const tradeMenu = ref<undefined | {
    // stocked cards are the cards meant to display during a trade menu interaction
    stockedCards: readonly Resource[],
    offeredCards: readonly Resource[],
    desiredCards: readonly Resource[] }>(undefined)

const tradeMenuProps = computed<TradeMenuRendererProps | undefined>(() => {
    if (tradeMenu.value == undefined)
        return undefined

    return {
        canTradeWithBank: canTradeWithBank(state.value!.board, state.value!.self.color, tradeMenu.value.offeredCards, tradeMenu.value.desiredCards),
        validOffer: isValidOffer(tradeMenu.value.offeredCards, tradeMenu.value.desiredCards),
        desiredCards: tradeMenu.value.desiredCards,
        offeredCards: tradeMenu.value.offeredCards
    }
})

async function endTurn() {
    if (currentAllowedActions.value?.finishTurn != true)
        return

    sendAction({ type: GameActionType.FinishTurn })
    tradeMenu.value = undefined
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
    if (tradeMenu.value == undefined)
        return

    sendAction({
        type: GameActionType.OfferTrade,
        desiredCards: tradeMenu.value.desiredCards,
        offeredCards: tradeMenu.value.offeredCards
    })

    tradeMenu.value = undefined
}
async function bankTrade() {
    if (tradeMenu.value == undefined)
        return

    sendAction({ type: GameActionType.BankTrade, offeredCards: tradeMenu.value.offeredCards, desiredCards: tradeMenu.value.desiredCards})
    tradeMenu.value = undefined
}
function toggleTradeMenu() {
    if (state.value == undefined)
        return


    if (tradeMenu.value == undefined) {
        tradeMenu.value = {
            stockedCards: state.value?.self.handCards,
            desiredCards: [],
            offeredCards: []
        }
    }
    else {
        tradeMenu.value = undefined
    }
}

function addOfferedCard(res: Resource) {
    if (tradeMenu.value == undefined)
        return

    const newStocked = tryRemoveCard(tradeMenu.value.stockedCards, res)
    if (newStocked == undefined)
        return
    
    tradeMenu.value = {
        stockedCards: newStocked,
        desiredCards: tradeMenu.value.desiredCards,
        offeredCards: addCards(tradeMenu.value.offeredCards, [res])
    }
}
function removeOfferedCard(res: Resource) {
    if (tradeMenu.value == undefined)
        return

    const newOffered = tryRemoveCard(tradeMenu.value.offeredCards, res)
    if (newOffered == undefined)
        return
    
    tradeMenu.value = {
        stockedCards: addCards(tradeMenu.value.stockedCards, [res]),
        desiredCards: tradeMenu.value.desiredCards,
        offeredCards: newOffered
    }
}
async function acceptTrade(trade: TradeOffer) {
    if (state.value?.phase.type != GamePhaseType.Normal || state.value.phase.diceRolled == false)
        return

    if (!state.value.phase.tradeOffers.some(x => sameTradeOffer(x, trade)))
        return

    await sendAction({ type: GameActionType.AcceptTradeOffer, trade })
}
async function rejectTrade(trade: TradeOffer) {
    if (state.value?.phase.type != GamePhaseType.Normal || state.value.phase.diceRolled == false)
        return

    if (!state.value.phase.tradeOffers.some(x => sameTradeOffer(x, trade)))
        return

    await sendAction({ type: GameActionType.RejectTradeOffer, trade })
}
async function finalizeTrade(trade: TradeOffer, color: Color) {
    if (state.value?.phase.type != GamePhaseType.Normal || state.value.phase.diceRolled == false)
        return

    if (!state.value.phase.tradeOffers.some(x => sameTradeOffer(x, trade)))
        return

    await sendAction({ type: GameActionType.FinalizeTrade, trade: { ...trade, tradePartner: color } })
}
async function abortTrade(trade: TradeOffer) {
    await sendAction({ type: GameActionType.AbortTrade, trade })
}


const ownOpenTradeOffers = computed(() => {
    if (state.value?.phase.type != GamePhaseType.Normal || state.value.phase.diceRolled == false)
        return []

    return state.value.phase.tradeOffers.filter(x => x.offeringColor == state.value?.self.color)
})

</script>

<template>
    <div v-if="state != undefined" class="container">
        <GameRenderer ref="renderer" 
            :board="state.board" 
            :dice="lastDice" 
            :stocked-cards="tradeMenu == undefined ? state.self.handCards : tradeMenu.stockedCards"
            :allowed-actions="currentAllowedActions!"
            :other-players="othersOverview" 
            :trade-menu="tradeMenuProps"
            :own-trades="ownOpenTradeOffers"
            other-players-display="radial"
            @dice-clicked="rollDice"
            @build-road="buildRoad"
            @build-settlement="buildSettlement"
            @build-city="buildCity"
            @end-turn="endTurn"
            @trade-menu="toggleTradeMenu"
            @trade-with-player="offerTradeWithPlayer"
            @trade-with-bank="bankTrade"
            @accept-trade="acceptTrade"
            @reject-trade="rejectTrade"
            @finalize-trade="finalizeTrade"
            @abort-trade="abortTrade"
            @stocked-card-clicked="addOfferedCard"
            @add-desired-card="(res) => { if (tradeMenu != undefined) tradeMenu.desiredCards = addCards(tradeMenu.desiredCards, [res])}"
            @remove-desired-card="(res) => { if (tradeMenu != undefined) tradeMenu.desiredCards = tryRemoveCard(tradeMenu.desiredCards, res) ?? tradeMenu.desiredCards}"
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
