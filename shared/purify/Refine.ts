import { Pure, Dirty } from "./Pure";

type RefinableProxyOrFallback<T> = T extends object ? RefiningProxy<T> : T
type UnrefinedOrProxied<T extends object> = 
    T extends [infer Head] ? [RefinableProxyOrFallback<Head>] :
    T extends [infer Head, ...infer Tail] ? [RefinableProxyOrFallback<Head>, ...UnrefinedOrProxied<Tail>] :
    {
        [Name in keyof T]?: 
            T[Name] extends RefiningProxy<any> ? never :
            T[Name] extends object ?
                T[Name] | RefiningProxy<UnrefinedOrProxied<T[Name]>> :
                T[Name]
    }



// The purpose of this class is to expose a proxy for a Pure object whose keys are dynamically
// added. An operation on this proxy generates the same result as doing the result on the original object,
// but keeps the original object unchanged. T can be an object or array. When the operation is done,
// the value should be read using the completed() method. If the operation did not modify the value,
// original is returned.
class RefiningProxy<T extends object> {
    // Arrays and objects need slightly different handling at some few places, but not enough to justify
    // making different classes. This can change if the implementation becomes more complex.

    // Storage for the original object. Its value is only read.
    private original: Pure<T>
    private isArray: boolean

    // Stores the proxied target. Target does not contain all keys and is only an incomplete copy of original.
    private target: UnrefinedOrProxied<Dirty<T>>

    private wasSet: boolean

    // The real proxy object whose get and set methods are overridden.
    proxy: Dirty<T>

    constructor(original: Pure<T>) {
        this.original = original
        this.isArray = this.original.constructor == Array
        this.wasSet = false
        
        if (this.isArray) {
            this.target = (original as Array<any>).map(val => {
                if (isObject(val))
                    return new RefiningProxy(val)
                else
                    return val
            }) as UnrefinedOrProxied<Dirty<T>>
        }
        else {
            this.target = {}  as UnrefinedOrProxied<Dirty<T>>
        }

        const classInstance = this
        this.proxy = new Proxy(this.target, {
            get(target, p, _) {
                if (isKey(p, target)) {
                    const val = target[p] as any
                    if (val instanceof RefiningProxy)
                        return val.proxy
                    else
                        return val
                }
                else if (isKey(p, original)) {
                    const orig = original[p]
                    if (isObject(orig)) {
                        const proxy = new RefiningProxy(orig)
                        target[p as keyof typeof target] = proxy as typeof target[keyof typeof target]
                        return proxy.proxy
                    }
                    else {
                        target[p as keyof typeof target] = orig as typeof target[keyof typeof target]
                        return orig
                    }
                }
                else
                    return undefined
            },
            set(target, p, newValue, _) {
                classInstance.wasSet = true
                target[p as keyof typeof target] = newValue
                return true
            },
            ownKeys(target) {
                const duplicated =
                    Reflect.ownKeys(classInstance.original).concat(
                    Reflect.ownKeys(target))

                return duplicated.filter((val, idx) => duplicated.findIndex(x => x == val) == idx)
            },
        }) as Dirty<T>
    }

    private childrenMutated(): boolean {
        for (const key of Object.keys(this.target)) {
            const value = this.target[key as keyof typeof this.target]
            if (value instanceof RefiningProxy && value.wasMutated())
                return true
        }
        return false
    }
    private wasMutated(): boolean {
        return this.wasSet || this.childrenMutated()
    }

    completed(): Pure<T> {
        if (!this.wasMutated()) {
            return this.original
        }

        if (!this.isArray)
            for (const key of Object.keys(this.original)) {
                if (key in this.target) {
                    const value = this.target[key as keyof typeof this.target]
                    if (value instanceof RefiningProxy) {
                        this.target[key as keyof typeof this.target] = value.completed() as typeof this.target[keyof typeof this.target]
                    }
                    else {
                        continue
                    }
                }
                else
                    this.target[key as keyof typeof this.target] = this.original[key as keyof typeof this.original] as unknown as typeof this.target[keyof typeof this.target]
            }
        else
            for (const key of Object.keys(this.target) as (keyof typeof this.target)[]) {
                const value = this.target[key]
                if (value instanceof RefiningProxy)
                    this.target[key] = value.completed()
            }

        return this.target as Pure<T>
    }
}
function isKey(key: string | symbol, object: object): key is keyof typeof object {
    return key in object
}
function isObject(obj: any): obj is object {
    return typeof obj == 'object'
}

export function refine<T extends object>(current: Pure<T>, refiner: (imaginary: Dirty<T>) => void): Pure<T> {
    const completable = new RefiningProxy(current)
    refiner(completable.proxy)
    return completable.completed()
}
