import { describe, expect, it } from '@jest/globals'
import { availableBuildingPositions, defaultBoard, randomBoardSeed } from 'shared'

describe('boardGeneration', () => {
    it('should generate the correct amount of available building positions', () => {
        const generatedBoard = defaultBoard(randomBoardSeed())
        const positions = availableBuildingPositions(generatedBoard, undefined)
        expect(positions.length).toBe(54)
    })
})
