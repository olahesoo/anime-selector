import {z} from "zod";
import {Box, Button, IconButton, List, TextField, Typography} from "@mui/material";
import {useState} from "react";
import {get_combinations, max_cosine_similarity_sum} from "./CosineSimilarity";
import {List as ImmutableList, Map, Set} from "immutable";
import {Delete} from "@mui/icons-material";

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
    return max_cosine_similarity_sum(ImmutableList(nominations.map(n => n.genres)))
}

function get_priority_sum(nominations: Set<AnimeNomination>): number {
    return ImmutableList(nominations).map(n => n.priority).reduce((acc, p) => acc + p, 0)
}

function get_possibilities(nominations: Set<AnimeNomination>, count: number): Set<NominationSet> {
    if (nominations.size < count) return Set()
    const combinations = get_combinations(ImmutableList(nominations), count)
    return combinations.map(c => {
        return {
            nominations: c,
            max_cosine_similarity_sum: get_max_cosine_similarity_sum(c),
            priority_sum: get_priority_sum(c)
        }
    })
}

function nomination_set_comparer(first: NominationSet, second: NominationSet): -1 | 0 | 1 {
    if (first.priority_sum < second.priority_sum) return -1
    if (first.priority_sum > second.priority_sum) return 1
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

type PossibilitiesProps = {
    nominations: Set<AnimeNomination>
    count: number
    cosine_similarity_limit: number
}

function Possibilities({nominations, count, cosine_similarity_limit}: PossibilitiesProps) {
    if (nominations.size < count) return <Typography>{nominations.size} nominations is not enough to
        select {count}</Typography>
    const possibilities = get_possibilities(nominations, count)
    const allowed = possibilities.filter(p => p.max_cosine_similarity_sum <= cosine_similarity_limit)
    const disallowed = possibilities.filterNot(p => p.max_cosine_similarity_sum <= cosine_similarity_limit)
    return (
        <Box>
            <Typography>Possibilities for {count} nominations</Typography>
            <List>
                {allowed.sort(nomination_set_comparer).reverse().map(ns => <Possibility
                    nominations={ns.nominations} allowed={true} priority={ns.priority_sum}/>)}
                {disallowed.sort(nomination_set_comparer).reverse().map(ns => <Possibility
                    nominations={ns.nominations} allowed={false} priority={ns.priority_sum}/>)}
            </List>
        </Box>
    )
}

type PossibilitiesExpanderProps = {
    expanded: boolean
    set_expanded: (expanded: boolean) => void
    possibilities_props: PossibilitiesProps
}

function PossibilitiesExpander({expanded, set_expanded, possibilities_props}: PossibilitiesExpanderProps) {
    if (expanded) return <Possibilities {...possibilities_props} />
    return <Button onClick={_ => set_expanded(true)}>Expand possibilities
        for {possibilities_props.count} nominations</Button>
}

const none_expanded = Map([
    [3, false],
    [4, false],
    [5, false],
    [6, false]
])

type NominationCheckerProps = {
    return_to_main: () => void
}

function NominationChecker({return_to_main}: NominationCheckerProps) {
    const [nominations, set_nominations] = useState(ImmutableList<AnimeNomination>())
    const [expanded_possibilities, set_expanded_possibilities] = useState(Map(none_expanded))
    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
        }}>
            <Button onClick={return_to_main}>Return to main app</Button>
            <NominationsImport set_anime_nominations={n => {
                set_expanded_possibilities(none_expanded)
                set_nominations(n)
            }}/>
            <List>
                {nominations.map((nomination, index) =>
                    <NominationInput nomination={nomination}
                                     set_anime_nomination={(next_nomination: AnimeNomination) => {
                                         set_expanded_possibilities(none_expanded)
                                         set_nominations(nominations.set(index, next_nomination))
                                     }}
                                     delete_self={() => {
                                         set_expanded_possibilities(none_expanded)
                                         set_nominations(nominations.delete(index))
                                     }}
                                     key={index}/>
                )}
            </List>
            <Button onClick={_ => {
                set_expanded_possibilities(none_expanded)
                set_nominations(nominations.push({name: "", priority: 0, genres: ImmutableList()}))
            }}>Add nomination</Button>
            <NominationExporter nominations={nominations}/>
            <PossibilitiesExpander expanded={expanded_possibilities.get(3, false)}
                                   set_expanded={e => set_expanded_possibilities(expanded_possibilities.set(3, e))}
                                   possibilities_props={{
                                       nominations: Set(nominations),
                                       count: 3,
                                       cosine_similarity_limit: 1
                                   }}/>
            <PossibilitiesExpander expanded={expanded_possibilities.get(4, false)}
                                   set_expanded={e => set_expanded_possibilities(expanded_possibilities.set(4, e))}
                                   possibilities_props={{
                                       nominations: Set(nominations),
                                       count: 4,
                                       cosine_similarity_limit: 4 / 3
                                   }}/>
            <PossibilitiesExpander expanded={expanded_possibilities.get(5, false)}
                                   set_expanded={e => set_expanded_possibilities(expanded_possibilities.set(5, e))}
                                   possibilities_props={{
                                       nominations: Set(nominations),
                                       count: 5,
                                       cosine_similarity_limit: 5 / 3
                                   }}/>
            <PossibilitiesExpander expanded={expanded_possibilities.get(6, false)}
                                   set_expanded={e => set_expanded_possibilities(expanded_possibilities.set(6, e))}
                                   possibilities_props={{
                                       nominations: Set(nominations),
                                       count: 6,
                                       cosine_similarity_limit: 6 / 3
                                   }}/>
        </Box>
    )
}

type NominationExporterProps = {
    nominations: ImmutableList<AnimeNomination>
}

function NominationExporter({nominations}: NominationExporterProps) {
    return <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(nominations))}>Export
        nominations to clipboard</Button>
}

export default NominationChecker
export {parse_anime_nominations, get_priority_sum}
export type {AnimeNomination}