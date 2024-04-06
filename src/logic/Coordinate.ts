export type Coordiante = [number, number]

export class CoordinateMap<Value> {
    private backing: Map<number, Value> = new Map<number, Value>()

    private compress(coordiante: Coordiante): number {
        const higherOrder = coordiante[1] << 16
        return higherOrder | coordiante[0]
    }
    private decompress(key: number): Coordiante {
        const higher = key >> 16
        const lower = key & 0xFFFF
        return [lower, higher]
    }

    set(key: Coordiante, value: Value) {
        this.backing.set(this.compress(key), value)
    }
    get(key: Coordiante): Value | undefined {
        return this.backing.get(this.compress(key))
    }
}