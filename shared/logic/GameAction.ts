import { produce, unfreeze } from "structurajs"
import { adjacentResourceTiles, adjacentRoads, availableRoadPositions, Coordinate, gainedResources, isAvailableRoadPosition, Road, sameCoordinate, sameRoad } from "./Board.js"
import { BuildingType, ConnectionType, availableBuildingPositions, isAvailableBuildingPosition } from "./Buildings.js"
import { FullGameState, nextTurn, GamePhaseType, DieResult, isPreDiceRoll, TurnPhaseType, isActive, isInitial, isRobbingDiscardingCards, isRobbingMovingRobber, RobbingPhaseType, RedactedGameState, publicGameState, longestRoadForColor, colorWithLongestRoad } from "./GameState.js"
import { Color } from "./Player.js"
import { addCards, buildingCost, connectionCost, devCardCost, Resource, tryRemoveCards } from "./Resource.js"
import { canTradeWithBank, FinalizedTrade, isValidOffer, OpenTradeOffer, sameTradeOffer, TradeOffer, TradeStatusByColor } from "./Trade.js"
import { allRobbableCrossings, allRobbableCrossingsExcept, robbableCrossingsForColor, validNewRobberPosition } from "./Robber.js"


export enum DevCardType {
    Knight,
    YearOfPlenty,
    Monopoly,
    VictoryPoint,
    RoadBuilding
}
export const allDevCardTypes = [DevCardType.Knight, DevCardType.Monopoly, DevCardType.YearOfPlenty, DevCardType.RoadBuilding, DevCardType.VictoryPoint] as const

export function countDevCards(cards: readonly DevCardType[]): Map<DevCardType, number> {
    return new Map(
        allDevCardTypes.map(type => [type, cards.filter(x => x == type).length])
    )
}

export enum GameActionType {
    RollDice,
    PlaceSettlement,
    PlaceCity,
    PlaceRoad,
    PlaceInitial,
    PlaceRobber,
    BankTrade,
    OfferTrade,
    AcceptTradeOffer,
    RejectTradeOffer,
    FinalizeTrade,
    AbortTrade,
    FinishTurn,
    PlayDevCard,
    BuyDevCard,
    DiscardResources,
}

type GameActionInfos = {
    [Name in GameActionType]: 
        Name extends GameActionType.RollDice ? {
            type: Name,
            input: {
            },
            response: {
                die1: DieResult
                die2: DieResult
            }
        } : Name extends GameActionType.PlaceSettlement ? {
            type: Name,
            input: {
                coordinate: Coordinate
            },
            response: undefined
        } : Name extends GameActionType.PlaceCity ? {
            type: Name,
            input: {
                coordinate: Coordinate
            },
            response: undefined
        } : Name extends GameActionType.PlaceRoad ? {
            type: Name,
            input: {
                coordinates: Road
            },
            response: undefined
        } : Name extends GameActionType.PlaceRobber ? {
            type: Name,
            input: {
                coordinate: Coordinate
                robbedColor: Color | undefined
            },
            response: {
                robbedResource: Resource | undefined
            }
        } : Name extends GameActionType.BankTrade ? {
            type: Name,
            input: {
                offeredCards: readonly Resource[]
                desiredCards: readonly Resource[]
            },
            response: undefined
        } : Name extends GameActionType.OfferTrade ? {
            type: Name,
            input: {
                offeredCards: readonly Resource[]
                desiredCards: readonly Resource[]
            },
            response: undefined
        } : Name extends GameActionType.AcceptTradeOffer ? {
            type: Name,
            input: {
                trade: TradeOffer
            },
            response: undefined
        } : Name extends GameActionType.RejectTradeOffer ? {
            type: Name,
            input: {
                trade: TradeOffer
            },
            response: undefined
        } : Name extends GameActionType.FinalizeTrade ? {
            type: Name,
            input: {
                trade: FinalizedTrade
            },
            response: undefined
        } : Name extends GameActionType.AbortTrade ? {
            type: Name,
            input: {
                trade: TradeOffer
            },
            response: undefined
        } : Name extends GameActionType.PlaceInitial ? {
            type: Name,
            input: {
                settlement: Coordinate
                road: Road
            },
            response: undefined
        } : Name extends GameActionType.FinishTurn ? {
            type: Name,
            input: {
            },
            response: undefined
        } : Name extends GameActionType.PlayDevCard ? {
            type: Name,
        } & ({
                input: {
                    cardType: DevCardType.Knight
                    newPosition: Coordinate
                    robbedColor: Color | undefined
                }
                response: {
                    robbedCard: Resource | undefined
                }
            } | {
                input: {
                    cardType: DevCardType.YearOfPlenty
                    resources: readonly [Resource, Resource]
                }
                response: undefined
            } | {
                input: {
                    cardType: DevCardType.Monopoly
                    resource: Resource
                }
                response: undefined
            } | {
                input: {
                    cardType: DevCardType.RoadBuilding
                    roads: [Road, Road]
                }
                response: undefined
            }
        ) : Name extends GameActionType.DiscardResources ? {
            type: Name,
            input: {
                resources: readonly Resource[]
            },
            response: undefined
        } : Name extends GameActionType.BuyDevCard ? {
            type: Name,
            input: {

            },
            response: {
                cardType: DevCardType
            }
        }
        : never
}
export type GameActionInfo = GameActionInfos[GameActionType]
type GameActionInputMap = {
    [Name in GameActionType]: {
        type: Name
    } & GameActionInfos[Name]['input']
}
export type GameActionInput = GameActionInputMap[GameActionType]
export type GameActionResponse = GameActionInfo['response']
export type TypedGameActionResponse = NonNullable<{
    [Name in GameActionType]: {
        type: Name
    } & GameActionInfos[Name]['response']
}[GameActionType]>


