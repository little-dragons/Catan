import { type Board, type Coordinate, sameCoordinate, type CoordinateTile, type ResourceTileNumber, TileType, SpecialPorts, type PortTile, type LandTile, isLand, type PortResource } from "./Board";
import { type Distribution, foldRecord, narrowDistribution } from "./Distribution";
import { type FullGameState, type GamePhase, GamePhaseType, TurnPhaseType } from "./GameState";
import { allOrientations, clockwise, counterclockwise, neighborTile } from "./Orientation";
import { Color } from "./Player";
import { Resource } from "./Resource";
import seedrandom from 'seedrandom'
import { type DistributedGeneration, type IndexedGeneration, type SelectGeneration, type ScenarioTileGroup, GenerationMethod, type Scenario, type Seed, ScenarioStartingPhaseType, ScenarioRobberPlacement, ScenarioResourceNumberAssignmentMethod, type ResourceNumberAssignmentInfo } from "./Scenario";
import { type Freeze } from "structurajs";

export const defaultScenario: Scenario = {
    players: {
        minAllowedCount: 1,
        maxAllowedCount: 4,
        additionalStartingDevCards: [],
        additionalStartingHandCards: []
    },
    startingPhase: ScenarioStartingPhaseType.WithInitialPlacing,
    board: {
        robber: {
            type: ScenarioRobberPlacement.RandomDesert
        },
        tileGroups: [
            // ocean tiles - for now only with a specific set of ports: can easily be extended
            {
                coordinates: {
                    method: GenerationMethod.SelectOne,
                    data: [
                        [
                            // 9 ports
                            [2, 0],     
                            [4, 0],  
                            [5, 1],  
                            [6, 3],  
                            [5, 5],  
                            [4, 6],  
                            [2, 6],  
                            [1, 4],  
                            [1, 2],
                            // 9 oceans
                            [3, 0],
                            [5, 0],
                            [6, 2],
                            [6, 4],
                            [5, 6],
                            [3, 6],
                            [1, 5],
                            [0, 3],
                            [1, 1]
                        ]
                    ]
                },
                tileTypes: {
                    method: GenerationMethod.Fixed,
                    data: [
                        TileType.Port,
                        TileType.Port,
                        TileType.Port,
                        TileType.Port,
                        TileType.Port,
                        TileType.Port,
                        TileType.Port,
                        TileType.Port,
                        TileType.Port,
                        TileType.Ocean,
                        TileType.Ocean,
                        TileType.Ocean,
                        TileType.Ocean,
                        TileType.Ocean,
                        TileType.Ocean,
                        TileType.Ocean,
                        TileType.Ocean,
                        TileType.Ocean,
                    ]
                },
                resources: {
                    method: GenerationMethod.Fixed,
                    data: []
                },
                resourceNumberAssignment: [],
                portResources: {
                    method: GenerationMethod.Distribution,
                    data: {
                        [Resource.Ore]: 1,
                        [Resource.Brick]: 1,
                        [Resource.Wool]: 1,
                        [Resource.Grain]: 1,
                        [Resource.Lumber]: 1,
                        [SpecialPorts.General]: 4,
                    }
                }
            },
            // land tiles
            {
                coordinates: {
                    method: GenerationMethod.SelectOne,
                    data: [[
                        [4, 1],
                        [3, 1],
                        [2, 1],
                        [2, 2],
                        [1, 3],
                        [2, 4], 
                        [2, 5],
                        [3, 5],
                        [4, 5],
                        [5, 4],
                        [5, 3],
                        [5, 2],
                        [4, 2],
                        [3, 2],
                        [2, 3],
                        [3, 4],
                        [4, 4],
                        [4, 3],
                        [3, 3],
                    ]]
                },
                tileTypes: {
                    method: GenerationMethod.Distribution,
                    data: {
                        [TileType.Ocean]: 0,
                        [TileType.Port]: 0,
                        [TileType.Resource]: 18,
                        [TileType.Desert]: 1
                    }
                },
                resources: {
                    method: GenerationMethod.Distribution,
                    data: {
                        [Resource.Ore]: 4,
                        [Resource.Brick]: 4,
                        [Resource.Wool]: 4,
                        [Resource.Grain]: 4,
                        [Resource.Lumber]: 4,
                    }
                },
                resourceNumberAssignment: [{
                    method: ScenarioResourceNumberAssignmentMethod.CirclingOut,
                    orientations: {
                        method: GenerationMethod.SelectOne,
                        data: allOrientations,
                    },
                    startCoordinate: [3, 3],
                    numbers: {
                        method: GenerationMethod.Fixed,
                        data: [11, 3, 6, 5, 4, 9, 10, 8, 4, 11, 12, 9, 10, 8, 3, 6, 2, 5],
                    },
                    turning: {
                        method: GenerationMethod.SelectOne,
                        data: ['cw', 'ccw']
                    }
                }],
                portResources: {
                    method: GenerationMethod.Fixed,
                    data: []
                }
            }
        ],
    },
    devCardStacks: {
        knights: 14,
        victoryPoints: 5,
        monopoly: 2,
        roadBuilding: 2,
        yearOfPlenty: 2,
    }
}



