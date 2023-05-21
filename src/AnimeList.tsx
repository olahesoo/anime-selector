import {Avatar, List, ListItem, ListItemAvatar} from "@mui/material";
import {AnimeContent, anime_list} from "./App";


type AnimeListElementProps = {
    anime_content: AnimeContent
}
function AnimeListElement({anime_content}: AnimeListElementProps) {
    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar src={anime_content.local_src} variant="square" />
            </ListItemAvatar>
            {anime_content.title}
        </ListItem>
    )
}

type AnimeListProps = {
    anime_list: AnimeContent[]
}

function AnimeList({anime_list}: AnimeListProps) {
    return (
        <List>
            {anime_list.map(content => <AnimeListElement key={content.mal_id} anime_content={content} />)}
        </List>
    )
}

function SampleAnimeList() {
    return <AnimeList anime_list={anime_list} />
}

export default AnimeList
export {SampleAnimeList}