type ResultType<T extends GameActionType> =
    undefined | [FullGameState, GameActionInfos[T]['response']]

function tryDoRollDice(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.RollDice]): ResultType<GameActionType.RollDice> {
    if (!isPreDiceRoll(state.phase) || executorColor != state.currentPlayer)
        return undefined

    const die1 = Math.floor(Math.random() * 6) + 1 as DieResult
    const die2 = Math.floor(Math.random() * 6) + 1 as DieResult

    if (die1 + die2 == 7) {
        const playersToDiscard = state.players.filter(x => x.handCards.length > 7).map(x => x.color)

        if (playersToDiscard.length == 0)
            return [{...state,
                phase: {
                type: GamePhaseType.Turns,
                subtype: TurnPhaseType.Robbing,
                robtype: RobbingPhaseType.MovingRobber
            }}, { die1, die2 }]
        else
            return [{ ...state, phase: {
                type: GamePhaseType.Turns,
                subtype: TurnPhaseType.Robbing,
                robtype: RobbingPhaseType.DiscardingCards,
                playersLeftToDiscard: playersToDiscard,
            }}, { die1, die2 }]
    }
    else {
        // dispense resources
        const newPlayers = state.players.map(({ color, handCards: oldCards, devCards }) => {
            return {
                color,
                handCards: addCards(oldCards, gainedResources(state.board, color, die1 + die2)),
                devCards
            }
        })

        return [{...state,
            phase: {
                type: GamePhaseType.Turns,
                subtype: TurnPhaseType.Active,
                tradeOffers: []
            },
            players: newPlayers
        }, { die1, die2 }]
    }
}
function tryDoPlaceSettlement(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.PlaceSettlement]): ResultType<GameActionType.PlaceSettlement> {
    if (!isActive(state.phase) || executorColor != state.currentPlayer)
        return undefined

    const executorIdx = state.players.findIndex(x => x.color == executorColor)
    if (executorIdx < 0)
        return undefined

    if (!isAvailableBuildingPosition(action.coordinate, state.board, executorColor))
        return undefined

    const newCards = tryBuyBuilding(state.players[executorIdx]!.handCards, BuildingType.Settlement)
    if (newCards == undefined)
        return undefined

    return [produce(state, newState => {
        newState.players[executorIdx].handCards = unfreeze(newCards)
        newState.board.buildings.push({ color: executorColor, coord: unfreeze(action.coordinate), type: BuildingType.Settlement })
        return newState
    }), undefined]
}
function tryDoPlaceCity(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.PlaceCity]): ResultType<GameActionType.PlaceCity> {
    if (!isActive(state.phase) || executorColor != state.currentPlayer)
        return undefined

    const executorIdx = state.players.findIndex(x => x.color == executorColor)
    if (executorIdx < 0)
        return undefined

    const validSettlementIdx = 
        state.board.buildings.findIndex(({ color, coord, type }) => 
            sameCoordinate(action.coordinate, coord) && 
            type == BuildingType.Settlement && 
            color == executorColor)

    if (validSettlementIdx < 0)
        return undefined

    const newCards = tryBuyBuilding(state.players[executorIdx]!.handCards, BuildingType.City)
    if (newCards == undefined)
        return undefined

    return [produce(state, newState => {
        newState.players[executorIdx].handCards = unfreeze(newCards)
        newState.board.buildings[validSettlementIdx] = { color: executorColor, coord: unfreeze(action.coordinate), type: BuildingType.City }
    }), undefined]
}
function tryDoPlaceRoad(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.PlaceRoad]): ResultType<GameActionType.PlaceRoad> {
    if (!isActive(state.phase) || executorColor != state.currentPlayer)
        return undefined

    const executorIdx = state.players.findIndex(x => x.color == executorColor)
    if (executorIdx < 0)
        return undefined
    if (!isAvailableRoadPosition(state.board, action.coordinates, executorColor))
        return undefined


    const newCards = tryBuyConnection(state.players[executorIdx]!.handCards, ConnectionType.Road)
    if (newCards == undefined)
        return undefined

    // check for longest road
    const newBoard = produce(state.board, newBoard => { newBoard.roads.push({ color: executorColor, coord: unfreeze(action.coordinates) }) })
    const longestRoad = colorWithLongestRoad(newBoard, state.longestRoad)

    return [produce(state, newState => {
        newState.players[executorIdx].handCards = unfreeze(newCards)
        newState.board.roads.push({ color: executorColor, coord: unfreeze(action.coordinates) })
        newState.longestRoad = longestRoad
    }), undefined]
}
function tryDoPlaceInitial(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.PlaceInitial]): ResultType<GameActionType.PlaceInitial> {
    if (!isInitial(state.phase) || executorColor != state.currentPlayer)
        return undefined
    
    if (!isAvailableBuildingPosition(action.settlement, state.board, undefined))
        return undefined

    if (!adjacentRoads(action.settlement).some(x => sameRoad(x, action.road)))
        return undefined
    
    const newCards = 
        state.phase.forward ? [] :
        adjacentResourceTiles(action.settlement, state.board, undefined)

    const newPlayers = state.players.map(({ color, handCards, devCards }) => {
        if (color == executorColor)
            return { color, handCards: newCards, devCards }
        else
            return { color, handCards, devCards }
    })

    
    const [nextColor, nextPhase] = nextTurn(publicGameState(state))
    const newBoard = produce(state.board, board => {
        board.buildings.push({ color: executorColor, coord: unfreeze(action.settlement), type: BuildingType.Settlement })
        board.roads.push({ color: executorColor, coord: unfreeze(action.road) })
        return board
    })
    return [{
        currentPlayer: nextColor,
        phase: nextPhase,
        players: newPlayers,
        board: newBoard,
        longestRoad: undefined,
        devCards: state.devCards,
    }, undefined]
}
function tryDoPlaceRobber(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.PlaceRobber]): ResultType<GameActionType.PlaceRobber> {

    if (!isRobbingMovingRobber(state.phase) || executorColor != state.currentPlayer)
        return undefined

    if (!validNewRobberPosition(state.board, action.coordinate))
        return undefined

    if (action.robbedColor != undefined) {
        const robbables = robbableCrossingsForColor(publicGameState(state), action.coordinate, action.robbedColor)
        if (robbables.length == 0)
            return undefined

        const robbedPlayerIdx = state.players.findIndex(x => x.color == action.robbedColor)
        if (robbedPlayerIdx < 0)
            return undefined

        const executorIdx = state.players.findIndex(x => x.color == executorColor)
        if (executorIdx < 0)
            return undefined

        const robbedPlayerCards = state.players[robbedPlayerIdx].handCards
        if (robbedPlayerCards.length == 0)
            return undefined
        const robbedResourceIdx = Math.floor(robbedPlayerCards.length * Math.random())
        const robbedResource = robbedPlayerCards[robbedResourceIdx]

        return [{...state,
            phase: {
                type: GamePhaseType.Turns,
                subtype: TurnPhaseType.Active,
                tradeOffers: []
            },
            players: produce(state.players, x => {
                x[robbedPlayerIdx].handCards = robbedPlayerCards.toSpliced(robbedResourceIdx, 1)
                x[executorIdx].handCards.push(robbedResource)
            }),
            board: {...state.board,
                robber: action.coordinate
            }
        }, { robbedResource }]
    }
    else if (allRobbableCrossings(publicGameState(state), action.coordinate).size == 0)
        // you can only not take a card if no robbable color is adjacent
        return [{...state,
            phase: {
                type: GamePhaseType.Turns,
                subtype: TurnPhaseType.Active,
                tradeOffers: []
            },
            board: {...state.board,
                robber: action.coordinate
            }
        }, { robbedResource: undefined }]
    else
        return undefined
}
function tryDoBankTrade(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.BankTrade]): ResultType<GameActionType.BankTrade> {
    const executorIdx = state.players.findIndex(x => x.color == executorColor)
    if (executorIdx < 0)
        return undefined
    if (!isActive(state.phase) || executorColor != state.currentPlayer)
        return undefined

    if(!canTradeWithBank(state.board, executorColor, action.offeredCards, action.desiredCards))
        return undefined

    const cardsAfterPayment = tryRemoveCards(state.players[executorIdx]!.handCards, action.offeredCards)

    if (cardsAfterPayment == undefined)
        return undefined

    const newCards = cardsAfterPayment.concat(action.desiredCards)

    return [produce(state, newState => {
        newState.players[executorIdx].handCards = newCards
    }), undefined]
}
function tryDoOfferTrade(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.OfferTrade]): ResultType<GameActionType.OfferTrade> {
    const executorIdx = state.players.findIndex(x => x.color == executorColor)
    if (executorIdx < 0)
        return undefined
    if (!isActive(state.phase) || executorColor != state.currentPlayer)
        return undefined

    if (!isValidOffer(action.offeredCards, action.desiredCards))
        return undefined
    if (tryRemoveCards(state.players[executorIdx].handCards, action.offeredCards) == undefined)
        return undefined

    const tradeObj: OpenTradeOffer = {
        otherColors: state.players
            .filter(x => x.color != executorColor)
            .map(x => { return { color: x.color, status: TradeStatusByColor.Undecided } }),
        desiredCards: action.desiredCards,
        offeredCards: action.offeredCards,
        offeringColor: executorColor
    }

    return [{
        ...state,
        phase: {
            ...state.phase,
            tradeOffers: [...state.phase.tradeOffers, tradeObj]
        }
    }, undefined]
}
function tryDoAcceptTradeOffer(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.AcceptTradeOffer]): ResultType<GameActionType.AcceptTradeOffer> {
    const executorIdx = state.players.findIndex(x => x.color == executorColor)
    if (executorIdx < 0)
        return undefined
    if (!isActive(state.phase) || executorColor == state.currentPlayer)
        return undefined

    const partnerCards = state.players[executorIdx].handCards
    const tradeOffer = state.phase.tradeOffers.find(x => sameTradeOffer(x, action.trade))
    
    if (tradeOffer == undefined)
        return undefined
    if (tryRemoveCards(partnerCards, action.trade.desiredCards) == undefined)
        return undefined

    const currentStatus = tradeOffer.otherColors.find(x => x.color == executorColor)?.status
    if (currentStatus == undefined)
        return undefined

    return [{
        ...state,
        phase: {
            ...state.phase,
            tradeOffers: produce(state.phase.tradeOffers, to => { 
                to
                    .find(x => sameTradeOffer(x, action.trade))!
                    .otherColors
                    .find(y => y.color == executorColor)!
                    .status = TradeStatusByColor.Accepting
                return to 
            })
        }
    }, undefined]
}
function tryDoRejectTradeOffer(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.RejectTradeOffer]): ResultType<GameActionType.RejectTradeOffer> {
    if (!isActive(state.phase) || executorColor == state.currentPlayer)
        return undefined

    const tradeOffer = state.phase.tradeOffers.find(x => sameTradeOffer(x, action.trade))
    
    if (tradeOffer == undefined)
        return undefined

    const currentStatus = tradeOffer.otherColors.find(x => x.color == executorColor)?.status
    if (currentStatus == undefined)
        return undefined

    return [{
        ...state,
        phase: {
            ...state.phase,
            tradeOffers: produce(state.phase.tradeOffers, to => { 
                to
                    .find(x => sameTradeOffer(x, action.trade))!
                    .otherColors
                    .find(y => y.color == executorColor)!
                    .status = TradeStatusByColor.Rejecting
                return to 
            })
        }
    }, undefined]

}
function tryDoFinalizeTrade(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.FinalizeTrade]): ResultType<GameActionType.FinalizeTrade> {
    const executorIdx = state.players.findIndex(x => x.color == executorColor)
    if (executorIdx < 0)
        return undefined
    if (!isActive(state.phase) || executorColor != state.currentPlayer)
        return undefined

    const partnerColor = action.trade.tradePartner
    const tradeObj = state.phase.tradeOffers.find(x => sameTradeOffer(x, action.trade))

    if (tradeObj == undefined)
        return undefined
    if (!tradeObj.otherColors.some(x => x.color == partnerColor && x.status == TradeStatusByColor.Accepting))
        return undefined

    const partnerCards = state.players.find(x => x.color == partnerColor)
    if (partnerCards == undefined)
        return undefined

    const newPartnerCards = tryRemoveCards(partnerCards.handCards, tradeObj.desiredCards)
    const newPlayerCards = tryRemoveCards(state.players[executorIdx].handCards, tradeObj.offeredCards)
    if (newPartnerCards == undefined ||
        newPlayerCards == undefined)
        return undefined

    return [{
        ...state,
        players: produce(state.players, newPlayers => {
            newPlayers.find(x => x.color == partnerColor)!.handCards = unfreeze(addCards(newPartnerCards, tradeObj.offeredCards))
            newPlayers[executorIdx].handCards = unfreeze(addCards(newPlayerCards, tradeObj.desiredCards))
            return newPlayers
        }),
        phase: {
            ...state.phase,
            tradeOffers: produce(state.phase.tradeOffers, to => to.toSpliced(to.findIndex(x => sameTradeOffer(x, tradeObj)), 1))
        }
    }, undefined]
}
function tryDoAbortTrade(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.AbortTrade]): ResultType<GameActionType.AbortTrade> {
    if (!isActive(state.phase) || executorColor != state.currentPlayer)
        return undefined

    const tradeOffer = state.phase.tradeOffers.find(x => sameTradeOffer(x, action.trade))
    
    if (tradeOffer == undefined || tradeOffer.offeringColor != executorColor)
        return undefined

    return [{
        ...state,
        phase: {
            ...state.phase,
            tradeOffers: produce(state.phase.tradeOffers, to => to.toSpliced(to.findIndex(x => sameTradeOffer(x, tradeOffer)), 1))
        }
    }, undefined]
}
function tryDoFinishTurn(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.FinishTurn]): ResultType<GameActionType.FinishTurn> {

    if (!isActive(state.phase) || executorColor != state.currentPlayer)
        return undefined

    const [nextColor, nextPhase] = nextTurn(publicGameState(state))
    return [{
        ...state,
        currentPlayer: nextColor,
        phase: nextPhase
    }, undefined]

}
function tryDoPlayDevCard(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.PlayDevCard]): ResultType<GameActionType.PlayDevCard> {
    const executorIdx = state.players.findIndex(x => x.color == executorColor)
    if (executorIdx < 0)
        return undefined

    const devCardIdx = state.players[executorIdx].devCards.findIndex(x => x == action.cardType)
    if (devCardIdx < 0)
        return undefined
    const newDevCards = state.players[executorIdx].devCards.toSpliced(devCardIdx, 1)

    switch (action.cardType) {
        case DevCardType.Knight: {
            if ((!isActive(state.phase) && !isPreDiceRoll(state.phase)) || executorColor != state.currentPlayer)
                return undefined

            if (!validNewRobberPosition(state.board, action.newPosition))
                return undefined
        
            if (action.robbedColor == undefined) {
                if (allRobbableCrossingsExcept(publicGameState(state), action.newPosition, executorColor).size != 0)
                    return undefined

                return [produce(state, newState => {
                    newState.board.robber = unfreeze(action.newPosition)
                    newState.players[executorIdx].devCards = newDevCards
                }), undefined]

            }
            else {
                if (robbableCrossingsForColor(publicGameState(state), action.newPosition, action.robbedColor).length == 0)
                    return undefined
        
                const robbedPlayerIdx = state.players.findIndex(x => x.color == action.robbedColor)
                if (robbedPlayerIdx < 0)
                    return undefined

                const robbedPlayerCards = state.players[robbedPlayerIdx].handCards
                if (robbedPlayerCards.length == 0)
                    return undefined
                const robbedResourceIdx = Math.floor(robbedPlayerCards.length * Math.random())
                const robbedResource = robbedPlayerCards[robbedResourceIdx]
                const newRobbedPlayerCards = robbedPlayerCards.toSpliced(robbedResourceIdx, 1)
                const newExecutorCards = state.players[executorIdx].handCards.concat([robbedResource])

                return [produce(state, newState => {
                    newState.players[robbedPlayerIdx].handCards = unfreeze(newRobbedPlayerCards)
                    newState.players[executorIdx].handCards = unfreeze(newExecutorCards)
                    newState.board.robber = unfreeze(action.newPosition)
                    newState.players[executorIdx].devCards = newDevCards
                }), { robbedCard: robbedResource }]
            }
        }
        case DevCardType.YearOfPlenty: {
            return [produce(state, newState => {
                newState.players[executorIdx].handCards = [...action.resources, ...state.players[executorIdx].handCards]
                newState.players[executorIdx].devCards = newDevCards
            }), undefined]
        }
        case DevCardType.Monopoly: {
            return [produce(state, newState => {
                newState.players = newState.players.map(player => {
                    if (player.color == executorColor)
                        return { 
                            ...player,
                            devCards: newDevCards,
                            handCards: 
                                player.handCards.filter(x => x != action.resource)
                                .concat(
                                    state.players
                                    .flatMap(x => x.handCards
                                        .filter(res => res == action.resource)))
                        }
                    else
                        return { ...player, handCards: player.handCards.filter(x => x != action.resource)}
                })
            }), undefined]
        }
        case DevCardType.RoadBuilding: 
            if (!isAvailableRoadPosition(state.board, action.roads[0], executorColor))
                return undefined

            const firstRoadBoard = produce(state.board, newBoard => {
                newBoard.roads.push({ color: executorColor, coord: unfreeze(action.roads[0]) })
            })

            if (!isAvailableRoadPosition(firstRoadBoard, action.roads[1], executorColor))
                return undefined
            
            const secondRoadBoard = produce(firstRoadBoard, newBoard => {
                newBoard.roads.push({ color: executorColor, coord: unfreeze(action.roads[1]) })
            })

            return [produce(state, newState => {
                newState.board = unfreeze(secondRoadBoard)
                newState.players[executorIdx].devCards = newDevCards
            }), undefined]
    }
}
function tryDoDiscardResources(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.DiscardResources]): ResultType<GameActionType.DiscardResources> {
    if (!isRobbingDiscardingCards(state.phase))
        return undefined

    if (!state.phase.playersLeftToDiscard.includes(executorColor))
        return undefined

    const executorIdx = state.players.findIndex(x => x.color == executorColor)
    if (executorIdx < 0)
        return undefined

    const oldResources = state.players[executorIdx].handCards
    if (action.resources.length != Math.floor(oldResources.length / 2))
        return undefined
    
    const newResources = tryRemoveCards(oldResources, action.resources)
    if (newResources == undefined)
        return undefined

    const newPlayers = produce(state.players, x => {
        x[executorIdx].handCards = unfreeze(newResources)
    })

    if (state.phase.playersLeftToDiscard.length == 1)
        return [{ ...state,
            phase: {
                type: GamePhaseType.Turns,
                subtype: TurnPhaseType.Robbing,
                robtype: RobbingPhaseType.MovingRobber,
            },
            players: newPlayers
        }, undefined]
    else
        return [{ ...state,
            phase: {
                ...state.phase,
                playersLeftToDiscard: state.phase.playersLeftToDiscard.filter(x => x != executorColor)
            },
            players: newPlayers
        }, undefined]
}

