import {combinations_generator, generator_combiner, move_indexes, try_get_next_value} from "./CombinationsGenerator";
import {range} from "lodash";
import {List, Set} from 'immutable'

const test_cycle_2_4 = List.of(
    List.of(0, 1),
    List.of(0, 2),
    List.of(0, 3),
    List.of(1, 2),
    List.of(1, 3),
    List.of(2, 3)
)

const test_cycle_3_5 = List.of(
    List.of(0, 1, 2),
    List.of(0, 1, 3),
    List.of(0, 1, 4),
    List.of(0, 2, 3),
    List.of(0, 2, 4),
    List.of(0, 3, 4),
    List.of(1, 2, 3),
    List.of(1, 2, 4),
    List.of(1, 3, 4),
    List.of(2, 3, 4)
)

test("move_indexes", () => {
    for (const i of range(0, test_cycle_3_5.size - 2)) {
        expect(move_indexes(test_cycle_3_5.get(i)!, 5)).toStrictEqual(test_cycle_3_5.get(i + 1))
    }
    expect(move_indexes(List.of(2, 3, 4), 5)).toStrictEqual(null)
    for (const i of range(0, test_cycle_2_4.size - 2)) {
        expect(move_indexes(test_cycle_2_4.get(i)!, 4)).toStrictEqual(test_cycle_2_4.get(i + 1)!)
    }
    expect(move_indexes(List.of(2, 3), 4)).toStrictEqual(null)
})

test("combinations_generator", () => {
    const generator = combinations_generator(Set.of(1, 2, 3, 4), 2, x => x)
    expect(generator.next()).toStrictEqual({"value": Set.of(4, 3), "done": false})
    expect(generator.next()).toStrictEqual({"value": Set.of(4, 2), "done": false})
    expect(generator.next()).toStrictEqual({"value": Set.of(4, 1), "done": false})
    expect(generator.next()).toStrictEqual({"value": Set.of(3, 2), "done": false})
    expect(generator.next()).toStrictEqual({"value": Set.of(3, 1), "done": false})
    expect(generator.next()).toStrictEqual({"value": Set.of(2, 1), "done": false})
    expect(generator.next()).toStrictEqual({"value": undefined, "done": true})
})

test("try_get_next_value", () => {
    function* my_generator() {
        yield* range(3)
    }

    const generator = my_generator()
    expect(try_get_next_value(generator)).toStrictEqual(0)
    expect(try_get_next_value(generator)).toStrictEqual(1)
    expect(try_get_next_value(generator)).toStrictEqual(2)
    expect(try_get_next_value(generator)).toStrictEqual(null)
})

test("generator_combiner", () => {
    function* my_generator_one() {
        yield* range(3, -1, -1)
    }
    function* my_generator_two() {
        yield* range(4, 1, -1)
    }

    const first_generator = my_generator_one()
    const second_generator = my_generator_two()
    const combined_generators = generator_combiner(List.of(first_generator, second_generator), (x) => x)
    expect(combined_generators.next()).toStrictEqual({"value": 4, "done": false})
    expect(combined_generators.next()).toStrictEqual({"value": 3, "done": false})
    expect(combined_generators.next()).toStrictEqual({"value": 3, "done": false})
    expect(combined_generators.next()).toStrictEqual({"value": 2, "done": false})
    expect(combined_generators.next()).toStrictEqual({"value": 2, "done": false})
    expect(combined_generators.next()).toStrictEqual({"value": 1, "done": false})
    expect(combined_generators.next()).toStrictEqual({"value": 0, "done": false})
    expect(combined_generators.next()).toStrictEqual({"value": undefined, "done": true})
})