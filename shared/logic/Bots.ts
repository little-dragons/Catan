import { type Freeze } from "structurajs"
import { adjacentColorsToTile, adjacentRoads, availableRoadPositions, type Coordinate, landTiles, portsForColor, resourceFrequenciesForColor, sameCoordinate, SpecialPorts, type Board } from "./Board"
import { availableBuildingPositions, BuildingType, ConnectionType } from "./Buildings"
import { type GameActionInput, GameActionType, tryDoPlaceInitialRedacted } from "./GameAction"
import { GamePhaseType, isRobbingDiscardingCards, type RedactedGameState, RobbingPhaseType, TurnPhaseType, victoryPointsFromRedacted, requireActionFrom } from "./GameState"
import { buildingCost, type CardList, connectionCost, Resource, tryRemoveCards, tryTransferCard } from "./Resource"
import { Color } from "./Player"
import { type Distribution, mapRecord, popcountDistribution, sumDistribution } from "./Distribution"

export enum BotPersonality {
    Vincent // The trader
}

export type BotWeights = Freeze<{
    /**
     * Using {@link resourceFrequenciesForColor} and {@link sumDistribution}, we can calulate the overall income for a player.
     * Multiplying the income with this gives the score.
     */
    resourceFrequencies: number
    /**
     * Using {@link resourceFrequenciesForColor} and {@link popcountDistribution}, we can calculate the income diversity for a player.
     * This map gives weights for each number of accessible resources
     */
    resourceDiversity: [number, number, number, number, number]
    tradeVolume: number
    victoryPoints: number
}>

export const weightMap: Freeze<Record<BotPersonality, BotWeights>> = {
    [BotPersonality.Vincent] : {
        resourceFrequencies: 1,
        resourceDiversity: [0, 0, 0.2, 0.5, 0.6],
        tradeVolume: 1,
        victoryPoints: 1
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


export function resourceDiversityScore(mult: BotWeights['resourceDiversity'], board: Board, color: Color): number {
    const resourceFrequencies = resourceFrequenciesForColor(board, color)
    return mult[popcountDistribution(resourceFrequencies)]
}

export function resourceFrequencyScore(mult: BotWeights['resourceFrequencies'], board: Board, color: Color): number {
    const resourceFrequencies = resourceFrequenciesForColor(board, color)
    const resourceSum = sumDistribution(resourceFrequencies)
    return mult * resourceSum
}

export function victoryPointsScore(mult: BotWeights['victoryPoints'], state: RedactedGameState): number {
    return victoryPointsFromRedacted(state, state.self.color) * mult
}

export function tradeVolume(board: Board, color: Color): Distribution<Resource> {
    const resourceFrequencies = resourceFrequenciesForColor(board, color)
    const ports = portsForColor(board, color)

    return mapRecord(resourceFrequencies, ([res, num]) => {
        if (ports[res])
            return num / 2
        else if (ports[SpecialPorts.General])
            return num / 3
        else 
            return num / 4
    })
}

export function tradeVolumeScore(mult: BotWeights['tradeVolume'], board: Board, color: Color): number {
    return sumDistribution(tradeVolume(board, color)) * mult
}


export function scoreState(bot: Bot, state: RedactedGameState): number {
    const weights = weightMap[bot.personality]
    return resourceDiversityScore(weights.resourceDiversity, state.board, state.self.color) 
         + resourceFrequencyScore(weights.resourceFrequencies, state.board, state.self.color) 
         + tradeVolumeScore(weights.tradeVolume, state.board, state.self.color)
         + victoryPointsScore(weights.victoryPoints, state)
}


function initialSettlementPlacement(bot: Bot, state: RedactedGameState): Freeze<[Coordinate, [Coordinate, Coordinate]]> {
    const options = availableBuildingPositions(state.board, undefined)
                    .flatMap(set => adjacentRoads(set).map(road => {
                        return {
                            settlement: set,
                            road: road,
                            score: scoreState(bot, tryDoPlaceInitialRedacted(state, set, road)!)
                        }
                    }))

    const best = options.sort((a, b) => b.score - a.score)[0]

    return [best.settlement, best.road]
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
    if (possibleSettlements.length == 0 && possibleRoads.length > 0 && tryRemoveCards(state.self.handCards, connectionCost(ConnectionType.Road)) != undefined) {
        return {
            type: GameActionType.PlaceRoad,
            coordinates: possibleRoads[0]
        }
    }
    return {
        type: GameActionType.FinishTurn
    }
}

/**
 * Generates the next action for the bot. A sensical precondition is that {@link requireActionFrom} is valid for {@link state~self~color}.
 * @param bot The bot parameters.
 * @param state It is assumed that the state is redacted for the bot, such that {@link state~self~color} is the color of the bot.
 * @returns `undefined` if the bot cannot generate an action, otherwise a valid action.
 */
export function generateBotAction(bot: Bot, state: RedactedGameState): GameActionInput | undefined {
    if (isRobbingDiscardingCards(state.phase) && state.phase.playersLeftToDiscard.includes(state.self.color)) {
        return {
            type: GameActionType.DiscardResources,
            resources: cardsToDiscard(bot, state)
        }
    }

    if (state.currentPlayer != state.self.color)
        return undefined

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
            if (state.phase.robtype == RobbingPhaseType.DiscardingCards && state.phase.playersLeftToDiscard.includes(state.self.color)) {
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