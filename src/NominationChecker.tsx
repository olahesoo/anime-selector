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
import {max_cosine_similarity_sum} from "./CosineSimilarity";
import {combinations_generator, generator_combiner} from "./CombinationsGenerator";
import {List as ImmutableList, Set} from "immutable";
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

function get_max_cosine_similarity_sum(nominations: Set<AnimeNomination>): number {
    return max_cosine_similarity_sum(ImmutableList(nominations).map(n => n.genres))
}

function get_priority_sum(nominations: Set<AnimeNomination>): number {
    return ImmutableList(nominations).map(n => n.priority).reduce((acc, p) => acc + p, 0)
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

function create_combinations_generator(nominations: Set<AnimeNomination>): Generator<Set<AnimeNomination>> {
    return generator_combiner(ImmutableList.of(
            combinations_generator<AnimeNomination>(nominations, 3, n => n.priority),
            combinations_generator<AnimeNomination>(nominations, 4, n => n.priority),
            combinations_generator<AnimeNomination>(nominations, 5, n => n.priority),
            combinations_generator<AnimeNomination>(nominations, 6, n => n.priority)
        ),
        get_priority_sum
    )
}

type Options<T> = {
    allowed: ImmutableList<T>
    disallowed: ImmutableList<T>
}

function collect_up_to<T>(
    count: number,
    existing_options: Options<T>,
    generator: Generator<T>,
    is_allowed: (value: T) => boolean,
    is_suitable: (value: T) => boolean
): { options: Options<T>, remaining: boolean } {
    const existing_allowed_suitable = existing_options.allowed.filter(is_suitable)
    if (existing_allowed_suitable.size >= count) return {options: existing_options, remaining: true}
    let new_allowed = ImmutableList<T>()
    let new_disallowed = ImmutableList<T>()
    const remaining = count - existing_allowed_suitable.size
    let collected = 0
    let {value: next_value, done: done} = generator.next()
    while (!done) {
        if (is_allowed(next_value)) {
            new_allowed = new_allowed.push(next_value)
            if (is_suitable(next_value)) {
                collected += 1
                if (collected >= remaining) {
                    return {
                        options: {
                            allowed: existing_options.allowed.concat(new_allowed),
                            disallowed: existing_options.disallowed.concat(new_disallowed)
                        }, remaining: true
                    }
                }
            }
        } else {
            new_disallowed = new_disallowed.push(next_value)
        }
        ({value: next_value, done: done} = generator.next())
    }
    return {
        options: {
            allowed: existing_options.allowed.concat(new_allowed),
            disallowed: existing_options.disallowed.concat(new_disallowed)
        }, remaining: false
    }
}

type PossibilitiesListProps = {
    combinations_generator: Generator<Set<AnimeNomination>>
    generator_has_remaining: boolean
    set_generator_has_remaining: (b: boolean) => void
    allowed: ImmutableList<Set<AnimeNomination>>
    set_allowed: (a: ImmutableList<Set<AnimeNomination>>) => void
    disallowed: ImmutableList<Set<AnimeNomination>>
    set_disallowed: (d: ImmutableList<Set<AnimeNomination>>) => void
}

function PossibilitiesList({
                               combinations_generator,
                               generator_has_remaining,
                               set_generator_has_remaining,
                               allowed,
                               set_allowed,
                               disallowed,
                               set_disallowed
                           }: PossibilitiesListProps) {
    const [max_nominations, set_max_nominations] = useState(3)
    const [max_shown_count, set_max_shown_count] = useState(10)
    const [strict_shown_count, set_strict_shown_count] = useState(false)
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
                <Box>
                    <List>
                        {allowed
                            .filter(ns => ns.size <= max_nominations)
                            .filter(ns => !strict_shown_count || ns.size === max_nominations)
                            .map(ns => <Possibility nominations={ns} allowed={true} priority={get_priority_sum(ns)}/>
                            )
                            .concat(
                                disallowed
                                    .filter(ns => ns.size <= max_nominations)
                                    .filter(ns => !strict_shown_count || ns.size === max_nominations)
                                    .map(ns =>
                                        <Possibility nominations={ns} allowed={false}
                                                     priority={get_priority_sum(ns)}/>))
                            .slice(0, max_shown_count)
                        }
                    </List>
                    {generator_has_remaining ?
                        <Button onClick={() => {
                            const {
                                options: new_options,
                                remaining: has_remaining
                            } = collect_up_to(max_shown_count * 2, {
                                    allowed: allowed,
                                    disallowed: disallowed
                                }, combinations_generator, (ns => get_max_cosine_similarity_sum(ns) <= ns.size / 3), (ns => ns.size <= max_nominations && (!strict_shown_count || ns.size === max_nominations))
                            )
                            set_allowed(new_options.allowed)
                            set_disallowed(new_options.disallowed)
                            set_generator_has_remaining(has_remaining)
                            set_max_shown_count(c => c * 2)
                        }}>Show more
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
    const [combinations_generator, set_combinations_generator] = useState(create_combinations_generator(Set(nominations)))
    const [generator_has_remaining, set_generator_has_remaining] = useState(true)
    const [allowed, set_allowed] = useState(ImmutableList<Set<AnimeNomination>>())
    const [disallowed, set_disallowed] = useState(ImmutableList<Set<AnimeNomination>>())

    function update_nominations(n: ImmutableList<AnimeNomination>) {
        set_nominations(n)
        set_combinations_generator(create_combinations_generator(Set(n)))
        set_generator_has_remaining(true)
        set_allowed(ImmutableList<Set<AnimeNomination>>())
        set_disallowed(ImmutableList<Set<AnimeNomination>>())
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
        }}>
            <Button onClick={return_to_main}>Return to main app</Button>
            <NominationsImport set_anime_nominations={n => {
                update_nominations(n)
            }}/>
            <List>
                {nominations.map((nomination, index) =>
                    <NominationInput nomination={nomination}
                                     set_anime_nomination={(next_nomination: AnimeNomination) => {
                                         update_nominations(nominations.set(index, next_nomination))
                                     }}
                                     delete_self={() => {
                                         update_nominations(nominations.delete(index))
                                     }}
                                     key={index}/>
                )}
            </List>
            <Button onClick={_ => {
                update_nominations(nominations.push({name: "", priority: 0, genres: ImmutableList()}))
            }}>Add nomination</Button>
            <NominationExporter nominations={nominations}/>
            <PossibilitiesList combinations_generator={combinations_generator}
                               generator_has_remaining={generator_has_remaining}
                               set_generator_has_remaining={set_generator_has_remaining}
                               allowed={allowed}
                               set_allowed={set_allowed}
                               disallowed={disallowed}
                               set_disallowed={set_disallowed}
            />
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