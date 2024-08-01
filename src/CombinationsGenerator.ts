import {List, Set} from 'immutable'
import {range} from "lodash";

function move_indexes(indexes: List<number>, elements_count: number): List<number> | null {
    if (indexes.size === 0) throw Error("Indexes size is 0")
    const final_position = List(range(elements_count - indexes.size, elements_count))
    if (indexes.equals(final_position)) return null
    const arr = indexes.toArray()
    arr[indexes.size - 1] += 1
    for (const i of range(0, indexes.size)) {
        if (arr[indexes.size - i - 1] > elements_count - i - 1) {
            arr[indexes.size - i - 2] += 1
            arr[indexes.size - i - 1] = -1
        } else {
            break
        }
    }
    for (const i of range(1, indexes.size)) {
        if (arr[i] === -1) {
            arr[i] = arr[i - 1] + 1
        }
    }
    return List(arr)
}

function* combinations_generator<T>(elements: Set<T>, count: number, get_value: (element: T) => number): Generator<Set<T>> {
    if (elements.size < count) throw Error(`Not enough elements, elements: ${elements}, count: ${count}`)
    const sorted = List(elements).sortBy(e => get_value(e)).reverse()
    let indexes: List<number> | null = List(range(0, count))
    while (indexes !== null) {
        yield Set(indexes.map(i => sorted.get(i)!))
        indexes = move_indexes(indexes, elements.size)
    }
}

function try_get_next_value<T>(generator: Generator<T>): T | null {
    const {value, done} = generator.next()
    if (done) return null
    return value
}

function* generator_combiner<T>(generators: List<Generator<T>>, get_value: (element: T) => number): Generator<T> {
    if (generators.size === 1) {
        yield* generators.get(1)!
        return
    }
    let values_buffer = generators.map(g => try_get_next_value(g))
    while (values_buffer.find(v => v !== null) !== undefined) {
        const max_value_index = values_buffer
            .map((entry, index) => {
                return {index: index, entry: entry}
            })
            .filter(({entry}) => entry !== null)
            .map(({index, entry}) => {
                return {index: index, value: get_value(entry!)}
            }).maxBy(({value}) => value)?.index!
        yield values_buffer.get(max_value_index)!
        values_buffer = values_buffer.set(max_value_index, try_get_next_value(generators.get(max_value_index)!))
    }
}

export {move_indexes, combinations_generator, try_get_next_value, generator_combiner}