export enum GenerationFailure {
    SourceDistributionTooSmall = 'SourceDistributionTooSmall',
    IndicesOutOfRange = 'IndicesOutOfRange',
    TooFewIndices = 'TooFewIndices',
    TooFewOptions = 'TooFewOptions'
}

function isGenerationFailure(value: any): value is GenerationFailure {
    return Object.values(GenerationFailure).includes(value)
}

/**
 * Selects elements from the given distribution, according to the provided random number generator.
 * @param dist 
 * @param target 
 * @param rng A random number generator in [0, 1)
 * @returns The selected output, if possible. The elements are already randomly shuffled according to the random number generator. 
 * Can also return errors if the distribution does not fulfill the targeted properties.
 */
function retrieveDistributedGeneration<Keys extends keyof any>(dist: DistributedGeneration<Keys>, target: number, rng: () => number) {
    const narrowed = narrowDistribution(dist.data, target, rng)
    const count = foldRecord(narrowed, (s, [_, v]) => s + v, 0)
    if (count != target)
        return GenerationFailure.SourceDistributionTooSmall

    // narrowed contains the correct items, but they have to be sorted randomly
    const items = foldRecord<Keys, number, Keys[]>(narrowed, (s, [k, v]) => 
        s.concat(new Array(v).fill(k)), [])
    return items.toSorted(() => rng() - 0.5)
}
function retrieveIndexedGeneration<T>(dist: IndexedGeneration<T>, rng: () => number) {
    const options = dist.data.indices.length
    const source = dist.data.source
    const indices = dist.data.indices[Math.floor(rng() * options)]

    if (indices.length < source.length)
        return GenerationFailure.TooFewIndices
    if (indices.slice(0, source.length).some(i => i >= source.length))
        return GenerationFailure.IndicesOutOfRange

    return source.map<Freeze<T>>((_value, i) => source[indices[i]])
}
function retrieveSelectGeneration<T>(dist: SelectGeneration<T>, rng: () => number) {
    if (dist.data.length == 0)
        return GenerationFailure.TooFewOptions
    else
        return dist.data[Math.floor(dist.data.length * rng())]
}

type TileWithoutPortOrientation = Exclude<CoordinateTile, { type: TileType.Port }> | Omit<PortTile & { coord: Coordinate }, 'orientation'>