export function tryDoBuyDevCard(state: FullGameState, executorColor: Color, action: GameActionInputMap[GameActionType.BuyDevCard]): ResultType<GameActionType.BuyDevCard> {
    if (!isActive(state.phase) || state.currentPlayer != executorColor)
        return undefined

    const executorIdx = state.players.findIndex(x => x.color == executorColor)
    if (executorIdx < 0)
        return undefined

    const playerCards = state.players[executorIdx].handCards
    const newCards = tryRemoveCards(playerCards, devCardCost)
    if (newCards == undefined)
        return undefined

    const devCardCounts = new Map([
        [DevCardType.Knight, state.devCards.knights],
        [DevCardType.VictoryPoint, state.devCards.victoryPoints],
        [DevCardType.RoadBuilding, state.devCards.roadBuilding],
        [DevCardType.Monopoly, state.devCards.monopoly],
        [DevCardType.YearOfPlenty, state.devCards.yearOfPlenty]
    ])
    const total = Array.from(devCardCounts).reduce((a, b) => a + b[1], 0)
    let idx = Math.floor(Math.random() * total)
      
    let receivedCard: DevCardType | undefined
    for(const [card, count] of devCardCounts) {
        if (idx < count) {
            receivedCard = card
            break
        }
        idx -= count
    }
    if (receivedCard == undefined)
        receivedCard = DevCardType.Knight

    return [produce(state, newState => {
        newState.players[executorIdx].handCards = unfreeze(newCards)
        newState.players[executorIdx].devCards.push(receivedCard)
    }), { cardType: receivedCard }]
}

