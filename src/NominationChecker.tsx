import {z} from "zod";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    IconButton,
    List,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from "@mui/material";
import {useState} from "react";
import {get_multiple_combinations, max_cosine_similarity_sum} from "./CosineSimilarity";
import {List as ImmutableList, Set} from "immutable";
import {Delete} from "@mui/icons-material";
import {range} from "lodash";

const AnimeNominationSchema = z.object({
    name: z.string(),
    priority: z.number().int().safe(),
    genres: z.string().array()
})

type AnimeNomination = {
    name: string
    priority: number
    genres: ImmutableList<string>
}

function parse_anime_nominations(nominations_str: string): ImmutableList<AnimeNomination> {
    return ImmutableList(
        AnimeNominationSchema.array().parse(JSON.parse(nominations_str)).map(n => {
            return {
                name: n.name,
                priority: n.priority,
                genres: ImmutableList(n.genres)
            }
        }))
}

type NominationsImportProps = {
    set_anime_nominations: (nominations: ImmutableList<AnimeNomination>) => void
}

function NominationsImport({set_anime_nominations}: NominationsImportProps) {
    const [nominations_str, set_nominations_str] = useState("")
    return (
        <Box sx={{
            display: "flex"
        }}>
            <TextField label="Anime nominations JSON" sx={{width: "50em"}} multiline={true} value={nominations_str}
                       onChange={event => set_nominations_str(event.target.value)}/>
            <Button onClick={() => {
                set_anime_nominations(parse_anime_nominations(nominations_str))
                set_nominations_str("")
            }}>Import nominations from JSON</Button>
        </Box>
    )
}


function parse_number(input: string): [boolean, number] {
    const parsed = parseInt(input)
    if (isNaN(parsed)) {
        return [false, 0]
    }
    return [true, parsed]
}

function parse_genres(input: string): string[] {
    return input.split(/\n/)
}

type NominationInputProps = {
    nomination: AnimeNomination
    set_anime_nomination: (nomination: AnimeNomination) => void
    delete_self: () => void
}

function NominationInput({nomination, set_anime_nomination, delete_self}: NominationInputProps) {
    const {name, priority, genres} = nomination
    const set_name = (name: string) => set_anime_nomination({...nomination, name: name})
    const set_priority = (priority: number) => set_anime_nomination({...nomination, priority: priority})
    const set_genres = (genres: string[]) => set_anime_nomination({...nomination, genres: ImmutableList(genres)})
    const [priority_error, set_priority_error] = useState(false)
    return (
        <Box>
            <IconButton onClick={_ => delete_self()}><Delete/></IconButton>
            <TextField label="Anime name" value={name} onChange={event => {
                set_name(event.target.value)
            }}/>
            <TextField label="Priority" value={priority} error={priority_error} onChange={event => {
                const [parse_successful, parsed_value] = parse_number(event.target.value)
                set_priority_error(!parse_successful)
                set_priority(parsed_value)
            }}/>
            <TextField label="Genres (one per line)" value={genres.join("\n")} multiline={true}
                       onChange={event => {
                           set_genres(parse_genres(event.target.value))
                       }}/>
        </Box>
    )
}

type NominationSet = {
    nominations: Set<AnimeNomination>
    max_cosine_similarity_sum: number
    priority_sum: number
}

function get_max_cosine_similarity_sum(nominations: Set<AnimeNomination>): number {
    return max_cosine_similarity_sum(ImmutableList(nominations).map(n => n.genres))
}

function get_priority_sum(nominations: Set<AnimeNomination>): number {
    return ImmutableList(nominations).map(n => n.priority).reduce((acc, p) => acc + p, 0)
}

function get_possibilities(nominations: Set<AnimeNomination>, min_count: number, max_count: number): Set<NominationSet> {
    if (nominations.size < min_count) return Set()
    const combinations = get_multiple_combinations(ImmutableList(nominations), ImmutableList(range(min_count, max_count + 1)))
    return combinations.map(c => {
        return {
            nominations: c,
            max_cosine_similarity_sum: get_max_cosine_similarity_sum(c),
            priority_sum: get_priority_sum(c)
        }
    })
}

function nomination_set_alphabetical(ns: NominationSet): string {
    return ImmutableList(ns.nominations.map(n => n.name)).sort().join(",")
}

function nomination_set_comparer(first: NominationSet, second: NominationSet): -1 | 0 | 1 {
    if (first.priority_sum < second.priority_sum) return -1
    if (first.priority_sum > second.priority_sum) return 1
    // Avoid equal priority nominations jumping around when in a list
    if (nomination_set_alphabetical(first) < nomination_set_alphabetical(second)) return -1
    if (nomination_set_alphabetical(first) > nomination_set_alphabetical(second)) return 1
    return 0
}

function nominations_priority_comparer(first: AnimeNomination, second: AnimeNomination): -1 | 0 | 1 {
    if (first.priority < second.priority) return -1
    if (first.priority > second.priority) return 1
    return 0
}

