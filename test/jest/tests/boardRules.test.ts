import { describe, expect, it } from '@jest/globals'
import { Color, colorWithLongestRoad, longestRoadForColor } from 'shared'
import { blueAndRedMoreTriangles, blueAndRedTriangle, complexBlueRoad, moreComplexBlueRoad, yellowAndGreenSameLength, yellowAndGreenSameLength2, yellowHasLongerThanGreen, yellowHasLongestRoad2Board, yellowHasLongestRoadBoard, yellowHasLongestRoadWithCycle } from './boardRules.setup'

describe('boardRules', () => {
    it('should measure road lengths correctly', () => {

        expect(longestRoadForColor(blueAndRedTriangle, Color.Red)).toBe(2)
        expect(longestRoadForColor(blueAndRedTriangle, Color.Blue)).toBe(3)
        
        expect(longestRoadForColor(blueAndRedMoreTriangles, Color.Red)).toBe(2)
        expect(longestRoadForColor(blueAndRedMoreTriangles, Color.Blue)).toBe(4)

        expect(longestRoadForColor(yellowHasLongestRoadBoard, Color.Yellow)).toBe(5)

        expect(longestRoadForColor(yellowHasLongestRoad2Board, Color.Yellow)).toBe(5)

        expect(longestRoadForColor(yellowHasLongestRoadWithCycle, Color.Yellow)).toBe(6)

        expect(longestRoadForColor(yellowHasLongerThanGreen, Color.Yellow)).toBe(6)
        expect(longestRoadForColor(yellowHasLongerThanGreen, Color.Green)).toBe(5)
        
        expect(longestRoadForColor(yellowAndGreenSameLength, Color.Yellow)).toBe(6)
        expect(longestRoadForColor(yellowAndGreenSameLength, Color.Green)).toBe(6)
        
        expect(longestRoadForColor(yellowAndGreenSameLength2, Color.Yellow)).toBe(6)
        expect(longestRoadForColor(yellowAndGreenSameLength2, Color.Green)).toBe(6)  

        expect(longestRoadForColor(complexBlueRoad, Color.Blue)).toBe(11)
        expect(longestRoadForColor(moreComplexBlueRoad, Color.Blue)).toBe(14)
    })

    it('should recognize the longest road', () => {
        expect(colorWithLongestRoad(yellowHasLongerThanGreen, undefined)).toBe(Color.Yellow)
        
        expect(colorWithLongestRoad(yellowAndGreenSameLength, Color.Yellow)).toBe(Color.Yellow)
        expect(colorWithLongestRoad(yellowAndGreenSameLength, Color.Green)).toBe(Color.Green)
        
        expect(colorWithLongestRoad(yellowAndGreenSameLength2, Color.Yellow)).toBe(Color.Yellow)
        expect(colorWithLongestRoad(yellowAndGreenSameLength2, Color.Green)).toBe(Color.Green)        
    })

    it('should not recognize short roads', () => {
        expect(colorWithLongestRoad(blueAndRedTriangle, undefined)).toBe(undefined)
        
        expect(colorWithLongestRoad(blueAndRedMoreTriangles, undefined)).toBe(undefined)
    })
})