export function tryDoAction<T extends GameActionType>(state: FullGameState, executor: Color,  action: GameActionInput): ResultType<T> {
    switch (action.type) {
        case GameActionType.RollDice: return tryDoRollDice(state, executor, action)
        case GameActionType.PlaceSettlement: return tryDoPlaceSettlement(state, executor, action)
        case GameActionType.PlaceCity: return tryDoPlaceCity(state, executor, action)
        case GameActionType.PlaceRoad: return tryDoPlaceRoad(state, executor, action)
        case GameActionType.PlaceInitial: return tryDoPlaceInitial(state, executor, action)
        case GameActionType.PlaceRobber: return tryDoPlaceRobber(state, executor, action)
        case GameActionType.BankTrade: return tryDoBankTrade(state, executor, action)
        case GameActionType.OfferTrade: return tryDoOfferTrade(state, executor, action)
        case GameActionType.AcceptTradeOffer: return tryDoAcceptTradeOffer(state, executor, action)
        case GameActionType.RejectTradeOffer: return tryDoRejectTradeOffer(state, executor, action)
        case GameActionType.FinalizeTrade: return tryDoFinalizeTrade(state, executor, action)
        case GameActionType.AbortTrade: return tryDoAbortTrade(state, executor, action)
        case GameActionType.FinishTurn: return tryDoFinishTurn(state, executor, action)
        case GameActionType.PlayDevCard: return tryDoPlayDevCard(state, executor, action)
        case GameActionType.DiscardResources: return tryDoDiscardResources(state, executor, action)
        case GameActionType.BuyDevCard: return tryDoBuyDevCard(state, executor, action)
    }

    // this is required because undefined is a possible return value for this function
    // and an error would not occur if some case is not covered otherwise
    const _assert: never = action
}


