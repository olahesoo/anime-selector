import {get_discord_string} from "./DiscordFormatter";
import {AnimeContent} from "./App";

test("discord formatter", () => {
    const a: AnimeContent = {mal_id: "10", local_src: "", title: "a"}
    const b: AnimeContent = {mal_id: "20", local_src: "", title: "b"}
    const c: AnimeContent = {mal_id: "30", local_src: "", title: "c"}
    const expected_result: string = "```\na\nb\nc\n```"
    expect(get_discord_string([a, b, c])).toStrictEqual(expected_result)
})