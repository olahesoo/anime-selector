import {Avatar, List, ListItem, ListItemAvatar} from "@mui/material";
import {AnimeContent} from "./App";
import {DraggableCore} from "react-draggable"
import "./AnimeList.css"
import {useRef} from "react";
import {DragHandle} from "@mui/icons-material";
import {List as ImmutableList} from "immutable"


type AnimeListElementProps = {
    anime_content: AnimeContent
    change_position: (delta: number) => void
}

function AnimeListElement({anime_content, change_position}: AnimeListElementProps) {
    const nodeRef = useRef(null)
    return (
        <DraggableCore
            nodeRef={nodeRef}
            onDrag={(_, data) => {
                console.log(data)
                change_position(data.deltaY / 50)
            }}
            grid={[Number.MAX_SAFE_INTEGER, 50]}
        >
            <div ref={nodeRef}>
                <ListItem className="AnimeListItem">
                    <DragHandle/>
                    <ListItemAvatar>
                        <Avatar className="AnimeListAvatar" src={process.env.PUBLIC_URL + '/' + anime_content.local_src}
                                variant="square"/>
                    </ListItemAvatar>
                    {anime_content.title}
                </ListItem>
            </div>
        </DraggableCore>
    )
}

function move_element<T>(list: ImmutableList<T>, index: number, delta: number): ImmutableList<T> {
    if (index < 0 || index >= list.size) return list
    let final_index = index + delta
    final_index = Math.max(final_index, 0)
    final_index = Math.min(final_index, list.size - 1)
    const element = list.get(index)
    if (!element) throw Error(`No element found in list ${list} at position ${index}`)
    return list.delete(index).insert(final_index, element)
}

type AnimeListProps = {
    anime_list: ImmutableList<AnimeContent>
    set_anime_list: (list: ImmutableList<AnimeContent>) => void
}

function AnimeList({anime_list, set_anime_list}: AnimeListProps) {
    return (
        <List>
            {anime_list.map((content, index) =>
                <AnimeListElement
                    key={content.mal_id}
                    anime_content={content}
                    change_position={delta =>
                        set_anime_list(move_element(anime_list, index, delta))
                    }
                />
            )}
        </List>
    )
}

export default AnimeList
export {move_element}
