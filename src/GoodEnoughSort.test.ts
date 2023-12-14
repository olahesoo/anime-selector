import {GoodEnoughSortState, get_compared_elements, get_next_state} from "./GoodEnoughSort";

test("get_compared_elements", () => {
    const list = ["a", "b", "c", "d", "e"]
    const default_state: GoodEnoughSortState<string> = {
        is_sorted: false,
        list,
        sort_buffer: [],
        buckets: [[], [], []]
    }

    expect(get_compared_elements(default_state)).toStrictEqual(["a", "b", "c"])

    expect(get_compared_elements({
        ...default_state,
        buckets: [["a"], ["b"], ["c"]]
    })).toStrictEqual(["d", "e"])

    expect(get_compared_elements({
        ...default_state,
        buckets: [["a", "d"], ["b", "e"], ["c"]]
    })).toStrictEqual(["a", "d"])

    expect(get_compared_elements({
        ...default_state,
        sort_buffer: ["d", "a"],
        buckets: [["a", "d"], ["b", "e"], ["c"]]
    })).toStrictEqual(["b", "e"])

    expect(get_compared_elements({
        ...default_state,
        sort_buffer: ["d", "a", "b", "e"],
        buckets: [["a", "d"], ["b", "e"], ["c"]]
    })).toStrictEqual(["c"])
})

test("get_next_state", () => {
    const list = ["a", "b", "c", "d", "e"]
    const default_state: GoodEnoughSortState<string> = {
        is_sorted: false,
        list,
        sort_buffer: [],
        buckets: [[], [], []]
    }

    expect(get_next_state(default_state, ["b", "c", "a"])).toStrictEqual({
        ...default_state,
        buckets: [["b"], ["c"], ["a"]]
    })

    expect(get_next_state({
        ...default_state,
        buckets: [["b"], ["c"], ["a"]]
    }, ["e", "d"])).toStrictEqual({
        ...default_state,
        buckets: [["b", "e"], ["c", "d"], ["a"]]
    })

    expect(get_next_state({
        ...default_state,
        buckets: [["b", "e"], ["c", "d"], ["a"]]
    }, ["e", "b"])).toStrictEqual({
        ...default_state,
        sort_buffer: ["e", "b"],
        buckets: [["b", "e"], ["c", "d"], ["a"]]
    })

    expect(get_next_state({
        ...default_state,
        sort_buffer: ["e", "b"],
        buckets: [["b", "e"], ["c", "d"], ["a"]]
    }, ["d", "c"])).toStrictEqual({
        ...default_state,
        is_sorted: true,
        list: ["e", "b", "d", "c", "a"],
        sort_buffer: ["e", "b"],
        buckets: [["b", "e"], ["c", "d"], ["a"]]
    })
})