type PossibilityProps = {
    nominations: Set<AnimeNomination>
    allowed: boolean
    priority: number
}

function Possibility({nominations, allowed, priority}: PossibilityProps) {
    const color = allowed ? "common" : "red"
    return <Typography
        color={color}>({nominations.sort(nominations_priority_comparer).reverse().map(n => `"${n.name}"`).join(", ")});
        Priority: {priority}; Worst cosine similarity: {get_max_cosine_similarity_sum(nominations)}</Typography>
}

type MaxNominationsSelectorProps = {
    max_nominations: number,
    set_max_nominations: (max_possibilities: number) => void
}

function MaxNominationsSelector({max_nominations, set_max_nominations}: MaxNominationsSelectorProps) {
    return (
        <FormControl>
            <FormLabel id="max-nominations-selector-label">Show options with up to n nominations</FormLabel>
            <RadioGroup
                row
                aria-labelledby="max-nominations-selector-label"
                name="max-nominations-selector"
                value={max_nominations}
                onChange={(e) => set_max_nominations(parseInt(e.target.value))}
            >
                <FormControlLabel control={<Radio/>} label="3" value={3}/>
                <FormControlLabel control={<Radio/>} label="4" value={4}/>
                <FormControlLabel control={<Radio/>} label="5" value={5}/>
                <FormControlLabel control={<Radio/>} label="6" value={6}/>
            </RadioGroup>
        </FormControl>
    )
}

type PossibilitiesListProps = {
    nominations: Set<AnimeNomination>
}

function PossibilitiesList({nominations}: PossibilitiesListProps) {
    const [max_nominations, set_max_nominations] = useState(3)
    const [max_shown_count, set_max_shown_count] = useState(10)
    const [strict_shown_count, set_strict_shown_count] = useState(false)
    const possibilities = get_possibilities(nominations, strict_shown_count ? max_nominations : 3, max_nominations)
    const allowed = possibilities.filter(p => p.max_cosine_similarity_sum <= p.nominations.size / 3)
    const disallowed = possibilities.filterNot(p => p.max_cosine_similarity_sum <= p.nominations.size / 3)
    const options = ImmutableList(allowed).sort(nomination_set_comparer).reverse().concat(ImmutableList(disallowed).sort(nomination_set_comparer).reverse())
    return (
        <Box>
            <MaxNominationsSelector max_nominations={max_nominations} set_max_nominations={(max_nominations) => {
                set_max_nominations(max_nominations)
                set_max_shown_count(10)
            }}/>
            <FormGroup>
                <FormControlLabel
                    label="Show only options with exactly n nominations"
                    control={<Checkbox checked={strict_shown_count}
                                       onChange={e => set_strict_shown_count(e.target.checked)}/>}
                />
            </FormGroup>
            {
                (nominations.size < 3) ?
                    <Typography>You must have at least 3 nominations</Typography> :
                    <Box>
                        <List>
                            {options.slice(0, max_shown_count).map(
                                ns => <Possibility key={ns.nominations.map(n => n.name).join(",")}
                                                   nominations={ns.nominations}
                                                   allowed={ns.max_cosine_similarity_sum <= ns.nominations.size / 3}
                                                   priority={ns.priority_sum}/>)}
                        </List>
                        {options.size >= max_shown_count ?
                            <Button onClick={() => set_max_shown_count(count => count * 2)}>Show more
                                nominations</Button> : null}
                    </Box>
            }
        </Box>
    )
}

type NominationCheckerProps = {
    return_to_main: () => void
}

function NominationChecker({return_to_main}: NominationCheckerProps) {
    const [nominations, set_nominations] = useState(ImmutableList<AnimeNomination>())
    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
        }}>
            <Button onClick={return_to_main}>Return to main app</Button>
            <NominationsImport set_anime_nominations={n => {
                set_nominations(n)
            }}/>
            <List>
                {nominations.map((nomination, index) =>
                    <NominationInput nomination={nomination}
                                     set_anime_nomination={(next_nomination: AnimeNomination) => {
                                         set_nominations(nominations.set(index, next_nomination))
                                     }}
                                     delete_self={() => {
                                         set_nominations(nominations.delete(index))
                                     }}
                                     key={index}/>
                )}
            </List>
            <Button onClick={_ => {
                set_nominations(nominations.push({name: "", priority: 0, genres: ImmutableList()}))
            }}>Add nomination</Button>
            <NominationExporter nominations={nominations}/>
            <PossibilitiesList nominations={Set(nominations)}/>
        </Box>
    )
}

type NominationExporterProps = {
    nominations: ImmutableList<AnimeNomination>
}

function NominationExporter({nominations}: NominationExporterProps) {
    return <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(nominations))}>Export nominations to
        clipboard</Button>
}

export default NominationChecker
export {parse_anime_nominations, get_priority_sum, get_max_cosine_similarity_sum}
export type {AnimeNomination}