import dataclasses

import bs4.element
import requests
import re
import json
import datetime
from bs4 import BeautifulSoup
from dataclasses import dataclass


def extract_mal_id_from_google_tracking_link(tracking_link: str) -> str:
    mal_regex = "https://myanimelist\.net/anime/(?P<mal_id>\d+)"
    match = re.search(mal_regex, tracking_link)
    if not match or not match["mal_id"]:
        raise RuntimeError(f"No MAL id found in tracking link {tracking_link}")
    return match["mal_id"]


def get_mal_ids(google_sheets_url: str) -> list[str]:
    response = requests.get(google_sheets_url)

    soup = BeautifulSoup(response.content, "html.parser")
    return [
        extract_mal_id_from_google_tracking_link(link["href"])
        for link in soup.find_all("a") if link.get("rel")
    ]


@dataclass(frozen=True)
class AnimeInfo:
    mal_id: str
    title: str
    ranking: int
    popularity: int
    length: str
    release: str
    source: str
    genres: list[str]
    tags: list[str]


def parse_table_row(table_row: bs4.element.Tag) -> AnimeInfo:

    fields = table_row.find_all("td")
    return AnimeInfo(
        mal_id=extract_mal_id_from_google_tracking_link(fields[0].a["href"]),
        title=fields[0].text,
        ranking=int(fields[1].text[1:]),
        popularity=int(fields[2].text[1:]),
        length=fields[3].text,
        release=fields[4].text,
        source=fields[5].text,
        genres=fields[6].text.split(", "),
        tags=fields[7].text.split(", ")
    )


def get_anime_info(google_sheets_url: str) -> list[AnimeInfo]:
    response = requests.get(google_sheets_url)

    soup = BeautifulSoup(response.content, "html.parser")
    table_rows = [i for i in soup.find_all("tr") if i.a]

    return [parse_table_row(i) for i in table_rows]


if __name__ == "__main__":
    with open("../local_config.json") as json_file:
        google_sheets_url = json.load(json_file)["google_sheets_url"]

    date = datetime.date.today()
    with open(f"static/anime_info_{date.isoformat()}.json", "w") as anime_info_file:
        json.dump([
            dataclasses.asdict(i) for i in get_anime_info(google_sheets_url)
        ], anime_info_file)
