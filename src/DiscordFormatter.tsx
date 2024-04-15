import {AnimeContent} from "./App";
import {Button} from "@mui/material";
import {List} from "immutable";

function get_discord_string(anime_list: List<AnimeContent>): string {
    const anime_string = anime_list.map(anime => anime.title).join("\n")
    return "```\n" + anime_string + "\n```"
}

type DiscordFormatterProps = {
    anime_list: List<AnimeContent>
}

function DiscordFormatter({anime_list}: DiscordFormatterProps) {
    return <Button onClick={() => navigator.clipboard.writeText(get_discord_string(anime_list))}>Copy Discord string to
        clipboard</Button>
}

export default DiscordFormatter
export {get_discord_string}