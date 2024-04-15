import {move_element} from "./AnimeList";
import {List} from "immutable"

test("move_element", () => {
    const test_array = List([1, 2, 3, 4, 5])
    expect(move_element(test_array, 2, 1)).toStrictEqual(List([1, 2, 4, 3, 5]))
    expect(move_element(test_array, 3, -2)).toStrictEqual(List([1, 4, 2, 3, 5]))
    expect(move_element(test_array, 2, -10)).toStrictEqual(List([3, 1, 2, 4, 5]))
    expect(move_element(test_array, 2, 10)).toStrictEqual(List([1, 2, 4, 5, 3]))
    expect(move_element(List([1, 2, 3]), -5, 10)).toStrictEqual(List([1, 2, 3]))
    expect(move_element(List([1, 2, 3]), 5, -10)).toStrictEqual(List([1, 2, 3]))
})