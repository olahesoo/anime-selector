import {
    convoluted_merge_sort,
    get_compared_elements,
    left_choice_new_state,
    MergeState,
    right_choice_new_state
} from "./MergeSort";

test("get_compared_elements", () => {
    const list = ["a", "b", "c", "d", "e"]
    const state_defaults: MergeState<string> = {
        list,
        is_sorted: false,
        buffer: [],
        window_size: 1,
        window_index: 0,
        left_index: 0,
        right_index: 0
    }

    expect(get_compared_elements(state_defaults)).toStrictEqual(["a", "b"])

    expect(get_compared_elements({
        ...state_defaults,
        window_size: 2,
    })).toStrictEqual(["a", "c"])

    expect(get_compared_elements({
        ...state_defaults,
        window_size: 1,
        window_index: 1,
    })).toStrictEqual(["c", "d"])

    expect(get_compared_elements({
        ...state_defaults,
        window_size: 4,
        left_index: 2,
    })).toStrictEqual(["c", "e"])

    const error_state: MergeState<string> = {
        ...state_defaults,
        right_index: 1
    }
    expect(() => get_compared_elements(error_state)).toThrow()
})

test("left_choice_new_state", () => {
    const list = ["a", "b", "c", "d", "e"]
    const state_defaults: MergeState<string> = {
        list,
        is_sorted: false,
        buffer: [],
        window_size: 1,
        window_index: 0,
        left_index: 0,
        right_index: 0
    }

    expect(left_choice_new_state(state_defaults)).toStrictEqual({
        ...state_defaults,
        window_index: 1
    })

    expect(left_choice_new_state({
        ...state_defaults,
        window_index: 1
    })).toStrictEqual({
        ...state_defaults,
        window_size: 2
    })

    expect(left_choice_new_state({
        ...state_defaults,
        window_size: 2
    })).toStrictEqual({
        ...state_defaults,
        window_size: 2,
        buffer: ["a"],
        left_index: 1
    })

    expect(left_choice_new_state({
        ...state_defaults,
        buffer: ["c", "a"],
        window_size: 2,
        left_index: 1,
        right_index: 1
    })).toStrictEqual({
        ...state_defaults,
        list: ["c", "a", "b", "d", "e"],
        window_size: 4
    })

    expect(left_choice_new_state({
        ...state_defaults,
        buffer: ["c", "b", "a"],
        window_size: 4,
        left_index: 3,
    })).toStrictEqual({
        ...state_defaults,
        is_sorted: true,
        list: ["c", "b", "a", "d", "e"],
        window_size: 8,
    })

    expect(left_choice_new_state({
        ...state_defaults,
        list: ["a", "b", "c"],
        buffer: ["a"],
        window_size: 2,
        left_index: 1,
    })).toStrictEqual({
        ...state_defaults,
        is_sorted: true,
        list: ["a", "b", "c"],
        window_size: 4
    })
})

test("right_choice_new_state", () => {
    const list = ["a", "b", "c", "d", "e"]
    const state_defaults: MergeState<string> = {
        list,
        is_sorted: false,
        buffer: [],
        window_size: 1,
        window_index: 0,
        left_index: 0,
        right_index: 0
    }

    expect(right_choice_new_state(state_defaults)).toStrictEqual({
        ...state_defaults,
        list: ["b", "a", "c", "d", "e"],
        window_index: 1,
    })

    expect(right_choice_new_state({
        ...state_defaults,
        window_index: 1
    })).toStrictEqual({
        ...state_defaults,
        list: ["a", "b", "d", "c", "e"],
        window_size: 2
    })

    expect(right_choice_new_state({
        ...state_defaults,
        window_size: 2
    })).toStrictEqual({
        ...state_defaults,
        buffer: ["c"],
        window_size: 2,
        right_index: 1
    })

    expect(right_choice_new_state({
        ...state_defaults,
        buffer: ["c", "a"],
        window_size: 2,
        left_index: 1,
        right_index: 1
    })).toStrictEqual({
        ...state_defaults,
        list: ["c", "a", "d", "b", "e"],
        window_size: 4
    })

    expect(right_choice_new_state({
        ...state_defaults,
        buffer: ["c", "b", "a"],
        window_size: 4,
        left_index: 3,
    })).toStrictEqual({
        ...state_defaults,
        is_sorted: true,
        list: ["c", "b", "a", "e", "d"],
        window_size: 8
    })

    expect(right_choice_new_state({
        ...state_defaults,
        list: ["a", "b", "c"],
        window_size: 2
    })).toStrictEqual({
        ...state_defaults,
        is_sorted: true,
        list: ["c", "a", "b"],
        window_size: 4
    })
})

test("convoluted merge sort", () => {
    const list = [3, 2, 4, 5, 1]
    expect(convoluted_merge_sort(list)).toStrictEqual([1, 2, 3, 4, 5])
})