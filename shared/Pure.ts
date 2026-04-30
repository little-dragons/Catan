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
  : T extends Function
  ? T
  : T extends object
  ? PureObject<T>
  : T;

type UnpureObject<T> = { -readonly [K in keyof T]: Unpure<T[K]> }

export type Unpure<T> = T extends Primitive
  ? T
  : T extends [infer H] 
  ? readonly [Unpure<H>]
  : T extends [infer H, ...infer T] 
  ?  readonly [Unpure<H>, ...Unpure<T>] 
  : T extends Map<infer K, infer V>
  ? Map<Unpure<K>, Unpure<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? Map<Unpure<K>, Unpure<V>>
  : T extends Set<infer M>
  ? Set<Unpure<M>>
  : T extends ReadonlySet<infer M>
  ? Set<Unpure<M>>
  : T extends Function
  ? T
  : T extends object
  ? UnpureObject<T>
  : T;

