export type Vector = [number, number]

export function middlepoint(x: Vector, y: Vector): Vector {
    return [(x[0] + y[0]) / 2, (x[1] + y[1]) / 2]
}

export function length(v: Vector): number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1])
}

export function withLength(v: Vector, l: number): Vector {
    const len = length(v)
    if (len == 0)
        return [0, 0]
    return [v[0] * l / len, v[1] * l / len]
}

export function perpendicular(v: Vector): Vector {
    return [v[1], -v[0]]
}

export function add(...v: Vector[]): Vector {
    let x = 0
    let y = 0
    for (const arg of v) {
        x += arg[0]
        y += arg[1]
    }
    return [x, y]
}

export function opposite(v: Vector): Vector {
    return [-v[0], -v[1]]
}

export function distance(v1: Vector, v2: Vector): number {
    const x = (v1[0] - v2[0]) * (v1[0] - v2[0])
    const y = (v1[1] - v2[1]) * (v1[1] - v2[1])
    return Math.sqrt(x + y)
}