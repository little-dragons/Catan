import { type Board, type Tile } from "./Board";
import { CoordinateMap } from "./Coordinate";
import { allOrientations, clockwise, counterclockwise, neighborTile, opposite } from "./Orientation";
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

    let oceanTiles: (Resource | 'General' | 'Ocean')[] = []
    let portTiles: ('General' | Resource)[] = allResources.slice()
    for (let i = 0; i < 4; i++)
            portTiles.push('General')

    for (let i = 0; i < 9; i++) {
        oceanTiles.push(portTiles.splice(Math.floor(rand() * portTiles.length), 1)[0])
        if (i < 8 || (i == 8 && rand() > 0.5))
            oceanTiles.push('Ocean')
        else if (i == 8)
            oceanTiles.unshift('Ocean')
    }

    
    const map = new CoordinateMap<Tile>()
    // place tiles starting in the middle and choose a random starting orientation. This is the reverse of the original process.
    // set first few tiles manually
    // then place each tile and try to turn clockwise. If there is a free place, set a tile, otherwise, follow straight
    let position: [number, number] = [3, 3]
    let orientation = allOrientations[Math.floor(rand() * allOrientations.length)]
    
    // to really understand this part, look at the visualization of the rule set almanach
    // and consider that we follow the path in the reverse direction
    map.set(position, landTiles.pop()!)
    position = neighborTile(position, orientation)
    map.set(position, landTiles.pop()!)
    orientation = counterclockwise(opposite(orientation))
    position = neighborTile(position, orientation)
    map.set(position, landTiles.pop()!)
    // now orientation and position contain the data to the last tile

    while (landTiles.length > 0) {
        const turnedOrientation = clockwise(orientation)
        const turnedPosition = neighborTile(position, turnedOrientation)
        if (map.get(turnedPosition) == undefined) {
            orientation = turnedOrientation
            position = turnedPosition
            map.set(turnedPosition, landTiles.pop()!)
        }
        else {
            // follow straight
            position = neighborTile(position, orientation)
            map.set(position, landTiles.pop()!)
        }
    }

    function popWaterTile(): Tile | undefined {
        const pop = oceanTiles.pop()
        if (pop == undefined)
            return undefined
        if (pop == 'Ocean')
            return 'Ocean'
        
        // we have a port and need to figure out an orientation
        // a port may turned to every land tile
        const landTiles = allOrientations.filter(x => map.get(neighborTile(position, x)) != undefined)
        if (landTiles.length == 0) {
            console.warn(`Error in world generation: no near land tile found for port generation at ${position}`)
            return undefined
        }        
        else
            return {
                resource: pop,
                orientation: landTiles[Math.floor(rand() * landTiles.length)]
            }
    }

    // the same algorithm for the oceans is considered, but the ports need an orientation
    while (oceanTiles.length > 0) {
        const turnedOrientation = clockwise(orientation)
        const turnedPosition = neighborTile(position, turnedOrientation)
        if (map.get(turnedPosition) == undefined) {
            orientation = turnedOrientation
            position = turnedPosition
            map.set(turnedPosition, popWaterTile()!)
        }
        else {
            // follow straight
            position = neighborTile(position, orientation)
            map.set(position, popWaterTile()!)
        }
    }

    return {
        columnCount: 7,
        rowCount: 7,
        map: map
    }
}