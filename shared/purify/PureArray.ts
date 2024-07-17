import { Pure } from "./Pure"

export function mapFilter<T, R>(array: Pure<T[]>, mapper: ((item: Pure<T>) => Pure<R | undefined>)): Pure<R[]> {
    let res: Pure<R[]> = []
    for (const item of array) {
        const mapped = mapper(item)
        if (mapped != undefined)
            res = [...res, mapped]
    }
    return res
}

export function mapFind<T, R>(array: Pure<T[]>, finder: ((item: Pure<T>) => Pure<R |  undefined>)): Pure<R | undefined> {
    for (const item of array) {
        const mapped = finder(item)
        if (mapped != undefined)
            return mapped
    }
}