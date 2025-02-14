<script setup lang="ts">
import { BuildingType, Color, canPlaceCity, canRollDice, isRobbingMovingRobber, GamePhaseType, Resource, RoomType, TurnPhaseType, UserType, addCards, adjacentRoads, availableBuildingPositions, availableRoadPositions, canTradeWithBank, isValidOffer, sameCoordinate, sameTradeOffer, tryRemoveCard, tryRemoveCards, victoryPointsFromRedacted, type Coordinate, type DieResult, type RedactedPlayer, type Road, type TradeOffer, type User, isActive, isInitial, type CardList, tryTransferCard, isRobbingDiscardingCards, validNewRobberPositions, allRobbableCrossings, isPreDiceRoll, allRobbableCrossingsExcept, type Board } from 'shared';
import { computed, ref, watchEffect, watch } from 'vue';
import GameRenderer, { type ForbiddableButtons } from './GameRenderer.vue';
import { type PlayerOverviewData } from '../game-components/PlayerOverviewRenderer.vue';
import { UserSelectionType } from '../game-components/board/UserSelection';
import { canBuyDevCard, canFinishTurn, canOfferTrade, canPlaceRoad, canPlaceSettlement, DevCardType, GameActionType } from 'shared/logic/GameAction';
import type { TradeMenuRendererProps } from '../game-components/trade/TradeMenuRenderer.vue';
import { useCurrentRoomStore } from '@/socket/CurrentRoomStore';
import type { DiscardMenuRendererProps } from '../game-components/DiscardRenderer.vue';
import { isDevelopment } from '@/misc/Globals';

const renderer = ref<null | InstanceType<typeof GameRenderer>>(null)

const room = useCurrentRoomStore()
const state = computed(() => room.info?.type == RoomType.InGame ? room.info.state : undefined)
const customBoard = ref<Board | undefined>(undefined)

const forbiddableButtons = computed<ForbiddableButtons | undefined>(() => {
    if (state.value == undefined)
        return undefined

    return {
        finishTurn: canFinishTurn(state.value),
        offerTrade: canOfferTrade(state.value),
        placeCity: canPlaceCity(state.value),
        placeRoad: canPlaceRoad(state.value),
        placeSettlement: canPlaceSettlement(state.value),
        rollDice: canRollDice(state.value),
        buyDevCard: canBuyDevCard(state.value)
    }
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
                handCardsCount: player.handCardsCount,
                devCardsCount: player.devCardsCount,
                openTrades: 
                    state.value?.phase.type != GamePhaseType.Turns || 
                    state.value.phase.subtype != TurnPhaseType.Active
                        ? [] 
                        : state.value.phase.tradeOffers
                            .filter(x => x.offeringColor == player.color)
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
    if (renderer.value == null || state.value == undefined || !isInitial(state.value.phase) || state.value.self.color != state.value.currentPlayer)
        return

    const freeSettlements = availableBuildingPositions(state.value.board, undefined)

    let settlement: Coordinate | undefined = undefined
    let road: Road | undefined = undefined
    do {
        customBoard.value = undefined
        settlement = await renderer.value.getUserSelection({ type: UserSelectionType.Crossing, positions: freeSettlements }, { noAbort: true })
        customBoard.value = {
            ...state.value.board,
            buildings: [{ color: state.value.self.color, coord: settlement, type: BuildingType.Settlement }, ...state.value.board.buildings]
        }
        road = await renderer.value.getUserSelection({ type: UserSelectionType.Connection, positions: adjacentRoads(settlement) })
    } while(settlement == undefined || road == undefined)

    await room.trySendAction(
        { 
            type: GameActionType.PlaceInitial, 
            road: road,
            settlement: settlement
        })
    customBoard.value = undefined
})

async function rollDice() {
    if (state.value == undefined || !canRollDice(state.value))
        return

    room.trySendAction({ type: GameActionType.RollDice })
}

const lastDice = ref<undefined | readonly [DieResult, DieResult]>(undefined)
watch(room.actions, () => {
    const oldestAction = room.actions.shift()
    if (oldestAction == undefined)
        return
    if (oldestAction.type == GameActionType.RollDice) {
        lastDice.value = [oldestAction.response.die1, oldestAction.response.die2]
    }
    // TODO handle more actions
})

