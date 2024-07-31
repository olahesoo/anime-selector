import {List, Set} from 'immutable'
import {range} from "lodash";

function cosine_similarity(first: List<string>, second: List<string>): number {
    if (first.size == 0 || second.size == 0) {
        return 0
    }
    const first_terms = Set(first)
    const second_terms = Set(second)
    const dot_product = first_terms.intersect(second_terms).size
    return dot_product / (Math.sqrt(first_terms.size) * Math.sqrt(second_terms.size))
}

function cosine_similarity_sum(element: List<string>, others: List<List<string>>): number {
    return others.reduce((acc, other) => {
        return acc + cosine_similarity(element, other)
    }, 0)
}

function max_cosine_similarity_sum(elements: List<List<string>>): number {
    return range(0, elements.size).map(index => {
        const current_element = elements.get(index)
        if (current_element === undefined) throw Error(`List ${elements} does not have index ${index}`)
        return cosine_similarity_sum(current_element, elements.delete(index))
    }).reduce((acc, s) => Math.max(acc, s), 0)
}

function get_combinations<T>(elements: List<T>, count: number): Set<Set<T>> {
    if (count < 1 || count > elements.size) {
        throw Error(`Incorrect combinations, elements: ${elements}, count: ${count}`)
    }
    if (count == 1) return Set(elements.map(e => Set([e])))
    return range(0, elements.size).map(index => {
        return get_combinations(elements.delete(index), count - 1).map(combination_part => {
            const current_element = elements.get(index)
            if (current_element === undefined) throw Error(`List ${elements} does not have index ${index}`)
            return combination_part.add(current_element)
        })
    }).reduce((acc, s) => acc.union(s), Set())
}

function get_multiple_combinations<T>(elements: List<T>, counts: List<number>): Set<Set<T>> {
    return counts.map(c => get_combinations(elements, c)).reduce((acc, s) => acc.union(s), Set())
}

export {
    cosine_similarity,
    cosine_similarity_sum,
    get_combinations,
    get_multiple_combinations,
    max_cosine_similarity_sum
}
