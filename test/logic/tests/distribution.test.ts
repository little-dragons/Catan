import { describe, expect, it } from 'bun:test'
import seedrandom from 'seedrandom'
import { allResources, Distribution, narrowDistribution, Resource } from 'catan-shared'

function testWithAllSeeds(lambda: (rng: () => number) => void) {
    lambda(seedrandom('seed1'))
    lambda(seedrandom('seed2'))
    lambda(seedrandom('seed3'))
    lambda(seedrandom('seed4'))
    lambda(seedrandom('seed5'))
    lambda(seedrandom('seed6'))
}

describe('Distribution', () => {
    it('should correctly reduce common tiles', () => {
        const dist: Distribution<Resource> = {
            [Resource.Brick]: 4,
            [Resource.Grain]: 4,
            [Resource.Lumber]: 4,
            [Resource.Ore]: 4,
            [Resource.Wool]: 4,
        }


        testWithAllSeeds(rng => {
            const narrowed = narrowDistribution(dist, 18, rng)
            const counted = allResources.map(x => narrowed[x])
            expect(counted.filter(x => x == 3).length).toBe(2)
            expect(counted.filter(x => x == 4).length).toBe(3)
        })
    })
})