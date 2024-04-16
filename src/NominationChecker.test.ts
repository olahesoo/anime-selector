import {
    AnimeNomination,
    get_max_cosine_similarity_sum,
    get_priority_sum,
    parse_anime_nominations
} from "./NominationChecker";
import {List, Set} from "immutable"

const test_anime_one = {
    name: "test_anime_one",
    priority: 50,
    genres: List.of("first_genre", "second_genre")
}

const test_anime_two = {
    name: "test_anime_two",
    priority: -50,
    genres: List.of("second_genre", "third_genre")
}

const test_anime_three = {
    name: "test_anime_three",
    priority: 50,
    genres: List.of("first_genre", "third_genre")
}

const test_anime_four = {
    name: "test_anime_four",
    priority: 0,
    genres: List.of("first_genre", "second_genre")
}

const
    test_nominations: List<AnimeNomination> = List.of(test_anime_one, test_anime_two, test_anime_three, test_anime_four)

test("calculate_cosine_similarities", () => {
    expect(get_max_cosine_similarity_sum(Set.of(test_anime_one, test_anime_four))).toBeCloseTo(1)
})

test("parse_anime_nominations", () => {
    expect(parse_anime_nominations(JSON.stringify(test_nominations))).toStrictEqual(test_nominations)
})

test("get_priority_sum", () => {
    expect(get_priority_sum(Set(test_nominations))).toStrictEqual(50)
})
