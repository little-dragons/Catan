// Strongly inspired by structura.js, but due to bugs, a custom implementation is made
// https://github.com/giusepperaso/structura.js

type Primitive = number | string | undefined | bigint | boolean | null | symbol

type PureObject<T> = { readonly [K in keyof T]: Pure<T[K]> }

export type Pure<T> = T extends Primitive
  ? T
  : T extends [infer H] 
  ? readonly [Pure<H>]
  : T extends [infer H, ...infer T] 
  ?  readonly [Pure<H>, ...Pure<T>] 
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<Pure<K>, Pure<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<Pure<K>, Pure<V>>
  : T extends Set<infer M>
  ? ReadonlySet<Pure<M>>
  : T extends ReadonlySet<infer M>
  ? ReadonlySet<Pure<M>>
  : T extends () => unknown
  ? T
  : T extends object
  ? PureObject<T>
  : T;
