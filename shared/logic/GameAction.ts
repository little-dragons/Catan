import { produce, unfreeze } from "structurajs"
import { adjacentResourceTiles, adjacentRoads, availableRoadPositions, Board, Coordinate, gainedResources, isAvailableRoadPosition, Road, sameCoordinate, sameRoad } from "./Board.js"
import { BuildingType, ConnectionType, availableBuildingPositions, buildingCost, connectionCost, isAvailableBuildingPosition } from "./Buildings.js"
import { RedactedGameState, FullGameState, nextTurn, GamePhaseType, MinimalGameState, DieResult } from "./GameState.js"
import { Color, FullPlayer } from "./Player.js"
import { addCards, Resource, tryRemoveCards } from "./Resource.js"
import { canTradeWithBank, FinalizedTrade, isValidOffer, OpenTradeOffer, sameTradeOffer, TradeOffer } from "./Trade.js"


export enum GameActionType {
    RollDice,
    PlaceSettlement,
    PlaceCity,
    PlaceRoad,
    PlaceInitial,
    BankTrade,
    OfferTrade,
    AcceptTradeOffer,
    FinalizeTrade,
    FinishTurn
}

export type GameActionAllowedMap = {
    [Name in Uncapitalize<keyof typeof GameActionType>]: boolean
}

export type GameAction = {
    type: GameActionType.RollDice
} | {
    type: GameActionType.PlaceSettlement
    coordinate: Coordinate
} | {
    type: GameActionType.PlaceCity
    coordinate: Coordinate
} | {
    type: GameActionType.PlaceRoad
    coordinates: Road
} | {
    type: GameActionType.BankTrade
    offeredCards: readonly Resource[]
    desiredCards: readonly Resource[]
} | {
    type: GameActionType.OfferTrade
    offeredCards: readonly Resource[]
    desiredCards: readonly Resource[]
} | {
    type: GameActionType.AcceptTradeOffer
    trade: TradeOffer
} | {
    type: GameActionType.FinalizeTrade
    trade: FinalizedTrade
} | {
    type: GameActionType.PlaceInitial
    settlement: Coordinate
    road: Road
} | {
    type: GameActionType.FinishTurn
}


export function allowedActionsForMe(state: RedactedGameState): GameActionAllowedMap {
    return allowedActionsFor(state, state.self)
}

// mainly used in client to enable or disable buttons
export function allowedActionsFor(state: MinimalGameState, player: FullPlayer): GameActionAllowedMap {
    const myColor = player.color
    const myTurn = state.currentPlayer == myColor

    if (!myTurn)
        return {
            finishTurn: false,
            placeCity: false,
            placeInitial: false,
            placeRoad: false,
            placeSettlement: false,
            rollDice: false,
            bankTrade: false,
            acceptTradeOffer: state.phase.type == GamePhaseType.Normal && state.phase.diceRolled != false && state.phase.tradeOffers.length > 0,
            offerTrade: false,
            finalizeTrade: false
        }

    if (state.phase.type == GamePhaseType.Initial) 
        return {
            finishTurn: false,
            placeCity: false,
            placeInitial: true,
            placeRoad: false,
            placeSettlement: false,
            rollDice: false,
            bankTrade: false,
            acceptTradeOffer: false,
            finalizeTrade: false,
            offerTrade: false
        }

    if (state.phase.diceRolled == false) 
        return {
            finishTurn: false,
            placeCity: false,
            placeInitial: false,
            placeRoad: false,
            placeSettlement: false,
            rollDice: true,
            bankTrade: false,
            acceptTradeOffer: false,
            finalizeTrade: false,
            offerTrade: false
            // TODO with dev cards, a robber might also be played
        }

    const hasSettlements = state.board.buildings.some(x => x[0] == myColor && x[2] == BuildingType.Settlement)
    const canPlaceCity = hasSettlements && tryBuyBuilding(player.handCards, BuildingType.City) != undefined

    const hasSettlementSpots = availableBuildingPositions(state.board, myColor).length > 0
    const canPlaceSettlement = hasSettlementSpots && tryBuyBuilding(player.handCards, BuildingType.Settlement) != undefined

    const hasRoadSpots = availableRoadPositions(state.board, myColor).length > 0
    const canPlaceRoad = hasRoadSpots && tryBuyConnection(player.handCards, ConnectionType.Road) != undefined

    
    // TODO a seven as a dice result, might need to require to move the robber
    return {
        finishTurn: true,
        placeInitial: false,
        placeCity: canPlaceCity,
        placeRoad: canPlaceRoad,
        placeSettlement: canPlaceSettlement,
        rollDice: false,
        bankTrade: true,
        acceptTradeOffer: false,
        finalizeTrade: state.phase.tradeOffers.some(x => x.acceptingColors.length > 0),
        offerTrade: player.handCards.length > 0
    }
}