function tryBuyBuilding(cards: readonly Resource[], type: BuildingType) {
    const cost = buildingCost(type)
    return tryRemoveCards(cards, cost)
}
function tryBuyConnection(cards: readonly Resource[], type: ConnectionType) {
    const cost = connectionCost(type)
    return tryRemoveCards(cards, cost)
}


export function canFinishTurn(state: RedactedGameState): boolean {
    return isActive(state.phase) && state.currentPlayer == state.self.color
}
export function canPlaceSettlement(state: RedactedGameState): boolean {
    if (!isActive(state.phase) || state.currentPlayer != state.self.color)
        return false

    const freePositions = availableBuildingPositions(state.board, state.self.color).length > 0
    const hasCards = tryBuyBuilding(state.self.handCards, BuildingType.Settlement) != undefined
    return freePositions && hasCards
}
export function canPlaceRoad(state: RedactedGameState): boolean {
    if (!isActive(state.phase) || state.currentPlayer != state.self.color)
        return false

    const freePositions = availableRoadPositions(state.board, state.self.color).length > 0
    const hasCards = tryBuyConnection(state.self.handCards, ConnectionType.Road) != undefined
    return freePositions && hasCards
}
export function canPlaceCity(state: RedactedGameState): boolean {
    if (!isActive(state.phase) || state.currentPlayer != state.self.color)
        return false

    const freePositions = state.board.buildings.some(({ color, coord, type }) => type == BuildingType.Settlement && color == state.self.color)
    const hasCards = tryBuyBuilding(state.self.handCards, BuildingType.City) != undefined
    return freePositions && hasCards
}
export function canOfferTrade(state: RedactedGameState): boolean {
    return isActive(state.phase) && state.self.handCards.length > 0 && state.currentPlayer == state.self.color
}
export function canRollDice(state: RedactedGameState): boolean {
    return isPreDiceRoll(state.phase) && state.currentPlayer == state.self.color
}
export function canBuyDevCard(state: RedactedGameState): boolean {
    if (!isActive(state.phase) || state.currentPlayer != state.self.color)
        return false

    const hasResources = tryRemoveCards(state.self.handCards, devCardCost) != undefined
    return hasResources
}

