import { v4 } from "uuid";
import { type Board, type Tile, type Coordinate, sameCoordinate } from "./Board";
import { allOrientations, clockwise, counterclockwise, neighborTile, opposite } from "./Orientation";
import { Resource, allResources } from "./Resource";
import seedrandom from 'seedrandom'

export type BoardSeed = string
export function randomBoardSeed() {
    return v4()
}

export function defaultBoard(seed: BoardSeed): Board {
    const rand = seedrandom(seed)

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
            type: 'resource',
            resource: resourcesStack[i],
            number: numbersForTiles[i]
        })
    }

    const desertLoc = Math.floor(18 * rand())
    landTiles.splice(desertLoc, 0, { type: 'desert' })

    let oceanTiles: (Resource | 'general' | 'ocean')[] = []
    let portTiles: ('general' | Resource)[] = allResources.slice()
    for (let i = 0; i < 4; i++)
            portTiles.push('general')

    for (let i = 0; i < 9; i++) {
        oceanTiles.push(portTiles.splice(Math.floor(rand() * portTiles.length), 1)[0])
        if (i < 8 || (i == 8 && rand() > 0.5))
            oceanTiles.push('ocean')
        else if (i == 8)
            oceanTiles.unshift('ocean')
    }

    
    const tiles: [Tile, Coordinate][] = []
    function getTile(coord: Coordinate): Tile | undefined{
        const tile = tiles.find(([_, c]) => sameCoordinate(c, coord))
        if (tile == undefined)
            return undefined
        return tile[0]
    }
    // place tiles starting in the middle and choose a random starting orientation. This is the reverse of the original process.
    // set first few tiles manually
    // then place each tile and try to turn clockwise. If there is a free place, set a tile, otherwise, follow straight
    let coord: Coordinate = [3, 3]
    let orientation = allOrientations[Math.floor(rand() * allOrientations.length)]
    
    // to really understand the following part, look at the visualization of the rule set almanach
    // and consider that we follow the path in the reverse direction
    tiles.push([landTiles.pop()!, coord])
    coord = neighborTile(coord, orientation)
    tiles.push([landTiles.pop()!, coord])
    orientation = counterclockwise(opposite(orientation))
    coord = neighborTile(coord, orientation)
    tiles.push([landTiles.pop()!, coord])
    // now orientation and position contain the data to the last tile

    while (landTiles.length > 0) {
        const turnedOrientation = clockwise(orientation)
        const turnedCoord = neighborTile(coord, turnedOrientation)
        if (getTile(turnedCoord) == undefined) {
            orientation = turnedOrientation
            coord = turnedCoord
            tiles.push([landTiles.pop()!, turnedCoord])
        }
        else {
            // follow straight
            coord = neighborTile(coord, orientation)
            tiles.push([landTiles.pop()!, coord])
        }
    }

    function popWaterTile(): Tile | undefined {
        const pop = oceanTiles.pop()
        if (pop == undefined)
            return undefined
        if (pop == 'ocean')
            return { type: 'ocean' }
        
        // we have a port and need to figure out an orientation
        // a port may turned to every land tile
        const possibleOrientations = allOrientations.filter(o => {
            const neighbor = getTile(neighborTile(coord, o))
            return neighbor != undefined && neighbor.type != 'ocean'
        })

        if (possibleOrientations.length == 0) {
            console.warn(`Error in world generation: no near land tile found for port generation at ${coord}`)
            return undefined
        }

        return {
            type: 'port',
            resource: pop,
            orientation: possibleOrientations[Math.floor(rand() * possibleOrientations.length)]
        }
    }

    // the same algorithm for the ocean is considered, but the ports need an orientation
    while (oceanTiles.length > 0) {
        const turnedOrientation = clockwise(orientation)
        const turnedCoord = neighborTile(coord, turnedOrientation)
        if (getTile(turnedCoord) == undefined) {
            orientation = turnedOrientation
            coord = turnedCoord
            tiles.push([popWaterTile()!, turnedCoord])
        }
        else {
            // follow straight
            coord = neighborTile(coord, orientation)
            tiles.push([popWaterTile()!, coord])
        }
    }


    return {
        columnCount: 7,
        rowCount: 7,
        tiles: tiles,
        roads: [],
        robber: tiles.find(x => x[0].type == 'desert')![1],
        buildings: []
    }
}