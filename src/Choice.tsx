import './Choice.css'

import {AnimeContent} from "./App";

type ChoiceProps = {
    anime_content: AnimeContent
};

function Choice({anime_content}: ChoiceProps) {
    return (
        <div className="Choice">
            <div className="AnimePoster">
                <img src={process.env.PUBLIC_URL + '/' + anime_content.local_src} alt=""/>
            </div>
            <dl>
                <dt>Title</dt>
                <dd>{anime_content.title}</dd>

                <dt>Ranking</dt>
                <dd>#{anime_content.ranking}</dd>

                <dt>Popularity</dt>
                <dd>#{anime_content.popularity}</dd>

                <dt>Length</dt>
                <dd>{anime_content.length}</dd>

                <dt>Release</dt>
                <dd>{anime_content.release}</dd>

                <dt>Source</dt>
                <dd>{anime_content.source}</dd>

                <dt>Genres</dt>
                <dd>{anime_content.genres.join(", ")}</dd>

                <dt>Tags</dt>
                <dd>{anime_content.tags.join(", ")}</dd>
            </dl>
        </div>
    )
}

export default Choice