export type Pure<T> = 
    T extends [infer Head] ? readonly [Pure<Head>] :
    T extends [infer Head, ...infer Tail] ? readonly [Pure<Head>, ...Pure<Tail>] :
    T extends object ? { readonly [Key in keyof T] : Pure<T[Key]> } :
    T extends number | string | undefined | true | false | boolean ? T :
    never

export function pure<T>(val: T): Pure<T> {
    return val as Pure<T>
}
export function dirty<T>(val: T): Dirty<T> {
    return val as Dirty<T>
}

export type Dirty<T> = 
    T extends [infer Head] ? [Dirty<Head>] :
    T extends [infer Head, ...infer Tail] ? [Dirty<Head>, ...Dirty<Tail>] :
    T extends object ? { -readonly [Key in keyof T] : Dirty<T[Key]> } :
    T extends number | string | undefined | true | false | boolean ? T :
    never