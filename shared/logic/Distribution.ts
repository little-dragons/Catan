/**
 * Only use this with enums backed by numbers.
 */
export type Distribution<T extends keyof any> = Readonly<Record<T, number>>

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

export function foldRecord<Keys extends keyof any, X, T>(dist: Readonly<Record<Keys, X>>, folder: (state: T, pair: [Keys , X]) => T, initial: T): T {
    const keys = Object.keys(dist).map(Number) as (keyof Distribution<Keys>)[]
    return keys.reduce<T>((s, key) => folder(s, [key, dist[key]]), initial)
}
export function mapRecord<Keys extends keyof any, X, T>(dist: Readonly<Record<Keys, X>>, mapper: (pair: [Keys , X]) => T): Readonly<Record<Keys, T>> {
    const keys = Object.keys(dist) as (keyof Distribution<Keys>)[]
    return Object.fromEntries(keys.map(key => [key, mapper([key, dist[key]])])) as Readonly<Record<Keys, T>>
}
export function sumbyRecord<Keys extends keyof any, X>(dist: Readonly<Record<Keys, X>>, by: (pair: [Keys , X]) => number): number {
    return foldRecord(dist, (s, val) => s + by(val), 0)
}
export function downcastRecord<Keys extends keyof any, X>(dist: Readonly<Record<Keys, X>>, keys: readonly Keys[]): Readonly<Record<Keys, X>> {
    return Object.fromEntries(keys.map(key => [key, dist[key]])) as Readonly<Record<Keys, X>>
}

export function sumDistribution<Keys extends keyof any>(dist: Distribution<Keys>): number {
    return sumbyRecord(dist, ([_ , v]) => v)
}

export function addDistribution<Keys extends keyof any>(dist1: Distribution<Keys>, dist2: Distribution<Keys>): Distribution<Keys> {
    const keys = Object.keys(dist1).map(Number) as (keyof Distribution<Keys>)[]
    return Object.fromEntries<number>(keys.map(key => [key, dist1[key] + dist2[key]])) as Distribution<Keys>
}

export function countbyRecord<Keys extends keyof any, X>(dist: Readonly<Record<Keys, X>>, pred: ((x: X) => boolean)): number {
    return foldRecord(dist, (s, [_, v]) => pred(v) ? s + 1 : s, 0)
}
export function popcountDistribution<Keys extends keyof any>(dist: Distribution<Keys>): number {
    return countbyRecord(dist, val => val != 0)
}


export function setRecord<Keys extends keyof any, X>(dist: Readonly<Record<Keys, X>>, key: Keys, value: X): Readonly<Record<Keys, X>> {
    return {
        ...dist,
        [key]: value
    }
}