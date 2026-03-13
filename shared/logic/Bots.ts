import { adjacentColorsToTile, adjacentRoads, landTiles, sameCoordinate } from "./Board"
import { availableBuildingPositions } from "./Buildings"
import { GameActionInput, GameActionType } from "./GameAction"
import { GamePhaseType, RedactedGameState, RobbingPhaseType, TurnPhaseType } from "./GameState"

export enum BotPersonality {
    Vincent
}

export type Bot = {
    personality: BotPersonality
    name: string
}

/**
 * 
 * @param bot 
 * @param state Assumes that the current player is the color of the bot.
 * @returns 
 */
export function generateBotAction(bot: Bot, state: RedactedGameState): GameActionInput {

    if (state.phase.type == GamePhaseType.Initial) {
        const settlement = availableBuildingPositions(state.board, undefined)[0]
        const road = adjacentRoads(settlement)[0]
        return {
            type: GameActionType.PlaceInitial,
            road: road,
            settlement: settlement
        }
    }
    

    switch (state.phase.subtype) {
        case TurnPhaseType.Robbing: {
            if (state.phase.robtype == RobbingPhaseType.DiscardingCards) {
                const toDiscard = Math.floor(state.self.handCards.length / 2)
                const discard = state.self.handCards.slice(state.self.handCards.length - toDiscard)
                return {
                    type: GameActionType.DiscardResources,
                    resources: discard
                }
            }

            const coord = landTiles(state.board).filter(x => !sameCoordinate(x.coord, state.board.robber))[0].coord
            const colors = adjacentColorsToTile(state.board, coord).filter(x => x != state.currentPlayer)
            return {
                type: GameActionType.PlaceRobber,
                robbedColor: colors.at(0),
                coordinate: coord
            }
        }
        case TurnPhaseType.PreDiceRoll: {
            return {
                type: GameActionType.RollDice
            }
        }
        case TurnPhaseType.Active: {
            return {
                type: GameActionType.FinishTurn
            }
        }
    }
}