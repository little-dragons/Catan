/**
 * This distribution type is supposed to be supplied an enum: then, it maps the values of 
 * the enum to a number. Note that an enum relying on strings are not supported. The current
 * solution only supports enums on numbers.
 */
export type Distribution<T extends keyof any> = {
    readonly [P in T as Extract<P, number>]: number
}

// this function decreases counts for elements of the distribution
// while keeping the ratios intact
// at the end, it will have `targetCount` as the sum of its distribution
export function narrowDistribution<Keys extends keyof any>(dist: Distribution<Keys>, targetCount: number, rng: () => number): Distribution<Keys> {
    const keys = Object.keys(dist).map(Number) as (keyof Distribution<Keys>)[]
    const currentSum = keys.reduce((s, v) => s + dist[v], 0)
    if (targetCount >= currentSum)
        return dist

    // applying this ratio to the current count for each element
    // gives the expected count: however, if ratio * currentCount
    // does not give an integer, the item has to be selected by chance
    // for that, a number of items are to be randomly selected whose
    // chances are the greatest
    const ratio = targetCount / currentSum


    const [residuals, removedItemsCount] = keys.reduce<[[Keys, number][], number]>(([residuals, remItemsCount], key) => {
        const newValue = dist[key] * ratio
        const definitelyRemoved = dist[key] - Math.ceil(newValue)
        const residual = newValue - Math.floor(newValue)
        return [[[key, residual], ...residuals], remItemsCount + definitelyRemoved]
    }, [[], 0])

    const leftItemsToIncreaseCount = keys.length - (currentSum - targetCount - removedItemsCount)
    
    const chosen = Array.from(new Array(leftItemsToIncreaseCount).keys()).map(() => {
        const residualSum = residuals.reduce((s, [_, v]) => s + v, 0)
        let r = rng() * residualSum
        for (let j = 0; j < residuals.length - 1; j++) {
            const item = residuals[j]
            r -= item[1]
            if (r < 0) {
                item[1] = 0
                return item[0]
            }
        }
        residuals[residuals.length - 1][1] = 0
        return residuals[residuals.length - 1][0]
    })


    return Object.fromEntries<number>(keys.map(key => [key, Math.floor(dist[key] * ratio) + (chosen.includes(key) ? 1 : 0)])) as Distribution<Keys>
}

export function foldDistribution<Keys extends keyof any, T>(dist: Distribution<Keys>, folder: (state: T, pair: [Keys , number]) => T, initial: T): T {
    const keys = Object.keys(dist).map(Number) as (keyof Distribution<Keys>)[]
    return keys.reduce<T>((s, key) => folder(s, [key, dist[key]]), initial)
}

export function sumDistribution<Keys extends keyof any>(dist: Distribution<Keys>): number {
    return foldDistribution(dist, (s, [_ , v]) => s + v, 0)
}
