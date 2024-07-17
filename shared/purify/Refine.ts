import { Pure, Dirty } from "./Pure";

function proxyHandler<T extends object>(original: Pure<T>): ProxyHandler<Dirty<T>> {
    return {
        get(target, p, _) {
            if (p in target) {
                return target[p as keyof typeof target]
            }
            else if (p in original) {
                const orig = original[p as keyof Pure<T>] as any
                target[p as keyof typeof target] = orig
                return orig
            }
            else
                return undefined
        },
        set(target, p, newValue, _) {
            target[p as keyof typeof target] = newValue
            return true
        },
    }
}

function addMissing<T extends object>(original: T, target: any) {
    for (const key of Object.keys(original))
        if (key in target)
          true // TODO
        else
            target[key] = original[key as keyof typeof original]
}

export function refine<T extends object>(current: Pure<T>, refiner: (imaginary: Dirty<T>) => void): Pure<T> {
    const val = {} as Dirty<T>
    const {proxy, revoke} = Proxy.revocable(val, proxyHandler(current))
    refiner(proxy) as Pure<T>
    revoke()
    addMissing(current, val)
    return val
}