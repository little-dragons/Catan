import type { Board, Tile } from "./Board";
import { Resource, allResources } from "./Resource";
import seedrandom from 'seedrandom'

export function defaultBoard(seed: number): Board {
    const rand = seedrandom(seed.toString())

    let resourcesStack : Resource[] = []
    for (const res of allResources)
        for (let i = 0; i < 4; i++)
            resourcesStack.push(res)

    resourcesStack.sort((a, b) => 0.5 - rand())
    resourcesStack = resourcesStack.slice(0, 18)
    const numbersForTiles = [ 5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11 ]
    let landTiles: Tile[] = []
    for (let i = 0; i < 18; i++) {
        landTiles.push({
            resource: resourcesStack[i],
            number: numbersForTiles[i]
        })
    }

    const desertLoc = Math.floor(18 * rand())
    landTiles.splice(desertLoc, 0, 'Desert')



    
    const middle: [number, number] = [3, 3]
    const map = new Map<[number, number], Tile>()
    
    return {
        columnCount: 7,
        rowCount: 7,
        map: map
    }
}