// mainly used in server to advance server state
export function tryDoAction(state: FullGameState, executor: Color, action: GameAction): FullGameState | undefined {
    // TODO trading
    if (executor != state.currentPlayer)
        return undefined

    const executorIdx = state.players.findIndex(x => x.color == executor)
    if (executorIdx == undefined)
        return undefined

    if (state.phase.type == GamePhaseType.Initial) {
        if (action.type == GameActionType.PlaceInitial) {
            if (!isAvailableBuildingPosition(action.settlement, state.board, undefined))
                return undefined

            if (!adjacentRoads(action.settlement).some(x => sameRoad(x, action.road)))
                return undefined
            
            const newCards = 
                state.phase.forward ? [] :
                adjacentResourceTiles(action.settlement, state.board, undefined)
            const newPlayers = state.players.map(({ color, handCards }) => {
                if (color == executor)
                    return { color, handCards: newCards }
                else
                    return { color, handCards }
            })

            
            const [nextColor, nextPhase] = nextTurn(state)
            const newBoard = produce(state.board, board => {
                board.buildings.push([executor, unfreeze(action.settlement), BuildingType.Settlement])
                board.roads.push([executor, unfreeze(action.road)])
                return board
            })
            return {
                currentPlayer: nextColor,
                phase: nextPhase,
                players: newPlayers,
                board: newBoard
            }
        }
        else
            return undefined
    }
    if (state.phase.type == GamePhaseType.Normal) {
        if (action.type == GameActionType.RollDice) {
            if (state.phase.diceRolled != false)
                return undefined

            const die1 = Math.floor(Math.random() * 6) + 1 as DieResult
            const die2 = Math.floor(Math.random() * 6) + 1 as DieResult

            const sum = die1 + die2

            // dispense resources
            const newPlayers = state.players.map(
                ({ color, handCards: oldCards }) => {
                    return {
                        color,
                        handCards: addCards(oldCards, gainedResources(state.board, color, sum))
                    }
                }
            )

            return {
                ...state,
                phase: {
                    type: GamePhaseType.Normal,
                    diceRolled: [die1, die2],
                    tradeOffers: []
                },
                players: newPlayers
            }
        }
        if (state.phase.diceRolled == false)
            return undefined

        if (action.type == GameActionType.FinishTurn) {
            const [nextColor, nextPhase] = nextTurn(state)
            return {
                ...state,
                currentPlayer: nextColor,
                phase: nextPhase
            }
        }
        else if (action.type == GameActionType.PlaceRoad) {
            if (!isAvailableRoadPosition(state.board, action.coordinates, executor))
                return undefined


            const newCards = tryBuyConnection(state.players[executorIdx]!.handCards, ConnectionType.Road)
            if (newCards == undefined)
                return undefined


            return produce(state, newState => {
                newState.players[executorIdx].handCards = unfreeze(newCards)
                newState.board.roads.push([executor, unfreeze(action.coordinates)])
            })
        }
        else if (action.type == GameActionType.PlaceSettlement) {
            if (!isAvailableBuildingPosition(action.coordinate, state.board, executor))
                return undefined

            const newCards = tryBuyBuilding(state.players[executorIdx]!.handCards, BuildingType.Settlement)
            if (newCards == undefined)
                return undefined

            return produce(state, newState => {
                newState.players[executorIdx].handCards = unfreeze(newCards)
                newState.board.buildings.push([executor, unfreeze(action.coordinate), BuildingType.Settlement])
                return newState
            })
        }
        else if (action.type == GameActionType.PlaceCity) {
            const validSettlementIdx = 
                state.board.buildings.findIndex(([color, coord, type]) => 
                    sameCoordinate(action.coordinate, coord) && 
                    type == BuildingType.Settlement && 
                    color == executor)

            if (validSettlementIdx < 0)
                return undefined

            const newCards = tryBuyBuilding(state.players[executorIdx]!.handCards, BuildingType.City)
            if (newCards == undefined)
                return undefined

            return produce(state, newState => {
                newState.players[executorIdx].handCards = unfreeze(newCards)
                newState.board.buildings[validSettlementIdx] = [executor, unfreeze(action.coordinate), BuildingType.City]
            })
        }
        else if (action.type == GameActionType.BankTrade) {
            if(!canTradeWithBank(state.board, executor, action.offeredCards, action.desiredCards))
                return undefined

            const cardsAfterPayment = tryRemoveCards(state.players[executorIdx]!.handCards, action.offeredCards)

            if (cardsAfterPayment == undefined)
                return undefined

            const newCards = cardsAfterPayment.concat(action.desiredCards)

            return produce(state, newState => {
                newState.players[executorIdx].handCards = newCards
            })
        }
        else if (action.type == GameActionType.OfferTrade) {
            if (!isValidOffer(action.offeredCards, action.desiredCards))
                return undefined
            if (tryRemoveCards(state.players[executorIdx].handCards, action.offeredCards) == undefined)
                return undefined

            const tradeObj: OpenTradeOffer = {
                acceptingColors: [],
                desiredCards: action.desiredCards,
                offeredCards: action.offeredCards,
                offeringColor: executor
            }

            return {
                ...state,
                phase: {
                    ...state.phase,
                    tradeOffers: [...state.phase.tradeOffers, tradeObj]
                }
            }
        }
        else if (action.type == GameActionType.AcceptTradeOffer) {
            const partnerCards = state.players[executorIdx].handCards

            if (state.phase.tradeOffers.find(x => sameTradeOffer(x, action.trade)) == undefined)
                return undefined
            if (tryRemoveCards(partnerCards, action.trade.desiredCards) == undefined)
                return undefined

            return {
                ...state,
                phase: {
                    ...state.phase,
                    tradeOffers: produce(state.phase.tradeOffers, to => { 
                        to.find(x => sameTradeOffer(x, action.trade))!.acceptingColors.push(executor)
                        return to 
                    })
                }
            }
        }
        else if (action.type == GameActionType.FinalizeTrade) {
            const partnerColor = action.trade.tradePartner
            const tradeObj = state.phase.tradeOffers.find(x => sameTradeOffer(x, action.trade))

            if (tradeObj == undefined)
                return undefined
            if (!tradeObj.acceptingColors.includes(partnerColor))
                return undefined

            const partnerCards = state.players.find(x => x.color == partnerColor)
            if (partnerCards == undefined)
                return undefined

            const newPartnerCards = tryRemoveCards(partnerCards.handCards, tradeObj.desiredCards)
            const newPlayerCards = tryRemoveCards(state.players[executorIdx].handCards, tradeObj.offeredCards)
            if (newPartnerCards == undefined ||
                newPlayerCards == undefined)
                return undefined

            return {
                ...state,
                players: produce(state.players, newPlayers => {
                    newPlayers.find(x => x.color == partnerColor)!.handCards = unfreeze(newPartnerCards)
                    newPlayers[executorIdx].handCards = unfreeze(newPlayerCards)
                    return newPlayers
                }),
                phase: {
                    ...state.phase,
                    tradeOffers: produce(state.phase.tradeOffers, to => to.toSpliced(to.findIndex(x => sameTradeOffer(x, tradeObj)), 1))
                }
            }
        }
        else
            return undefined
    }
}



function tryBuyBuilding(cards: readonly Resource[], type: BuildingType) {
    const cost = buildingCost(type)
    return tryRemoveCards(cards, cost)
}
function tryBuyConnection(cards: readonly Resource[], type: ConnectionType) {
    const cost = connectionCost(type)
    return tryRemoveCards(cards, cost)
}
