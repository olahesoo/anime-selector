import {List, Set} from "immutable"
import {compare, has_path, get_comparisons, remove_unneeded_comparisons} from "./AnimeSorter";
import {AnimeContent} from "./App";

test("has_path", () => {
    const edges = Set<List<string>>([
        List(["a", "b"]),
        List(["b", "c"])
    ])
    expect(has_path("a", "b", edges)).toBe(true)
    expect(has_path("a", "c", edges)).toBe(true)
    expect(has_path("c", "a", edges)).toBe(false)
})

test("compare", () => {
    const edges = Set<List<string>>([
        List(["a", "b"]),
        List(["b", "c"])
    ])
    expect(compare("a", "b", edges)).toBe(1)
    expect(compare("a", "c", edges)).toBe(1)
    expect(compare("b", "a", edges)).toBe(-1)
    expect(compare("c", "a", edges)).toBe(-1)
    expect(compare("b", "d", edges)).toBe(0)
})

test("get_comparisons", () => {
    const a: AnimeContent = {mal_id: "10", local_src: "", title: "a"}
    const b: AnimeContent = {mal_id: "20", local_src: "", title: "b"}
    const c: AnimeContent = {mal_id: "30", local_src: "", title: "c"}
    const anime_list: AnimeContent[] = [a, b, c]
    const expected_comparisons = List([
        List([a, b]),
        List([a, c]),
        List([b, c])
    ])
    const actual_comparisons = get_comparisons(anime_list)
    expect(actual_comparisons).toStrictEqual(expected_comparisons)
})

test("remove_unneeded_comparisons", () => {
    const a: AnimeContent = {mal_id: "10", local_src: "", title: "a"}
    const b: AnimeContent = {mal_id: "20", local_src: "", title: "b"}
    const c: AnimeContent = {mal_id: "30", local_src: "", title: "c"}
    const d: AnimeContent = {mal_id: "40", local_src: "", title: "d"}
    const edges = Set([
        List(["10", "20"]),
        List(["20", "30"])
    ])
    const comparisons = List([
        List([b, d]),
        List([a, b]),
        List([b, a]),
        List([a, c]),
        List([c, a])
    ])
    const expected_comparisons = List([List([b, d])])
    const actual_comparisons = remove_unneeded_comparisons(edges, comparisons)
    expect(actual_comparisons).toStrictEqual(expected_comparisons)
})