function generateNumberAssignment(info: ResourceNumberAssignmentInfo, coordsToAssign: Coordinate[], cordsToSkip: Coordinate[], rng: () => number): [Coordinate, ResourceTileNumber][] | undefined {
    const numbers = 
        info.numbers.method == GenerationMethod.Distribution
        ? retrieveDistributedGeneration<ResourceTileNumber>(info.numbers, coordsToAssign.length, rng)
        : info.numbers.method == GenerationMethod.Indexed
        ? retrieveIndexedGeneration(info.numbers, rng)
        : info.numbers.method == GenerationMethod.SelectOne
        ? retrieveSelectGeneration(info.numbers, rng)
        : info.numbers.data

    if (isGenerationFailure(numbers))
        return undefined

    switch (info.method) {
        case ScenarioResourceNumberAssignmentMethod.Zipped:
            if (coordsToAssign.length > numbers.length)
                return undefined
        
            return coordsToAssign.map((coord, i) => [coord, numbers[i]])

        case ScenarioResourceNumberAssignmentMethod.CirclingOut:
            const rotValue = retrieveSelectGeneration(info.turning, rng)
            if (isGenerationFailure(rotValue))
                return undefined

            let rotFn
            switch (rotValue) {
                case "cw": rotFn = clockwise
                case "ccw": rotFn = counterclockwise
            }

            let initialOr = retrieveSelectGeneration(info.orientations, rng)
            if (isGenerationFailure(initialOr))
                return undefined

            let coordsRemaining = coordsToAssign.concat(cordsToSkip)
            let currentPos = info.startCoordinate
            let currentOr = initialOr
            let currentNumbers = numbers.slice()

            const moveNext = () => {
                const tryOneTurnOr = rotFn(currentOr)
                const tryOneTurnPos = neighborTile(currentPos, tryOneTurnOr)
                const tryTwoTurnOr = rotFn(rotFn(currentOr))
                const tryTwoTurnPos = neighborTile(currentPos, tryTwoTurnOr)
                if (coordsRemaining.some(coord => sameCoordinate(tryTwoTurnPos, coord))
                    && !result.some(([coord]) => sameCoordinate(coord, tryTwoTurnPos))) {
                    currentPos = tryTwoTurnPos
                    currentOr = tryTwoTurnOr
                }
                else if (coordsRemaining.some(coord => sameCoordinate(tryOneTurnPos, coord))
                    && !result.some(([coord]) => sameCoordinate(coord, tryOneTurnPos))) {
                    currentPos = tryOneTurnPos
                    currentOr = tryOneTurnOr
                }
                else {
                    // fallback to following straight
                    currentPos = neighborTile(currentPos, currentOr)
                }
            }
            const mark = () => {
                coordsRemaining = coordsRemaining.filter(x => !sameCoordinate(x, currentPos))
            }
            let result: [Coordinate, ResourceTileNumber][] = []
            const assign = () => {
                result.push([currentPos, currentNumbers.shift()!])
            }
            const isUnmarked = () => {
                return coordsRemaining.some(coord => sameCoordinate(currentPos, coord))
            }
            const isAssignable = () => {
                return coordsToAssign.some(coord => sameCoordinate(coord, currentPos))
            }

            while (isUnmarked()) {
                if (isAssignable())
                    assign()

                mark()
                moveNext()
            }
            return result            
    }
}

function generateScenarioTileGroup(tileGroup: ScenarioTileGroup, rng: () => number): TileWithoutPortOrientation[] | undefined {
    const coords = retrieveSelectGeneration(tileGroup.coordinates, rng)
    if (coords == GenerationFailure.TooFewOptions)
        return undefined

    const tileTypes = tileGroup.tileTypes.method == GenerationMethod.Distribution
        ? retrieveDistributedGeneration(tileGroup.tileTypes, coords.length, rng)
        : tileGroup.tileTypes.data

    if (isGenerationFailure(tileTypes) || coords.length != tileTypes.length)
        return undefined

    const coordsWithTypes = coords.map((coord, i) => { return { type: tileTypes[i], coord } })

    
    const desertTiles: (LandTile & { coord: Coordinate })[] = 
        coordsWithTypes.filter(({ type }) => type == TileType.Desert).map(({ coord }) => {
            return {
                type: TileType.Desert,
                coord
            }
        })

    const landTileResourceCoords = coordsWithTypes.filter(({ type }) => type == TileType.Resource).map(({ coord }) => coord)

    const landTileResources = 
        tileGroup.resources.method == GenerationMethod.Distribution
        ? retrieveDistributedGeneration<Resource>(tileGroup.resources, landTileResourceCoords.length, rng)
        : tileGroup.resources.data

    if (landTileResources === GenerationFailure.SourceDistributionTooSmall)
        return undefined


    const resourceNumberAssignment = 
        tileGroup.resourceNumberAssignment.reduce<[Coordinate, ResourceTileNumber][] | undefined>((state, rna) => {
            if (state == undefined)
                return undefined

            const numbers = generateNumberAssignment(rna, landTileResourceCoords, desertTiles.map(x => x.coord), rng)

            if (numbers == undefined)
                return undefined

            // always use the newer numbers. overwrite generated numbers for old coordinates.
            return numbers.concat(state.filter(([coord]) => !numbers.some(([coord2]) => sameCoordinate(coord, coord2))))
        }, [])

    if (resourceNumberAssignment == undefined || 
        landTileResourceCoords.some(coord => resourceNumberAssignment.findIndex(([coord2]) => sameCoordinate(coord, coord2)) < 0))
        return undefined

    const resourceLandTiles = landTileResourceCoords.map<LandTile & { coord: Coordinate }>((coord, i) => {
        return {
            type: TileType.Resource,
            number: resourceNumberAssignment.find(([coord2]) => sameCoordinate(coord, coord2))![1],
            resource: landTileResources[i],
            coord
        }
    })
    const landTiles = resourceLandTiles.concat(desertTiles)

    const portCoords = coordsWithTypes
        .filter(val => val.type == TileType.Port)
        .map(({ coord }) => coord)
    const portResources =
        tileGroup.portResources.method == GenerationMethod.Distribution
        ? retrieveDistributedGeneration<PortResource>(tileGroup.portResources, portCoords.length, rng)
        : tileGroup.portResources.data

    if (isGenerationFailure(portResources))
        return undefined

    if (portResources.length < portCoords.length)
        return undefined

    const dirtyPortTiles: TileWithoutPortOrientation[] =
        portCoords.map<Omit<PortTile & { coord: Coordinate }, 'orientation'>>((coord, i) => {
            return {
                type: TileType.Port,
                resource: portResources[i],
                coord,
            }
        })

    const oceanTiles = 
        coordsWithTypes
        .filter(({ type }) => type == TileType.Ocean)
        .map<CoordinateTile>(({ coord }) => {
            return {
                type: TileType.Ocean,
                coord
            }
        })

    return dirtyPortTiles.concat(landTiles, oceanTiles)
}

