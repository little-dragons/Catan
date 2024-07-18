
import { refine } from './Refine'

describe('Refine', () => {
    it("should keep objects the same if untouched", () => {
        const empty = {}
        const newEmpty = refine(empty, () => {})
        expect(empty).toBe(newEmpty)

        const complex = {
            a: {b: 3},
            c: 5
        }
        const newComplex = refine(complex, dirty => {
            dirty.c = 6
        })
        expect(newComplex.a).toBe(complex.a)
        
        const emptyArray = [] as number[]
        const result = refine(emptyArray, () => { })

        expect(emptyArray.length).toBe(0)
        expect(result.length).toBe(0)
        expect(result).toBe(emptyArray)
    })

    it("should be able to modify normal objects and keep value before the same", () => {
        const inner = { a: "test", b: "hi", printB(){ return this.b == "hi" }}

        const outer = {
            inner
        }

        const result = refine(outer, newOuter => {
            newOuter.inner.b = "world"
            newOuter.inner.printB()
        })

        expect(result.inner.b).toBe("world")
        expect(outer.inner.b).toBe("hi")
    })

    it("should be able to modify array objects and keep value before the same", () => {

        const array = [3, 4, 5]
        const outer = {
            array,
        }

        const result = refine(outer, newOuter => {
            newOuter.array[0] = 0
            newOuter.array.push(6)
        })

        expect(result.array.length).toBe(4)
        expect(outer.array.length).toBe(3)
        expect(result.array[0]).toBe(0)
        expect(outer.array[0]).toBe(3)
        expect(result.array[3]).toBe(6)
        expect(outer.array[3]).toBe(undefined)
    })

    it("should work directly on arrays", () => {
        const array = [3, 4, 5]
        const result = refine(array, dirty => dirty.push(6))
        
        expect(result.length).toBe(4)
        expect(array.length).toBe(3)
    })

    it("should work with empty arrays", () => {
        const emptyArray = [] as number[]
        const result = refine(emptyArray, dirty => {
            dirty.push(4)
            dirty.splice(0, 1)
        })


        // the reference should change
        expect(emptyArray.length).toBe(0)
        expect(result.length).toBe(0)
        expect(result).not.toBe(emptyArray)
    })

    it("should allow the array to be lessened in size", () => {
        const largeArray = [3, 4, 5, 6]
        const smaller = refine(largeArray, dirty => {
            dirty.splice(1, 2)
        })

        expect(smaller).toStrictEqual([3, 6])
        expect(largeArray).toStrictEqual([3, 4, 5, 6])
    })

    it("should allow deep array modifications", () => {
        const obj1 = { a: 3 }
        const obj2 = { b: 4 }

        const arr = [[3, 4], obj1, obj2] as [[number, number], typeof obj1, typeof obj2]
        const result = refine(arr, dirty => {
            dirty[1].a = 5
            dirty[0][1] = 5
        })

        expect(result[1].a).toBe(5)
        expect(arr[1].a).toBe(3)
        expect(result[0][1]).toBe(5)
        expect(arr[0][1]).toBe(4)
        expect(result[2]).toBe(arr[2])
    })

    it("should allow reading all keys in the lambda method correctly", () => {
        const obj = { a: "test", b: 3 }

        refine(obj, dirty => {
            expect(Reflect.ownKeys(dirty)).toStrictEqual(['a', 'b'])
            expect(Object.keys(dirty)).toStrictEqual(['a', 'b'])
            dirty.a = "other test"
            dirty.b = 5
            expect(Reflect.ownKeys(dirty)).toStrictEqual(['a', 'b'])
            expect(Object.keys(dirty)).toStrictEqual(['a', 'b'])
        })
    })
})
