import {AnimeContent} from "./App";
import {useState} from "react";
import Comparer from "./Comparer";
import {LinearProgress} from "@mui/material";

type MergeState<T> = {
    is_sorted: boolean
    list: T[]
    buffer: T[]
    window_size: number
    window_index: number
    left_index: number
    right_index: number
}

function get_compared_elements<T>(state: MergeState<T>): [T, T] {
    const {list, window_size, window_index, left_index, right_index} = state
    if (left_index > window_size - 1) throw Error(`Left index greater than window size in state ${JSON.stringify(state)}`)
    if (right_index > window_size - 1) throw Error(`Right index greater than window size in state ${JSON.stringify(state)}`)

    const window_location = 2 * window_size * window_index

    const left = list[window_location + left_index]
    if (!left) throw Error(`No element found for left side in state ${JSON.stringify(state)}`)

    const right = list[window_location + window_size + right_index]
    if (!right) throw Error(`No element found for right side in state ${JSON.stringify(state)}`)

    return [left, right]
}

function left_choice_new_state<T>(state: MergeState<T>): MergeState<T> {
    const {is_sorted, list, buffer, window_size, window_index, left_index, right_index} = state
    if (is_sorted) return state
    const next_window = left_index + 1 > window_size - 1
    const next_window_size = next_window && 2 * window_size * (window_index + 1) + window_size > list.length - 1
    const sorting_complete = next_window_size && 2 * window_size >= list.length
    return {
        is_sorted: sorting_complete,
        list: next_window ? [
            ...list.slice(0, 2 * window_size * window_index),
            ...buffer,
            list[2 * window_size * window_index + left_index],
            ...list.slice(2 * window_size * window_index + window_size + right_index)
        ] : list,
        buffer: next_window ? [] : buffer.concat(list[2 * window_size * window_index + left_index]),
        window_size: next_window_size ? 2 * window_size : window_size,
        window_index: next_window ? next_window_size ? 0 : window_index + 1 : window_index,
        left_index: next_window ? 0 : left_index + 1,
        right_index: next_window ? 0 : right_index
    }
}

function right_choice_new_state<T>(state: MergeState<T>): MergeState<T> {
    const {is_sorted, list, buffer, window_size, window_index, left_index, right_index} = state
    if (is_sorted) return state
    const next_window = right_index + 1 > window_size - 1 || 2 * window_size * window_index + window_size + right_index + 1 > list.length - 1
    const next_window_size = next_window && 2 * window_size * (window_index + 1) + window_size > list.length - 1
    const sorting_complete = next_window_size && 2 * window_size >= list.length
    return {
        is_sorted: sorting_complete,
        list: next_window ? [
            ...list.slice(0, 2 * window_size * window_index),
            ...buffer,
            list[2 * window_size * window_index + window_size + right_index],
            ...list.slice(2 * window_size * window_index + left_index, 2 * window_size * window_index + window_size),
            ...list.slice(2 * window_size * (window_index + 1))
        ] : list,
        buffer: next_window ? [] : buffer.concat(list[2 * window_size * window_index + window_size + right_index]),
        window_size: next_window_size ? 2 * window_size : window_size,
        window_index: next_window ? next_window_size ? 0 : window_index + 1 : window_index,
        left_index: next_window ? 0 : left_index,
        right_index: next_window ? 0 : right_index + 1
    }
}

function get_new_states<T>(state: MergeState<T>): [MergeState<T>, MergeState<T>] {
    return [left_choice_new_state(state), right_choice_new_state(state)]
}

function convoluted_merge_sort_impl<T>(state: MergeState<T>): T[] {
    if (state.is_sorted) return state.list
    const [left, right] = get_compared_elements(state)
    if (left <= right) return convoluted_merge_sort_impl(left_choice_new_state(state))
    return convoluted_merge_sort_impl(right_choice_new_state(state))
}

function convoluted_merge_sort<T>(list: T[]) {
    return convoluted_merge_sort_impl({
        is_sorted: false,
        list,
        buffer: [],
        window_size: 1,
        window_index: 0,
        left_index: 0,
        right_index: 0
    })
}

type MergeSortProps = {
    anime_list: AnimeContent[]
    set_sorted_list: (anime_list: AnimeContent[]) => void
    set_is_sorted: (is_sorted: boolean) => void
}

function MergeSort({anime_list, set_sorted_list, set_is_sorted}: MergeSortProps) {
    const [merge_state, set_merge_state] = useState<MergeState<AnimeContent>>({
        is_sorted: false,
        list: anime_list,
        buffer: [],
        window_size: 1,
        window_index: 0,
        left_index: 0,
        right_index: 0
    })
    const [done_compares, set_done_compares] = useState(0)

    const [left_choice, right_choice] = get_compared_elements(merge_state)
    const [left_new_state, right_new_state] = get_new_states(merge_state)

    return (
        <div>
            <Comparer left_choice={left_choice}
                      right_choice={right_choice}
                      choose_left={() => {
                          set_done_compares(x => x + 1)
                          if (left_new_state.is_sorted) {
                              set_sorted_list(left_new_state.list)
                              set_is_sorted(true)
                          } else {
                              set_merge_state(left_new_state)
                          }
                      }}
                      choose_right={() => {
                          set_done_compares(x => x + 1)
                          if (right_new_state.is_sorted) {
                              set_sorted_list(right_new_state.list)
                              set_is_sorted(true)
                          } else {
                              set_merge_state(right_new_state)
                          }
                      }}/>
            <LinearProgress variant="determinate"
                            value={done_compares / (anime_list.length * Math.log(anime_list.length)) * 100}/>
        </div>
    )
}

export default MergeSort
export {get_compared_elements, left_choice_new_state, right_choice_new_state, convoluted_merge_sort}
export type {MergeState}