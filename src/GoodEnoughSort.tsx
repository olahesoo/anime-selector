import {AnimeContent, SorterProps} from "./App";
import {useState} from "react";
import AnimeList from "./AnimeList";
import {Button, LinearProgress} from "@mui/material";
import {List} from "immutable"

type GoodEnoughSortState<T> = {
    is_sorted: boolean
    list: T[]
    sort_buffer: T[]
    // Elements should be divided between buckets as evenly as possible, first buckets having more elements
    buckets: T[][]
}

function get_compared_elements<T>(state: GoodEnoughSortState<T>): T[] {
    const {is_sorted, list, sort_buffer, buckets} = state
    if (is_sorted) throw Error(`State ${JSON.stringify(state)} is already sorted`)
    if (sort_buffer.length >= list.length) throw Error(`State ${JSON.stringify(state)} should be sorted`)
    if (buckets.length * buckets[0].length >= list.length) {
        const bucket_index = sort_buffer.length / buckets[0].length
        return buckets[bucket_index]
    } else {
        const list_index = buckets.length * buckets[0].length
        return list.slice(list_index, list_index + buckets.length)
    }
}

function get_next_state<T>(state: GoodEnoughSortState<T>, comparison_results: T[]): GoodEnoughSortState<T> {
    const {is_sorted, list, sort_buffer, buckets} = state
    if (is_sorted) return state
    if (buckets.length * buckets[0].length >= list.length) {
        const bucket_index = sort_buffer.length / buckets[0].length
        const next_sort_buffer = sort_buffer.concat(comparison_results)
        if (bucket_index + 1 < buckets.length && buckets[bucket_index + 1].length > 1) {
            return {
                ...state,
                sort_buffer: next_sort_buffer
            }
        } else {
            return {
                ...state,
                is_sorted: true,
                list: sort_buffer.concat(comparison_results, buckets.slice(bucket_index + 1).flat()),
            }
        }
    } else {
        if (comparison_results.length > buckets.length) throw Error(
            `Too large result size ${JSON.stringify(comparison_results.length)} for state ${JSON.stringify(state)}, comparison results ${JSON.stringify(comparison_results)}`
        )
        const next_buckets = buckets.map((bucket, index) => bucket.concat(comparison_results[index] ? comparison_results[index] : [])) // Comparison results could have fewer elements than the number of buckets
        return {
            ...state,
            buckets: next_buckets
        }
    }
}

function GoodEnoughSort({anime_list, set_sorted_list, set_is_sorted}: SorterProps) {
    const [sort_state, set_sort_state] = useState<GoodEnoughSortState<AnimeContent>>({
        is_sorted: false,
        list: anime_list.toArray(),
        sort_buffer: [],
        buckets: Array(Math.ceil(Math.sqrt(anime_list.size))).fill([])
    })

    const [anime_list_buffer, set_anime_list_buffer] = useState<AnimeContent[]>(
        get_compared_elements(sort_state)
    )

    const [compares_count, set_compares_count] = useState(0)

    return (
        <div>
            <AnimeList anime_list={List(anime_list_buffer)}
                       set_anime_list={list => set_anime_list_buffer(list.toArray())}/>
            <Button onClick={() => {
                set_compares_count(x => x + 1)
                const next_state = get_next_state(sort_state, anime_list_buffer)
                if (next_state.is_sorted) {
                    set_sorted_list(List(next_state.list))
                    set_is_sorted(true)
                } else {
                    set_sort_state(next_state)
                    set_anime_list_buffer(get_compared_elements(next_state))
                }
            }}>Confirm</Button>
            <LinearProgress variant="determinate"
                            value={compares_count / (2 * Math.ceil(Math.sqrt(anime_list.size))) * 100}/>
        </div>
    )
}

export default GoodEnoughSort
export {get_compared_elements, get_next_state}
export type {GoodEnoughSortState}