export type PossiblyRedactedGameActionInfo = 
    {
        type: GameActionType.DiscardResources,
        redacted: true,
        input: {
            resourcesCount: number
        },
        response: undefined
    } | {
        type: GameActionType.PlaceRobber,
        redacted: true,
        input: GameActionInfos[GameActionType.PlaceRobber]['input'],
        response: undefined
    } | {
        type: GameActionType.BuyDevCard,
        redacted: true,
        input: GameActionInfos[GameActionType.BuyDevCard]['input'],
        response: undefined
    } | {
        type: GameActionType.PlayDevCard,
        input: GameActionInfos[GameActionType.BuyDevCard]['input'],
        reponse: undefined
        redacted: true
    } |
    GameActionInfo & { redacted: false }

export function redactGameActionInfoFor(gameActionInfo: GameActionInfo, executorColor: Color, redactTarget: Color): PossiblyRedactedGameActionInfo {
    if (executorColor == redactTarget)
        return  { ...gameActionInfo, redacted: false }

    if (gameActionInfo.type == GameActionType.DiscardResources) {
        return {
            type: GameActionType.DiscardResources,
            redacted: true,
            input: {
                resourcesCount: gameActionInfo.input.resources.length
            },
            response: undefined
        }
    }
    if (gameActionInfo.type == GameActionType.PlaceRobber && gameActionInfo.input.robbedColor != redactTarget) {
        return {
            type: GameActionType.PlaceRobber,
            redacted: true,
            input: gameActionInfo.input,
            response: undefined
        }
    }
    if (gameActionInfo.type == GameActionType.BuyDevCard) {
        return {
            type: GameActionType.BuyDevCard,
            redacted: true,
            input: gameActionInfo.input,
            response: undefined
        }
    }
    if (gameActionInfo.type == GameActionType.PlayDevCard && gameActionInfo.input.cardType == DevCardType.Knight && redactTarget != gameActionInfo.input.robbedColor) {
        return {
            input: gameActionInfo.input,
            redacted: true,
            reponse: undefined,
            type: GameActionType.PlayDevCard
        }
    }

    return  { ...gameActionInfo, redacted: false }
}
