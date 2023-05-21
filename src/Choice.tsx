import './Choice.css'

import {AnimeContent} from "./App";

type ChoiceProps = {
    anime_content: AnimeContent
};

function Choice({anime_content}: ChoiceProps) {
    return (
        <div className="Choice">
            <img className="AnimePoster" src={anime_content.local_src} alt=""/>
            <figcaption className="Animetitle">{anime_content.title}</figcaption>
        </div>
    )
}

export default Choice