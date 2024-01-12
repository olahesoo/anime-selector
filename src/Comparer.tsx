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
                <div className="LeftChoiceArea">
                    <Choice anime_content={left_choice}/>
                </div>
                <ButtonGroup className="ChoiceButtonGroup" variant="contained">
                    <Button className="ChoiceButton" onClick={() => choose_left()} variant="contained" color="primary"
                            startIcon={<ArrowBack/>}/>
                    <Button className="ChoiceButton" onClick={() => choose_right()} variant="contained" color="primary"
                            endIcon={<ArrowForward/>}/>
                </ButtonGroup>
                <div className="RightChoiceArea">
                    <Choice anime_content={right_choice}/>
                </div>
            </div>
        </div>
    )
}

export default Comparer
export type {ComparerProps}
