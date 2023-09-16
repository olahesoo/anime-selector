import {Avatar, List, ListItem, ListItemAvatar} from "@mui/material";
import {AnimeContent} from "./App";
import {DraggableCore} from "react-draggable"
import "./AnimeList.css"
import {useRef} from "react";
import {DragHandle} from "@mui/icons-material";


type AnimeListElementProps = {
    anime_content: AnimeContent
    change_position: (delta: number) => void
}

function AnimeListElement({anime_content, change_position}: AnimeListElementProps) {
    const nodeRef = useRef(null)
    return (
        <DraggableCore
            nodeRef={nodeRef}
            onDrag={(e, data) => {
                console.log(data)
                change_position(data.deltaY / 50)
            }}
            grid={[Number.MAX_SAFE_INTEGER, 50]}
        >
            <div ref={nodeRef}>
                <ListItem className="AnimeListItem">
                    <DragHandle />
                    <ListItemAvatar>
                        <Avatar src={process.env.PUBLIC_URL + '/' + anime_content.local_src} variant="square"/>
                    </ListItemAvatar>
                    {anime_content.title}
                </ListItem>
            </div>
        </DraggableCore>
    )
}

function move_element<T>(list: readonly T[], index: number, delta: number): T[] {
    const mutable_list_copy = [...list]
    if (index < 0 || index >= list.length) return mutable_list_copy
    let final_index = index + delta
    final_index = Math.max(final_index, 0)
    final_index = Math.min(final_index, list.length - 1)
    const element = list.at(index)
    if (!element) throw Error(`No element found in list ${list} at position ${index}`)
    mutable_list_copy.splice(index, 1)
    mutable_list_copy.splice(final_index, 0, element)
    return mutable_list_copy
}

type AnimeListProps = {
    anime_list: AnimeContent[]
    set_anime_list: (list: AnimeContent[]) => void
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
