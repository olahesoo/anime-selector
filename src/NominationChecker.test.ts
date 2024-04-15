import {AnimeNomination, parse_anime_nominations} from "./NominationChecker";
import {List} from "immutable"

const test_nominations: List<AnimeNomination> = List([
    {
        name: "test_anime_one",
        priority: 50,
        genres: List(["first_genre", "second_genre"])
    },
    {
        name: "test_anime_two",
        priority: -50,
        genres: List(["second_genre", "third_genre"])
    }
])

test("parse_anime_nominations", () => {
    expect(parse_anime_nominations(JSON.stringify(test_nominations))).toStrictEqual(test_nominations)
})
