import {move_element} from "./AnimeList";

test("move_element", () => {
    const test_array = [1, 2, 3, 4, 5]
    expect(move_element(test_array, 2, 1)).toStrictEqual([1, 2, 4, 3, 5])
    expect(move_element(test_array, 3, -2)).toStrictEqual([1, 4, 2, 3, 5])
    expect(move_element(test_array, 2, -10)).toStrictEqual([3, 1, 2, 4, 5])
    expect(move_element(test_array, 2, 10)).toStrictEqual([1, 2, 4, 5, 3])
    expect(move_element([1, 2, 3], -5, 10)).toStrictEqual([1, 2, 3])
    expect(move_element([1, 2, 3], 5, -10)).toStrictEqual([1, 2, 3])
})