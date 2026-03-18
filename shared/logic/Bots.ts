import { Freeze } from "structurajs"
import { adjacentColorsToTile, adjacentRoads, availableRoadPositions, Coordinate, landTiles, portsForCoord, portsForColor, resourceFrequenciesForColor, resourceFrequencyForBuilding, sameCoordinate } from "./Board"
import { availableBuildingPositions, BuildingType, ConnectionType } from "./Buildings"
import { GameActionInput, GameActionType } from "./GameAction"
import { GamePhaseType, RedactedGameState, RobbingPhaseType, TurnPhaseType } from "./GameState"
import { allResources, buildingCost, CardList, connectionCost, tryRemoveCards, tryTransferCard } from "./Resource"
import { Color } from "./Player"
import { addDistribution, popcountDistribution, sumDistribution } from "./Distribution"

export enum BotPersonality {
    Vincent // The trader
}

export type BotWeights = {
    /**
     * Using {@link resourceFrequenciesForColor} and {@link sumDistribution}, we can calulate the overall income for a player.
     * Multiplying the income with this gives the score.
     */
    resourceFrequencies: number
    /**
     * Using {@link resourceFrequenciesForColor} and {@link popcountDistribution}, we can calculate the income diversity for a player.
     * This map gives weights for each diversity level (= count of resources accessible)
     */
    resourceDiversity: [number, number, number, number, number]
    portAffinity: number
}

export const weightMap: Freeze<Record<BotPersonality, BotWeights>> = {
    [BotPersonality.Vincent] : {
        resourceFrequencies: 1,
        resourceDiversity: [0, 0, 0.2, 0.5, 0.6],
        portAffinity: 1.5,
    }
}

export type Bot = {
    personality: BotPersonality
    name: string
}

/**
 * Calculates the cards to discard.
 * @param bot 
 * @param state 
 * @returns A selection of half the cards of {@link RedactedGameState.self} which may be discarded
 */
function cardsToDiscard(bot: Bot, state: RedactedGameState): CardList {
    const toDiscard = Math.floor(state.self.handCards.length / 2)

    let oldCards = state.self.handCards
    let discarded: CardList = []
    for (let i = 0; i < toDiscard; i++) {
        [oldCards, discarded] = tryTransferCard(oldCards, discarded, oldCards[i])
    }

    return discarded
}

function scoreBoard(bot: Bot, state: RedactedGameState, coord: Coordinate): number {
    const resourceFrequencies = resourceFrequenciesForColor(state.board, state.self.color)
    const resourceDiversityScore = weightMap[bot.personality].resourceDiversity[popcountDistribution(resourceFrequencies)]
    const resourceFrequencyScore = weightMap[bot.personality].resourceFrequencies * sumDistribution(resourceFrequencies)

    const ports = portsForColor(state.board, state.self.color)


    return resourceDiversityScore + resourceFrequencyScore
}


function scoreInitialSettlement(bot: Bot, state: RedactedGameState, coord: Coordinate): number {
    const weights = weightMap[bot.personality]

    const oldDistribution = resourceFrequenciesForColor(state.board, state.self.color)
    const newDistribution = resourceFrequencyForBuilding(state.board, { coord, type: BuildingType.Settlement })
    const distribution = addDistribution(oldDistribution, newDistribution)

    const coveredResources = popcountDistribution(distribution)
    const resourceDiversity = weights.resourceDiversity[coveredResources]

    const resourceFrequencies = sumDistribution(distribution) * weights.resourceFrequencies

    
    

    return resourceFrequencies + resourceDiversity
}

function initialSettlementPlacement(bot: Bot, state: RedactedGameState): Freeze<[Coordinate, [Coordinate, Coordinate]]> {
    const settlements = availableBuildingPositions(state.board, undefined)
                            .toSorted((a, b) => scoreInitialSettlement(bot, state, b) - scoreInitialSettlement(bot, state, a))
    const settlement = settlements[0]

    const road = adjacentRoads(settlement)[0]

    return [settlement, road]
}

export function placeRobber(bot: Bot, state: RedactedGameState): [Coordinate, Color | undefined] {
    const validNewTiles = landTiles(state.board).filter(x => !sameCoordinate(x.coord, state.board.robber))
    const coord = validNewTiles[0].coord
    const colors = adjacentColorsToTile(state.board, coord).filter(x => x != state.currentPlayer)

    return [coord, colors.at(0)]
}

export function activeAction(bot: Bot, state: RedactedGameState): GameActionInput {
    const possibleSettlements = availableBuildingPositions(state.board, state.self.color)
    if (possibleSettlements.length > 0 && tryRemoveCards(state.self.handCards, buildingCost(BuildingType.Settlement)) != undefined) {
        return {
            type: GameActionType.PlaceSettlement,
            coordinate: possibleSettlements[0]
        }
    }

    const possibleRoads = availableRoadPositions(state.board, state.self.color)
    if (possibleRoads.length > 0 && tryRemoveCards(state.self.handCards, connectionCost(ConnectionType.Road)) != undefined) {
        return {
            type: GameActionType.PlaceRoad,
            coordinates: possibleRoads[0]
        }
    }
    return {
        type: GameActionType.FinishTurn
    }
}

export function generateBotAction(bot: Bot, state: RedactedGameState): GameActionInput {
    if (state.phase.type == GamePhaseType.Initial) {
        const [settlement, road] = initialSettlementPlacement(bot, state)
        return {
            type: GameActionType.PlaceInitial,
            road: road,
            settlement: settlement
        }
    }
    
    switch (state.phase.subtype) {
        case TurnPhaseType.Robbing: {
            if (state.phase.robtype == RobbingPhaseType.DiscardingCards) {
                return {
                    type: GameActionType.DiscardResources,
                    resources: cardsToDiscard(bot, state)
                }
            }

            const [coord, color] = placeRobber(bot, state)
            return {
                type: GameActionType.PlaceRobber,
                robbedColor: color,
                coordinate: coord
            }
        }
        case TurnPhaseType.PreDiceRoll: {
            return {
                type: GameActionType.RollDice
            }
        }
        case TurnPhaseType.Active: return activeAction(bot, state)
    }
}