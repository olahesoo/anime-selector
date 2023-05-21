import {List, Set} from "immutable"
import {useState} from "react";
import Comparer from "./Comparer";
import {AnimeContent} from "./App";
import {LinearProgress} from "@mui/material";

/*
Comparing uses a directed graph, x is bigger than y if path exists from x to y.

Functions use immutable-js lists for edges to manage equality and set management, replace
with equality-supporting size 2 tuples when they're available in Typescript
*/

function has_path(from: string, to: string, edges: Set<List<string>>): boolean {
    if (edges.has(List([from, to]))) {
        return true
    }
    const direct_edges = Array.from(edges).filter(edge => edge.get(0) === from)
    for (const edge of direct_edges) {
        const next_node = edge.get(1)
        if (!next_node) {
            throw Error(`Malformed edge ${edge}`)
        }
        if (has_path(next_node, to, edges)) {
            return true
        }
    }
    return false
}

function compare(first: string, second: string, edges: Set<List<string>>): number {
    if (has_path(first, second, edges)) return 1
    if (has_path(second, first, edges)) return -1
    return 0
}

function get_comparisons(anime_list: AnimeContent[]): List<List<AnimeContent>> {
    let comparisons: List<List<AnimeContent>> = List()
    for (let i = 0; i < anime_list.length; i++) {
        for (let j = i + 1; j < anime_list.length; j++) {
            comparisons = comparisons.push(List<AnimeContent>([anime_list[i], anime_list[j]]))
        }
    }
    return comparisons
}

/** Randomizes a given list
 *
 * @param input_list - list to be randomized
 * @return new list containing the input list's elements in random order
 */
function randomize_list<T>(input_list: List<T>): List<T> {
    let output_list: List<T> = List()
    let intermediate_list = input_list
    while (!intermediate_list.isEmpty()) {
        const index = Math.ceil(Math.random() * intermediate_list.size - 1)
        const element = intermediate_list.get(index)
        if (!element) throw Error(`Failed to get element index ${index} from list ${intermediate_list}`)
        output_list = output_list.push(element)
        intermediate_list = intermediate_list.delete(index)
    }
    return output_list
}

function remove_unneeded_comparisons(edges: Set<List<string>>, comparisons: List<List<AnimeContent>>): List<List<AnimeContent>> {
    let output_comparisons = comparisons
    while (output_comparisons.size > 0) {
        // use last() to save time later getting to use pop() instead of delete(0)
        const nodes = output_comparisons.last()
        if (!nodes) throw Error(`No comparisons left in ${output_comparisons}`)
        const left = nodes.get(0)
        const right = nodes.get(1)
        if (!left || !right) throw Error(`Malformed tuple ${nodes}`)
        if (compare(left.mal_id, right.mal_id, edges) !== 0) {
            output_comparisons = output_comparisons.pop()
        } else {
            return output_comparisons
        }
    }
    return output_comparisons
}

function post_comparison_cleanup(state: AnimeSorterState): AnimeSorterState {
    const remaining_comparisons = remove_unneeded_comparisons(state.edges, state.remaining_comparisons)
    if (remaining_comparisons.size === 0) {
        const anime_list = state.anime_list.sort(
            (a, b) => compare(a.mal_id, b.mal_id, state.edges)
        ).reverse()
        state.set_sorted_list(anime_list.toArray())
        state.set_is_sorted(true)
    }
    return {
        anime_list: state.anime_list,
        edges: state.edges,
        remaining_comparisons: remaining_comparisons,
        initial_comparison_count: state.initial_comparison_count,
        set_sorted_list: state.set_sorted_list,
        set_is_sorted: state.set_is_sorted
    }
}

function update_state_add_edge(state: AnimeSorterState, edge: List<string>): AnimeSorterState {
    const edges = state.edges.add(edge)
    return {
        anime_list: state.anime_list,
        edges: edges,
        remaining_comparisons: state.remaining_comparisons,
        initial_comparison_count: state.initial_comparison_count,
        set_sorted_list: state.set_sorted_list,
        set_is_sorted: state.set_is_sorted
    }
}

type AnimeSorterProps = {
    anime_list: AnimeContent[]
    set_sorted_list: (sorted_list: AnimeContent[]) => void
    set_is_sorted: (is_sorted: boolean) => void
}

type AnimeSorterState = {
    anime_list: List<AnimeContent>
    edges: Set<List<string>>
    remaining_comparisons: List<List<AnimeContent>>
    initial_comparison_count: number
    set_sorted_list: (sorted_list: AnimeContent[]) => void
    set_is_sorted: (is_sorted: boolean) => void
}

function AnimeSorter({anime_list, set_sorted_list, set_is_sorted}: AnimeSorterProps) {
    const [internalState, setInternalState] = useState<AnimeSorterState>(
        {
            anime_list: List(anime_list),
            edges: Set(),
            remaining_comparisons: randomize_list(get_comparisons(anime_list)),
            initial_comparison_count: get_comparisons(anime_list).size,
            set_sorted_list: set_sorted_list,
            set_is_sorted: set_is_sorted
        }
    )
    const next_comparison = randomize_list(internalState.remaining_comparisons.last()!)
    const left = next_comparison.get(0)!
    const right = next_comparison.get(1)!
    return (
        <div>
            <Comparer left_choice={left} right_choice={right} choose_left={
                () => {
                    const state = update_state_add_edge(
                        internalState, List([left.mal_id, right.mal_id])
                    )
                    setInternalState(post_comparison_cleanup(state))
                }
            } choose_right={
                () => {
                    const state = update_state_add_edge(
                        internalState, List([right.mal_id, left.mal_id])
                    )
                    setInternalState(post_comparison_cleanup(state))
                }
            }/>
            <LinearProgress variant="determinate" value={
                (internalState.initial_comparison_count - internalState.remaining_comparisons.size) / internalState.initial_comparison_count * 100
            } />
        </div>
    )
}

export default AnimeSorter
export {has_path, compare, get_comparisons, randomize_list, remove_unneeded_comparisons}