export function generateBoardFromScenario(scenarioBoard: Scenario['board'], seed: Seed): Board | undefined {
    const rng = seedrandom(seed)

    var tilesWithoutPorts: TileWithoutPortOrientation[] = []
    const generatedGroups = scenarioBoard.tileGroups.map(x => generateScenarioTileGroup(x , rng))
    for (var group of generatedGroups) {
        if (group == undefined)
            return undefined
        for (var tile of group) {
            tilesWithoutPorts = tilesWithoutPorts.filter(t => sameCoordinate(t.coord, tile.coord))
            tilesWithoutPorts.push(tile)
        }
    }

    const tilesByGroups = 
        scenarioBoard.tileGroups.reduce<TileWithoutPortOrientation[] | undefined>((s, group) => 
            s == undefined
                ? undefined
                : generateScenarioTileGroup(group, rng)?.concat(s), [])

    if (tilesByGroups == undefined)
        return undefined

    const deserts = tilesByGroups.filter(x => x.type == TileType.Desert)
    if (deserts.length == 0) 
        return undefined
    const robber = deserts[Math.floor(deserts.length * rng())].coord


    const tryCleanedPortTiles = tilesByGroups
        .filter(x => x.type == TileType.Port)
        .map<PortTile & { coord: Coordinate } | undefined>(({ coord, resource }) => {
            const possibleOrientations = 
                allOrientations
                .filter(o => {
                    const otherCoord = neighborTile(coord, o)
                    const otherTile = tilesByGroups.find(x => sameCoordinate(x.coord, otherCoord))
                    if (otherTile == undefined)
                        return false
                    return isLand(otherTile.type)
                })
            if (possibleOrientations.length == 0)
                return undefined

            return {
                type: TileType.Port,
                orientation: possibleOrientations[Math.floor(possibleOrientations.length * rng())],
                resource,
                coord
            }
        })

    const cleanPortTiles = tryCleanedPortTiles.filter(x => x != undefined)
    if (cleanPortTiles.length < tryCleanedPortTiles.length)
        // not every port has an orientation
        return undefined
    return {
        buildings: [],
        roads: [],
        robber,
        tiles: tilesByGroups.filter<CoordinateTile>(x => x.type != TileType.Port).concat(cleanPortTiles)
    }    
}


export function generateStateFromScenario(scenario: Scenario, participatingColors: Color[], currentPlayer: Color, seed: Seed): FullGameState | undefined {
    if (participatingColors.length > scenario.players.maxAllowedCount
        || participatingColors.length < scenario.players.minAllowedCount)
        return undefined

    const board = generateBoardFromScenario(scenario.board, seed)
    if (board == undefined)
        return undefined

    const phase: GamePhase = scenario.startingPhase == ScenarioStartingPhaseType.WithInitialPlacing ? {
            type: GamePhaseType.Initial,
            forward: true
        } : {
            type: GamePhaseType.Turns,
            subtype: TurnPhaseType.PreDiceRoll
        }

    return {
        board: board,
        devCards: scenario.devCardStacks,
        longestRoad: undefined, // TODO
        knightForce: undefined,
        currentPlayer: currentPlayer,
        phase: phase,
        players: participatingColors.map(col => {return {
            color: col,
            devCards: scenario.players.additionalStartingDevCards.slice(),
            handCards: scenario.players.additionalStartingHandCards.slice(),
            knightsPlayed: 0
        }})
    }
}
