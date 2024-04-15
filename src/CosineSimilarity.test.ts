import {
    cosine_similarity,
    cosine_similarity_sum,
    get_combinations,
    max_cosine_similarity_sum,
} from "./CosineSimilarity";
import {List, Set} from "immutable";

test("cosine_similarity", () => {
    expect(cosine_similarity(List(["a"]), List(["a"]))).toStrictEqual(1)
    expect(cosine_similarity(List(["a"]), List(["b"]))).toStrictEqual(0)
    expect(cosine_similarity(List(), List())).toStrictEqual(0)
    expect(cosine_similarity(List(["a"]), List())).toStrictEqual(0)
    expect(cosine_similarity(List(["a", "b"]), List(["a"]))).toStrictEqual(1 / Math.sqrt(2))
})

test("cosine_similarity_sum", () => {
    expect(cosine_similarity_sum(List(["a"]), List([List(["b"])]))).toStrictEqual(0)
    expect(cosine_similarity_sum(List(["a"]), List([List(["a"])]))).toStrictEqual(1)
    expect(cosine_similarity_sum(List(["a"]), List([List(["a"]), List(["b"]), List(["a", "b"])]))).toStrictEqual(1 + 1 / Math.sqrt(2))
})

test("max_cosine_similarity_sum", () => {
    expect(max_cosine_similarity_sum(List([List(["a", "b"]), List(["a", "b"]), List(["a", "b"])]))).toBeCloseTo(2)
    expect(max_cosine_similarity_sum(List([List(["a"]), List(["b"]), List(["a", "b"])]))).toBeCloseTo(2 / Math.sqrt(2))
})

test("get_combinations", () => {
    expect(get_combinations(List([1, 2, 3]), 1)).toStrictEqual(Set([Set([1]), Set([2]), Set([3])]))
    expect(get_combinations(List([1, 2, 3]), 2)).toStrictEqual(Set([Set([1, 2]), Set([1, 3]), Set([2, 3])]))
    expect(get_combinations(List([1, 2, 3]), 3)).toStrictEqual(Set([Set([1, 2, 3])]))
    expect(() => get_combinations(List([1, 2, 3]), 4)).toThrow()
})
