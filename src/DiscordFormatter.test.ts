import {get_discord_string} from "./DiscordFormatter";
import {AnimeContent, sample_anime_content} from "./App";
import {List} from "immutable";

test("discord formatter", () => {
    const a: AnimeContent = {...sample_anime_content, title: "a"}
    const b: AnimeContent = {...sample_anime_content, title: "b"}
    const c: AnimeContent = {...sample_anime_content, title: "c"}
    const expected_result: string = "```\na\nb\nc\n```"
    expect(get_discord_string(List([a, b, c]))).toStrictEqual(expected_result)
})