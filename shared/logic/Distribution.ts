import { type Freeze } from "structurajs"

export class EnumMap<K extends (keyof any) & number, V> {
    private internal: Map<K, V>
    constructor(entries: Record<K, V> | Map<K, V>) {
        if (entries instanceof Map) {
            this.internal = new Map(entries)
        }
        else {
            this.internal = new Map<K, V>(Object.entries(entries).map(([k, v]) => [Number(k), v]) as [K, V][])
        }
    }

    get(key: K): V {
        return this.internal.get(key)!
    }

    map<V2>(mapper: (currentValue: V, currentKey: K) => V2): EnumMap<K, V2> {
        return new EnumMap<K, V2>(new Map(Array.from(this.internal.entries()).map(([key, value]) => [key, mapper(value, key)])))
    }

    mapWithState<V2, State>(mapper: (state: State, currentValue: V, currentKey: K) => [V2, State], initial: State): [EnumMap<K, V2>, State] {
        let state = initial
        return [new EnumMap<K, V2>(new Map(Array.from(this.internal.entries()).map<[K, V2]>(([key, value]) => {
            const [newValue, nextState] = mapper(state, value, key)
            state = nextState
            return [key, newValue]
        }))), state]
    }

    fold<State>(folder: (state: State, currentValue: V, currentKey: K) => State, initial: State) {
        let state = initial
        for (const [key, value] of this.internal)
            state = folder(state, value, key)
        return state
    }

    union<K2 extends keyof any & number>(other: EnumMap<K2, V>): EnumMap<K | K2, V> {
        return new EnumMap(new Map<K2 | K, V>(            
            Array.from<[K | K2, V]>(this.internal.entries()).concat(Array.from(other.internal.entries()))
        ))
    }

    keys(): Iterator<K> {
        return this.internal.keys()
    }
    get keyCount(): number {
        return this.internal.size
    }
}


export type Distribution<T extends keyof any & number> = Freeze<EnumMap<T, number>>

// this function decreases counts for elements of the distribution
// while keeping the ratios intact
// at the end, it will have `targetCount` as the sum of its distribution
export function narrowDistribution<T extends keyof any & number>(dist: Distribution<T>, targetCount: number, rnd: () => number): Distribution<T> {
    const currentSum = dist.fold((s, v) => s + v, 0)
    if (targetCount >= currentSum)
        return dist

    // applying this ratio to the current count for each element
    // gives the expected count: however, if ratio * currentCount
    // does not give an integer, the item has to be selected by chance
    // for that, a number of items are to be randomly selected whose
    // chances are the greatest
    const ratio = targetCount / currentSum


    const [residuals, removedItemsCount] = dist.fold<[[T, number][], number]>(([residuals, remItemsCount], value, key) => {
        const newValue = value * ratio
        const definitelyRemoved = value - Math.ceil(newValue)
        const residual = newValue - Math.floor(newValue)
        return [[[key, residual], ...residuals], remItemsCount + definitelyRemoved]
    }, [[], 0])

    const leftItemsToIncreaseCount = dist.keyCount - (currentSum - targetCount - removedItemsCount)
    
    const chosen = Array.from(new Array(leftItemsToIncreaseCount).keys()).map(i => {
        const residualSum = residuals.reduce((s, [_, v]) => s + v, 0)
        let r = rnd() * residualSum
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

    return dist.map((val, key) => {
        return Math.floor(val * ratio) + (chosen.includes(key) ? 1 : 0)
    })
}
