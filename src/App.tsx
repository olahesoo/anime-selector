import {z} from "zod";
import anime_content from "./static/anime_content.json";
import AnimeList from "./AnimeList";
import {useState} from "react";
import {Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, Tooltip, Typography} from "@mui/material";
import DiscordFormatter from "./DiscordFormatter";
import MergeSort from "./MergeSort";
import GoodEnoughSort from "./GoodEnoughSort";
import {HelpOutline} from "@mui/icons-material";
import NominationChecker from "./NominationChecker";
import {List as ImmutableList} from "immutable"

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

const anime_list = ImmutableList(AnimeContentSchema.array().parse(anime_content))

type SorterProps = {
    anime_list: ImmutableList<AnimeContent>
    set_sorted_list: (list: ImmutableList<AnimeContent>) => void
    set_is_sorted: (is_sorted: boolean) => void
}

enum Screen {
    Sorter,
    NominationChecker
}

enum SortMethod {
    Merge,
    GoodEnough
}

function App() {
    const [screen, setScreen] = useState(Screen.Sorter)
    const [animeList, setAnimeList] = useState(anime_list)
    const [isSorted, setIsSorted] = useState(true)
    const [sortMethod, setSortMethod] = useState(SortMethod.Merge)

    const sorter_props: SorterProps = {
        anime_list: animeList,
        set_sorted_list: setAnimeList,
        set_is_sorted: setIsSorted,
    }

    if (screen === Screen.NominationChecker) return <NominationChecker return_to_main={() => setScreen(Screen.Sorter)}/>

    if (isSorted) {
        return (
            <div>
                <Box sx={{display: "flex"}}>
                    <DiscordFormatter anime_list={animeList}/>
                    <Button onClick={() => setIsSorted(false)}>Sort anime</Button>
                    <FormControl>
                        <RadioGroup defaultValue={SortMethod.Merge}>
                            <FormControlLabel onChange={() => setSortMethod(SortMethod.Merge)} value={SortMethod.Merge}
                                              control={<Radio/>} label="Full sort"/>
                            <FormControlLabel onChange={() => setSortMethod(SortMethod.GoodEnough)}
                                              value={SortMethod.GoodEnough} control={<Radio/>}
                                              label={
                                                  <Box sx={{display: 'flex', flexDirection: 'row'}}>
                                                      <Typography>Good enough sort</Typography>
                                                      <Tooltip
                                                          title="Quickly sorts best and worst animes, but might need adjustment afterwards"
                                                          placement="right"
                                                      >
                                                          <HelpOutline/>
                                                      </Tooltip>
                                                  </Box>
                                              }/>
                        </RadioGroup>
                    </FormControl>
                    <Button onClick={() => setScreen(Screen.NominationChecker)}>Nominations checker</Button>
                </Box>
                <AnimeList anime_list={animeList} set_anime_list={setAnimeList}/>
            </div>
        )
    } else if (sortMethod === SortMethod.Merge) {
        return <MergeSort {...sorter_props}/>
    } else {
        return <GoodEnoughSort {...sorter_props}/>
    }
}

export default App;
export {anime_list, sample_anime_content}
export type {AnimeContent, SorterProps}