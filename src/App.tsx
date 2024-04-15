import {z} from "zod";
import anime_content from "./static/anime_content.json";
import AnimeList from "./AnimeList";
import {useState} from "react";
import {Box, Button} from "@mui/material";
import DiscordFormatter from "./DiscordFormatter";
import MergeSort from "./MergeSort";
import NominationChecker from "./NominationChecker";
import {List} from "immutable";

const AnimeContentSchema = z.object({
    mal_id: z.string(),
    title: z.string(),
    ranking: z.number(),
    popularity: z.number(),
    length: z.string(),
    release: z.string(),
    source: z.string(),
    genres: z.array(z.string()),
    tags: z.array(z.string()),
    local_src: z.string(),
})
type AnimeContent = z.infer<typeof AnimeContentSchema>

const sample_anime_content: AnimeContent = {
    "mal_id": "none",
    "title": "none",
    "ranking": 0,
    "popularity": 0,
    "length": "none",
    "release": "none",
    "source": "none",
    "genres": [],
    "tags": [],
    "local_src": "none"
}

const anime_list = List(AnimeContentSchema.array().parse(anime_content))

type SorterProps = {
    anime_list: List<AnimeContent>
    set_sorted_list: (list: List<AnimeContent>) => void
    set_is_sorted: (is_sorted: boolean) => void
}

enum Screen {
    Sorter,
    NominationChecker
}

function App() {
    const [screen, setScreen] = useState(Screen.Sorter)
    const [animeList, setAnimeList] = useState(anime_list)
    const [isSorted, setIsSorted] = useState(true)

    const sorter_props: SorterProps = {
        anime_list: animeList,
        set_sorted_list: setAnimeList,
        set_is_sorted: setIsSorted,
    }

    if (screen === Screen.NominationChecker) return <NominationChecker return_to_main={() => setScreen(Screen.Sorter)}/>

    if (isSorted) {
        return (
            <Box>
                <Box sx={{display: "flex"}}>
                    <DiscordFormatter anime_list={animeList}/>
                    <Button onClick={() => setIsSorted(false)}>Sort anime</Button>
                    <Button onClick={() => setScreen(Screen.NominationChecker)}>Nominations checker</Button>
                </Box>
                <AnimeList anime_list={animeList} set_anime_list={setAnimeList}/>
            </Box>
        )
    }
    return <MergeSort {...sorter_props}/>
}

export default App;
export {anime_list, sample_anime_content}
export type {AnimeContent, SorterProps}