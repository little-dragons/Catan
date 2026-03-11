// import { sumDistribution } from "./Distribution";
// import { GenerationMethod, ScenarioTileGroup } from "./Scenario";

// export enum TileGroupError {
//     TileTypes,
//     Resources,
// }

// export enum TileTypesError {
//     FixedTooSmall,
//     DistributionTooSmall
// }

// export function isValidTileGroup(tg : ScenarioTileGroup): TileGroupError[] {
//     const highestTileCount = tg.coordinates.data.map(x => x.length).reduce((s , v) => s > v ? s : v, 0)

//     const suppliedTileTypesCount = 
//         tg.tileTypes.method == GenerationMethod.Fixed ? tg.tileTypes.data.length :
//         sumDistribution(tg.tileTypes.data)
    
//     if (highestTileCount > suppliedTileTypesCount)
//         return [ TileGroupError.TileTypes ]

//     const suppliedResourceCount = 
//         tg.resources.method == GenerationMethod.Fixed ? tg.resources.data.length :
//         sumDistribution(tg.resources.data)

// }