watchEffect(() => {
    // this is to show the dice once the user is first required to roll them
    if (state.value?.phase.type == GamePhaseType.Turns && lastDice.value == undefined && room.actions.length == 0)
        lastDice.value = [3, 3]
})

// set interaction points for robber placement
watchEffect(async () => {
    if (state.value == undefined || !isRobbingMovingRobber(state.value.phase) || state.value.currentPlayer != state.value.self.color)
        return undefined

    const possibleRobberPositions = validNewRobberPositions(state.value.board).map(x => x.coord)

    let newRobberCoordinate: Coordinate | undefined
    let robbedColor: Color | undefined
    do {
        newRobberCoordinate = await renderer.value!.getUserSelection({ type: UserSelectionType.Tile, positions: possibleRobberPositions }, { noAbort: true })
        
        const robbableCrossings = allRobbableCrossings(state.value, newRobberCoordinate)
        if (robbableCrossings.size == 0) {
            robbedColor = undefined
        }
        else if (robbableCrossings.size == 1) {
            robbedColor = robbableCrossings.keys().next?.().value!
        }
        else {
            const selectableCrossings = Array.from(robbableCrossings.values()).flat()
            const robbedCoord = await renderer.value!.getUserSelection({ type: UserSelectionType.Crossing, positions: selectableCrossings })
            if (robbedCoord != undefined)
                robbedColor = Array.from(robbableCrossings.entries()).find(x => x[1].some(coord => sameCoordinate(coord, robbedCoord)))![0]
            else
                // no color was selected, indicating that maybe an abort is intended.
                newRobberCoordinate = undefined
        }
    } while (newRobberCoordinate == undefined)

    await room.trySendAction({ 
        type: GameActionType.PlaceRobber, 
        coordinate: newRobberCoordinate, 
        robbedColor: robbedColor 
    })
})


const tradeMenu = ref<undefined | {
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
    if (forbiddableButtons.value?.finishTurn != true)
        return

    room.trySendAction({ type: GameActionType.FinishTurn })
    tradeMenu.value = undefined
}


async function buildCity() {
    if (forbiddableButtons.value?.placeCity != true || renderer.value == null || state.value == undefined)
        return

    const possiblePositions = 
        state.value.board.buildings
            .filter(({ color, type }) => 
                color == state.value!.self.color &&
                type == BuildingType.Settlement)
            .map(x => x.coord)


    const settlement = await renderer.value.getUserSelection({ type: UserSelectionType.Crossing, positions: possiblePositions })

    if (settlement != undefined)
        room.trySendAction({ type: GameActionType.PlaceCity, coordinate: settlement })
}
async function buildRoad() {
    if (forbiddableButtons.value?.placeRoad != true || renderer.value == null || state.value == undefined)
        return

    const data = 
        availableRoadPositions(state.value.board, state.value.self.color)

    const road = await renderer.value.getUserSelection({ type: UserSelectionType.Connection, positions: data })

    if (road != undefined)
        room.trySendAction({ type: GameActionType.PlaceRoad, coordinates: road })
}
async function buildSettlement() {
    if (forbiddableButtons.value?.placeSettlement != true || renderer.value == null || state.value == undefined)
        return

    const possiblePositions = 
        availableBuildingPositions(state.value.board, state.value.self.color)

    const settlement = await renderer.value.getUserSelection({ type: UserSelectionType.Crossing, positions: possiblePositions })

    if (settlement != undefined)
        room.trySendAction({ type: GameActionType.PlaceSettlement, coordinate: settlement })
}

async function buyDevCard() {
    if (forbiddableButtons.value?.buyDevCard != true || renderer.value == null || state.value == undefined)
        return

    room.trySendAction({ type: GameActionType.BuyDevCard })
}

