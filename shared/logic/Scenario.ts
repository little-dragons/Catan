import { v4 } from "uuid"
import { Coordinate, PortResource, ResourceTileNumber, TileType } from "./Board.js"
import { DevCardType } from "./GameAction.js"
import { CardList, Resource } from "./Resource.js"
import { Distribution } from "./Distribution.js"
import { Orientation } from "./Orientation.js"
import { type Freeze } from "structurajs"

/**
 * Generally, scenario generation should be versatile. It has to combine randomness with 
 * fixed patterns. To achieve this, depending on what specifically is generated, several
 * methods are implemented.
 */
export enum GenerationMethod {
    /**
     * The value is not generated, but instead hardcoded.
     */
    Fixed,
    /**
     * The value is retrieved by indexing: For this method, a list of maps has to be
     * provided. One map is randomly chosen and the each element is looked up to get
     * the value. The same map is used for the same generation. More maps are given
     * to increase randomness.
     */
    Indexed,
    /**
     * The value is randomly generated using a distribution. The distrubition has to be 
     * provided.
     */
    Distribution,
    /**
     * A list is provided and a random value is selected.
     */
    SelectOne
}


export type SelectGeneration<T> = Freeze<{
    method: GenerationMethod.SelectOne
    data: readonly T[]
}>
export type FixedGeneration<T> = Freeze<{
    method: GenerationMethod.Fixed
    data: T
}>
export type DistributedGeneration<T extends keyof any & number> = Freeze<{
    method: GenerationMethod.Distribution
    data: Distribution<T>
}>
export type IndexedGeneration<T> = Freeze<{
    method: GenerationMethod.Indexed
    data: {
        source: readonly T[]
        indices: readonly number[][]
    }
}>

export enum ScenarioResourceNumberAssignmentMethod {
    /**
     * The selected numbers are zipped with the coordinates selected.
     * Then, the ordering of the coordinates is decisive.
     */
    Zipped,
    /**
     * Given a coordinate to start, an orientation is picked an the numbers are assigned
     * in the order the coordinates are encountered.
     */
    CirclingOut,
}

export type ResourceNumberAssignmentInfo = Freeze<({
    method: ScenarioResourceNumberAssignmentMethod.Zipped,
} | {
    method: ScenarioResourceNumberAssignmentMethod.CirclingOut,
    startCoordinate: Coordinate,
    orientations:
        | SelectGeneration<Orientation>
    turning: SelectGeneration<'cw' | 'ccw'>
}) & {
    numbers:
        | DistributedGeneration<ResourceTileNumber>
        | FixedGeneration<ResourceTileNumber[]>
        | IndexedGeneration<ResourceTileNumber>
        | SelectGeneration<ResourceTileNumber[]>
}>

export type ScenarioTileGroup = Freeze<{
    coordinates: 
        | SelectGeneration<Coordinate[]>
    tileTypes:
        | FixedGeneration<TileType[]>
        | DistributedGeneration<TileType>
    resources:
        | DistributedGeneration<Resource>
        | FixedGeneration<Resource[]>
    resourceNumberAssignment: ResourceNumberAssignmentInfo[]
    portResources: 
        | DistributedGeneration<PortResource>
        | FixedGeneration<PortResource[]>
}>


export enum ScenarioStartingPhaseType {
    WithInitialPlacing,
    DirectTurns
}

export enum ScenarioRobberPlacement {
    Fixed,
    EachDesert,
    RandomDesert
}

export type Scenario = Freeze<{
    board: {
        columnCount: number
        rowCount: number
        robber: {
            type: ScenarioRobberPlacement.RandomDesert
        }
        tileGroups: ScenarioTileGroup[]
    }
    players: {
        minAllowedCount: number
        maxAllowedCount: number
        additionalStartingHandCards: CardList
        additionalStartingDevCards: DevCardType[]
    }
    startingPhase: ScenarioStartingPhaseType.WithInitialPlacing
}>


export type Seed = string
export function randomSeed(): Seed {
    return v4()
}
