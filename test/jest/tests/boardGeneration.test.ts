import { describe, expect, it, jest } from '@jest/globals'
import { allResources, availableBuildingPositions, Board, BoardSeed, clockwise, Coordinate, CoordinateTile,  defaultScenario, generateBoardFromScenario, neighborTile, Orientation, PortTile, randomBoardSeed, sameCoordinate, SpecialPorts, TileType } from 'shared'
import { Seed } from 'shared/logic/Scenario'

describe('Default board generation', () => {
    function testWithAllSeeds(tester: (seed: Seed) => void) {
        tester('random seed one')
        tester('random seed two')
        tester('random seed three')
        tester('random seed four')
        tester('random seed five')
    }

    function testWithAllBoards(test: (board: Board) => void) {
        testWithAllSeeds(seed => {
            const generatedBoard = generateBoardFromScenario(defaultScenario.board, seed)
            expect(generatedBoard).toBeDefined()
            if (generatedBoard == undefined)
                return
            test(generatedBoard)
        })
    }

    it('should generate the correct amount of available building positions', () => {
        testWithAllBoards(board => {
            const positions = availableBuildingPositions(board, undefined)
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

        return tiles.filter(x => x.type == TileType.Port)
    }

    it('should generate four general ports and five distinct resource ports', () => {
        testWithAllBoards(board => {
            const ports = getPortTiles(board)

            expect(ports.length).toBe(9)
            expect(allResources.every(res => ports.some(port => port.resource == res))).toBeTruthy()
            expect(ports.filter(x => x.resource == SpecialPorts.General).length).toBe(4)
        })
    })
})
