import {z} from "zod";
import anime_content from "./static/anime_content.json";
import AnimeList from "./AnimeList";
import AnimeSorter from "./AnimeSorter";
import {useState} from "react";

const AnimeContentSchema = z.object({
  mal_id: z.string(),
  local_src: z.string(),
  title: z.string()
})
type AnimeContent = z.infer<typeof AnimeContentSchema>
const anime_list = AnimeContentSchema.array().parse(anime_content)

function App() {
  const [animeList, setAnimeList] = useState(anime_list)
  const [isSorted, setIsSorted] = useState(false)
  return (
      isSorted ? <AnimeList anime_list={animeList} /> : <AnimeSorter anime_list={animeList} set_sorted_list={setAnimeList} set_is_sorted={setIsSorted} />
  );
}

export default App;
export {anime_list}
export type {AnimeContent}