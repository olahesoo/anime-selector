import {z} from "zod";
import anime_content from "./static/anime_content.json";
import AnimeList from "./AnimeList";
import {useState} from "react";
import {Button} from "@mui/material";
import DiscordFormatter from "./DiscordFormatter";
import MergeSort from "./MergeSort";

const AnimeContentSchema = z.object({
    mal_id: z.string(),
    local_src: z.string(),
    title: z.string()
})
type AnimeContent = z.infer<typeof AnimeContentSchema>
const anime_list = AnimeContentSchema.array().parse(anime_content)

function App() {
    const [animeList, setAnimeList] = useState(anime_list)
    const [isSorted, setIsSorted] = useState(true)
  return (
      isSorted ?
          <div>
              <DiscordFormatter anime_list={animeList}/>
              <Button onClick={() => setIsSorted(false)}>Sort anime</Button>
              <AnimeList anime_list={animeList} set_anime_list={setAnimeList}/>
          </div>
          : <div>
              <MergeSort anime_list={animeList} set_sorted_list={setAnimeList} set_is_sorted={setIsSorted}/>
          </div>
  );
}

export default App;
export {anime_list}
export type {AnimeContent}