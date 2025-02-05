import { describe, expect, it } from '@jest/globals'
import seedrandom from 'seedrandom'
import { allResources, EnumMap, Distribution, narrowDistribution, Resource, TileType } from 'shared'

function testWithAllSeeds(lambda: (rng: () => number) => void) {
    lambda(seedrandom('seed1'))
    lambda(seedrandom('seed2'))
    lambda(seedrandom('seed3'))
    lambda(seedrandom('seed4'))
    lambda(seedrandom('seed5'))
    lambda(seedrandom('seed6'))
}

describe('Distribution', () => {
    it('should store values correctly', () => {
        const dist: Distribution<Resource> = new EnumMap({
            [Resource.Brick]: 4,
            [Resource.Grain]: 4,
            [Resource.Lumber]: 4,
            [Resource.Ore]: 4,
            [Resource.Wool]: 4,
        })

        expect(dist.keyCount).toBe(5)
        expect(dist.get(Resource.Brick)).toBe(4)
        expect(allResources.some(x => dist.get(x) > 0)).toBeTruthy()
    })

    it('should correctly reduce common tiles', () => {
        const dist: Distribution<Resource> = new EnumMap({
            [Resource.Brick]: 4,
            [Resource.Grain]: 4,
            [Resource.Lumber]: 4,
            [Resource.Ore]: 4,
            [Resource.Wool]: 4,
        })


        testWithAllSeeds(rng => {
            const narrowed = narrowDistribution(dist, 18, rng)
            const counted = allResources.map(x => narrowed.get(x))
            expect(counted.filter(x => x == 3).length).toBe(2)
            expect(counted.filter(x => x == 4).length).toBe(3)
        })
    })
})