// for maybe out-of-date playground: https://www.typescriptlang.org/play/?#code/C4TwDgpgBACgrgJwgHgCoD4oF4oCgoFSpQQAewEAdgCYDOUA2gJaUBmECUAEhAIbUBdKAH4oSfgHtKAGxCN4SZD37ohALnyFiZCjXrM2Hbn2oAaKADorLdp1S8m0oaPHUps+YhTLq6c1YsFFHtHVSgNQiIScio6KAkAIwArCABjYBEoAG8xE3c5BgBpCDkWKABrEolWInVYLzQikoFMAF9wzQJtGL0oSjgAWwSjAB8oWmAEFgBzKDG4GghWFghqOahJuGgx1l5pWm2oBIkJaT5KTOIIwkoIADcOXFxWBfSmKSgwBowACju9tREACUgKCaEwWU6uWAiAu-2kUF49DBGFwrWer2A7wu1CYCFA4L+AOBgIAIniCRhslCkDCEHC9oj6OT8SBwWinqBIFAWZTMDgod1dHEDLZjPxnIxeWyfGFrl1osL9DYjD5-NZDHYHE5MgxpUoTH5LFZ9SFpHLBYrYvREil0pkcgBaVz5RjFUoXSogaq1cI8ils1BNEAtKDteVRHTWvqDYacMYTKaUWbzRbLW5rMabQ67faHY6nc6XDqRW4PBBPDGUN4fMAICSkEBcXg0M4INBW3q2tLAdA-CRTaYsYko9Ag2D1xvN1scZCm9AQmkQOkXSGRSLTZc-YC8BCb4DmMDmAD6QOp64vUCYNR+YCvFx3e+XZ7Xl7ftNhG13+4Yd6RFSqGouQgH1H33AQoTfdE30iCA8yvG87zKAcmCHSg9hfSCYIIVIpAmeJB2wAjUOHaRfyZADvRqUchH-FsQCw7CwOXcj-y9UDwBAoDv2XIQcBQ6ZGJgj96WIwTsIIaCJLgg4hPfZdPwWaglhWaghNaUwhIOYBtx4g9PnMW4AHcADU9i2E9MIkr8n2AVj6HYoDONAvS+L6CBTPMiA5MIESHwQLZ1M0yJ0XRKsawufhqAAWSYWhaBmDsoy7ZIez7ATSMBVBzGY4BAXoqzCFYAcoB+XDKHwr14hqAB5VL0gsL1aH7QdSKBIEhOvUqqrKXKOqYgLoAAeiGogatJGqhJk7zrNyhgvTcjL0LIqq2MAjZnJqJa9ggsKXmrLEPiQdNgk7OJu3SPtUkQJBKDy+pFAwcxjpWBBAR+JgBl4NDdxAMkA3BM8sEwO4JCYahx1Hc9CHK-D4SIrJ2n-ecoVhjIsjrBsQGe+4JEqdocBgScQAsJBQdSXgEjOIlpEPYnp2oNsypuqhgHapcToQW9ibPf9RyXUHKh+frCCi2L4pmZmEFu-T4RFgg-KgeEOVwNHEWl3g5BwBgAGZzAAFnMABWCC1dtBGoV3BBNZVtWkFoOBpAyHAXtuftkkMjy6qSbBF1LL3kgsK3NYsL5aAACx+HWOtaDrVbwwsLGkCRph+AAiR1HTE0i0462HE+T1PbTzhOziTlP08z3ITuoXP44qguK-tx22aAA

export type Pure<T> = 
    T extends (...args: any[]) => any ? T :
    T extends [infer Head] ? readonly [Pure<Head>] :
    T extends [infer Head, ...infer Tail] ? readonly [Pure<Head>, ...Pure<Tail>] :
    T extends object ? { readonly [Key in keyof T] : Pure<T[Key]> } :
    T extends number | string | undefined | bigint | boolean | null | symbol ? T :
    never

export function pure<T>(val: T): Pure<T> {
    return val as Pure<T>
}
export function dirty<T>(val: T): Dirty<T> {
    return val as Dirty<T>
}

export type Dirty<T> = 
    T extends (...args: any[]) => any ? T :
    T extends [infer Head] ? [Dirty<Head>] :
    T extends [infer Head, ...infer Tail] ? [Dirty<Head>, ...Dirty<Tail>] :
    T extends object ? { -readonly [Key in keyof T] : Dirty<T[Key]> } :
    T extends number | string | undefined | bigint | boolean | null | symbol ? T :
    never