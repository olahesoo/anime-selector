import './Comparer.css'
import Choice from "./Choice";
import {Button, ButtonGroup} from "@mui/material";
import {ArrowBack, ArrowForward} from "@mui/icons-material";

import {AnimeContent} from "./App";

type ComparerProps = {
    left_choice: AnimeContent
    right_choice: AnimeContent
    choose_left: () => void
    choose_right: () => void
}

function Comparer({left_choice, right_choice, choose_left, choose_right}: ComparerProps) {
    return (
        <div className="Comparer">
            <div className="wyr">
                Would you rather watch...
            </div>
            <div className="ChoiceArea">
                <Choice anime_content={left_choice}/>
                <ButtonGroup variant="contained">
                    <Button className="ChoiceButton" onClick={() => choose_left()} variant="contained" color="primary"
                            startIcon={<ArrowBack/>}/>
                    <Button className="ChoiceButton" onClick={() => choose_right()} variant="contained" color="primary"
                            endIcon={<ArrowForward/>}/>
                </ButtonGroup>
                <Choice anime_content={right_choice}/>
            </div>
        </div>
    )
}

function SampleComparer() {
    return (
        <Comparer left_choice={{
            mal_id: "30",
            title: "Neon Genesis Evangelion",
            local_src: "../anime_images/30.jpg"
        }} right_choice={{
            mal_id: "650",
            title: "Gunsmith Cats",
            local_src: "../anime_images/650.jpg"
        }} choose_left={
            () => console.log("You have chosen left")
        } choose_right={
            () => console.log("You have chosen right")
        }/>
    )
}

export default Comparer
export {SampleComparer}
export type {ComparerProps}
