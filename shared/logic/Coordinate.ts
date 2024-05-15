export type Coordinate = [number, number]

export class CoordinateMap<Value> {
    private backing: Map<number, Value> = new Map<number, Value>()

    private compress(coordiante: Coordinate): number {
        const higherOrder = coordiante[1] << 16
        return higherOrder | coordiante[0]
    }
    private decompress(key: number): Coordinate {
        const higher = key >> 16
        const lower = key & 0xFFFF
        return [lower, higher]
    }

    set(key: Coordinate, value: Value) {
        this.backing.set(this.compress(key), value)
    }
    get(key: Coordinate): Value | undefined {
        return this.backing.get(this.compress(key))
    }
}