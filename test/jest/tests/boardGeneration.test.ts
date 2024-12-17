import { describe, expect, it, jest } from '@jest/globals'
import { allResources, availableBuildingPositions, Board, BoardSeed, clockwise, Coordinate, CoordinateTile, defaultBoard, neighborTile, Orientation, PortTile, randomBoardSeed, sameCoordinate } from 'shared'

describe('boardGeneration', () => {
    function testWithAllSeeds(tester: (seed: BoardSeed) => void) {
        tester('random seed one')
        tester('random seed two')
        tester('random seed three')
        tester('random seed four')
        tester('random seed five')
    }

    it('should generate the correct amount of available building positions', () => {
        testWithAllSeeds(seed => {
            const generatedBoard = defaultBoard(seed)
            const positions = availableBuildingPositions(generatedBoard, undefined)
            expect(positions.length).toBe(54)
        })
    })


    function getPortTiles(board: Board): PortTile[] {
        const upperleft: Coordinate = [2, 0]
        const tiles: CoordinateTile[] = []

        let currentRot = Orientation.Right
        let currentCoord = upperleft
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 3; j++) {
                currentCoord = neighborTile(currentCoord, currentRot)
                tiles.push(board.tiles.find(x => sameCoordinate(x.coord, currentCoord))!)
            }
            currentRot = clockwise(currentRot)
        }

        return tiles.filter(x => x.type == 'port')
    }

    it('should generate four general ports and five distinct resource ports', () => {
        testWithAllSeeds(seed => {
            const board = defaultBoard(seed)
            const ports = getPortTiles(board)

            expect(ports.length).toBe(9)
            expect(allResources.every(res => ports.some(port => port.resource == res))).toBeTruthy()
            expect(ports.filter(x => x.resource == 'general').length).toBe(4)
        })
    })
})