async function offerTradeWithPlayer() {
    if (tradeMenu.value == undefined)
        return

    room.trySendAction({
        type: GameActionType.OfferTrade,
        desiredCards: tradeMenu.value.desiredCards,
        offeredCards: tradeMenu.value.offeredCards
    })

    tradeMenu.value = undefined
}
async function bankTrade() {
    if (tradeMenu.value == undefined)
        return

    room.trySendAction({ type: GameActionType.BankTrade, offeredCards: tradeMenu.value.offeredCards, desiredCards: tradeMenu.value.desiredCards})
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

function stockedCardClicked(res: Resource) {
    if (tradeMenu.value != undefined) {
        const newStocked = tryRemoveCard(tradeMenu.value.stockedCards, res)
        if (newStocked == undefined)
            return
        
        tradeMenu.value = {
            stockedCards: newStocked,
            desiredCards: tradeMenu.value.desiredCards,
            offeredCards: addCards(tradeMenu.value.offeredCards, [res])
        }
    }
    if (discardMenu.value != undefined) {
        const [newStocked, newDiscarded] = tryTransferCard(discardMenu.value.stockedCards, discardMenu.value.discardingCards, res)
        discardMenu.value = {
            discardingCards: newDiscarded,
            stockedCards: newStocked,
            expectedDiscardingCount: discardMenu.value.expectedDiscardingCount
        }
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
function removeDiscardingCard(res: Resource) {
    if (discardMenu.value == undefined)
        return

    const [newDiscarded, newStocked] = tryTransferCard(discardMenu.value.discardingCards, discardMenu.value.stockedCards, res)
    discardMenu.value = {
        discardingCards: newDiscarded,
        stockedCards: newStocked,
        expectedDiscardingCount: discardMenu.value.expectedDiscardingCount
    }
}
async function acceptTrade(trade: TradeOffer) {
    if (state.value == undefined || !isActive(state.value.phase))
        return

    if (!state.value.phase.tradeOffers.some(x => sameTradeOffer(x, trade)))
        return

    await room.trySendAction({ type: GameActionType.AcceptTradeOffer, trade })
}
async function rejectTrade(trade: TradeOffer) {
    if (state.value == undefined || !isActive(state.value.phase))
        return

    if (!state.value.phase.tradeOffers.some(x => sameTradeOffer(x, trade)))
        return

    await room.trySendAction({ type: GameActionType.RejectTradeOffer, trade })
}
async function finalizeTrade(trade: TradeOffer, color: Color) {
    if (state.value == undefined || !isActive(state.value.phase))
        return

    if (!state.value.phase.tradeOffers.some(x => sameTradeOffer(x, trade)))
        return

    await room.trySendAction({ type: GameActionType.FinalizeTrade, trade: { ...trade, tradePartner: color } })
}
async function abortTrade(trade: TradeOffer) {
    await room.trySendAction({ type: GameActionType.AbortTrade, trade })
}


const ownOpenTradeOffers = computed(() => {
    if (state.value == undefined || !isActive(state.value.phase))
        return []

    return state.value.phase.tradeOffers.filter(x => x.offeringColor == state.value?.self.color)
})

const discardMenu = ref<({
    stockedCards: CardList
} & DiscardMenuRendererProps) | undefined>()

// open and close discard menu
watchEffect(() => {
    if (state.value == undefined || 
        !isRobbingDiscardingCards(state.value.phase) ||
        !state.value.phase.playersLeftToDiscard.includes(state.value.self.color)
    ) {
        // there is no action required to discard
        discardMenu.value = undefined
    }
    else if (discardMenu.value == undefined) {
        // discarding needs to happen and the menu isn't already open
        // (without the check, the menu resets itself when other players discard their cards)
        discardMenu.value = {
            stockedCards: state.value.self.handCards,
            discardingCards: [],
            expectedDiscardingCount: Math.floor(state.value.self.handCards.length / 2)
        }
    }
})

async function discardCards() {
    if (discardMenu.value == undefined || 
        discardMenu.value.expectedDiscardingCount != discardMenu.value.discardingCards.length)
        return

    await room.trySendAction({
        type: GameActionType.DiscardResources,
        resources: discardMenu.value.discardingCards
    })
}

const stockedCardsToDisplay = computed(() => {
    if (tradeMenu.value != undefined)
        return tradeMenu.value.stockedCards
    if (discardMenu.value != undefined)
        return discardMenu.value.stockedCards
    return state.value!.self.handCards
})

async function devCardClicked(card: DevCardType) {
    if (state.value == undefined || renderer.value == undefined)
        return

    switch (card) {
        case DevCardType.Knight: {
            if (!isPreDiceRoll(state.value.phase) && !isActive(state.value.phase))
                return

            const newRobbers = validNewRobberPositions(state.value.board)
            const newPosition = await renderer.value.getUserSelection({ type: UserSelectionType.Tile, positions: newRobbers.map(x => x.coord) })
            if (newPosition == undefined)
                return

            const robbables = allRobbableCrossingsExcept(state.value, newPosition, state.value.self.color)
            let robbedColor: Color | undefined = undefined
            if (robbables.size > 1) {
                const robbedCrossing = await renderer.value.getUserSelection({ type: UserSelectionType.Crossing, positions: [...robbables.values()].flat() })
                if (robbedCrossing == undefined)
                    return

                robbedColor = Array.from(robbables.entries()).filter(x => x[1].some(y => sameCoordinate(y, robbedCrossing)))[0][0]
            }
            else if (robbables.size == 1) {
                robbedColor = robbables.keys().next().value!
            }
            await room.trySendAction({ type: GameActionType.PlayDevCard, cardType: DevCardType.Knight, newPosition, robbedColor })
            return
        }
        case DevCardType.VictoryPoint: return
        case DevCardType.YearOfPlenty: {
            const res = await renderer.value.chooseResources(2)
            if (res == undefined)
                return

            await room.trySendAction({ type: GameActionType.PlayDevCard, cardType: DevCardType.YearOfPlenty, resources: res as [Resource, Resource] })
            return
        }
        case DevCardType.Monopoly: {
            const res = await renderer.value.chooseResourceType()
            if (res == undefined)
                return

            await room.trySendAction({ type: GameActionType.PlayDevCard, cardType: DevCardType.Monopoly, resource: res })
            return
        }
        case DevCardType.RoadBuilding: {
            const firstFree = availableRoadPositions(state.value.board, state.value.self.color)
            let first: Road | undefined
            let second: Road | undefined
            do {
                customBoard.value = undefined
                first = await renderer.value.getUserSelection({ type: UserSelectionType.Connection, positions: firstFree })
                if (first == undefined)
                    // this means that the user aborted selection of the entire dev card.
                    return

                const newBoard: Board = {
                    ...state.value.board,
                    roads: [{ color: state.value.self.color, coord: first }, ...state.value.board.roads]
                }

                const secondFree = availableRoadPositions(newBoard, state.value.self.color)
                customBoard.value = newBoard
                second = await renderer.value.getUserSelection({ type: UserSelectionType.Connection, positions: secondFree })
            } while (first == undefined || second == undefined)

            
            await room.trySendAction({ type: GameActionType.PlayDevCard, cardType: DevCardType.RoadBuilding, roads: [first, second] })
            customBoard.value = undefined
            return
        }
    }
}

</script>

<template>
    <div v-if="state != undefined" class="container">
        <button v-if="isDevelopment" @click="console.log(state)">Print state to console</button>
        <GameRenderer ref="renderer" 
            :board="customBoard == undefined ? state.board : customBoard" 
            :dice="lastDice" 
            :stocked-cards="stockedCardsToDisplay"
            :dev-cards="state.self.devCards"
            :forbiddable-buttons="forbiddableButtons!"
            :other-players="othersOverview" 
            :trade-menu="tradeMenuProps"
            :discardingInfo="discardMenu"
            :own-trades="ownOpenTradeOffers"
            other-players-display="radial"
            @dice-clicked="rollDice"
            @build-road="buildRoad"
            @build-settlement="buildSettlement"
            @build-city="buildCity"
            @buy-dev-card="buyDevCard"
            @dev-card-clicked="devCardClicked"
            @end-turn="endTurn"
            @trade-menu="toggleTradeMenu"
            @trade-with-player="offerTradeWithPlayer"
            @trade-with-bank="bankTrade"
            @accept-trade="acceptTrade"
            @reject-trade="rejectTrade"
            @finalize-trade="finalizeTrade"
            @abort-trade="abortTrade"
            @stocked-card-clicked="stockedCardClicked"
            @add-desired-card="(res) => { if (tradeMenu != undefined) tradeMenu.desiredCards = addCards(tradeMenu.desiredCards, [res])}"
            @remove-desired-card="(res) => { if (tradeMenu != undefined) tradeMenu.desiredCards = tryRemoveCard(tradeMenu.desiredCards, res) ?? tradeMenu.desiredCards}"
            @remove-offered-card="removeOfferedCard"
            @remove-discarding-card="removeDiscardingCard"
            @discard-cards="discardCards"
        />
    </div>
</template>

<style scoped>
@import '../assets/base.css';

.container {
    width: var(--wide-area-width);
    display: flex;
    flex-direction: row;
    height: 90vh;
}

button {
    position: absolute;
}
</style>
