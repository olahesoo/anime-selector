import json
import os
import re
from dataclasses import dataclass
from lxml import etree

import requests


def get_mal_id_from_url(mal_url: str) -> str:
    mal_id = re.match(".*anime/(?P<anime_id>\\d+)/.*", mal_url)["anime_id"]
    return mal_id


@dataclass(frozen=True)
class AnimeContent:
    mal_id: str
    image_url: str
    title: str


def get_anime_content(mal_url: str) -> AnimeContent:
    mal_id = get_mal_id_from_url(mal_url)
    response = requests.get(mal_url)
    if response.status_code < 200 or response.status_code >= 300:
        raise RuntimeError(f"Could not fetch MAL page for {mal_url}")
    root = etree.HTML(response.text)
    title = root.xpath("//meta[@property='og:title']")[0].get("content")
    english_title_matches = root.xpath("//p[@class='title-english title-inherit']")
    english_title = english_title_matches[0].text if english_title_matches else None
    image_url = root.xpath("//meta[@property='og:image']")[0].get("content")
    return AnimeContent(
        mal_id=mal_id,
        title=english_title if english_title else title,
        image_url=image_url
    )


def get_image_extension(image_url: str) -> str:
    image_extension = re.match(".*(?P<extension>\\..*)$", image_url)["extension"]
    return image_extension


def download_image(anime_content: AnimeContent) -> None:
    existing_images = os.listdir("../public/anime_images")
    image_extension = get_image_extension(anime_content.image_url)
    if f"{anime_content.mal_id}{image_extension}" in existing_images:
        return
    response = requests.get(anime_content.image_url)
    with open(f"../public/anime_images/{anime_content.mal_id}{image_extension}", "wb") as outfile:
        outfile.write(response.content)


if __name__ == "__main__":
    anime_lists = [filename for filename in os.listdir("static") if filename.startswith("anime-list-")]
    latest_list = max(anime_lists)
    with open (f"static/{latest_list}") as anime_list:
        anime_urls = [url.strip() for url in anime_list.readlines()]
    anime_contents = [get_anime_content(anime_url) for anime_url in anime_urls]
    mal_ids = [content.mal_id for content in anime_contents]
    if len(set(mal_ids)) != len(mal_ids):
        raise RuntimeError(f"Duplicate mal_id in {anime_contents}")
    for anime_content in anime_contents:
        download_image(anime_content)
    json_content = [
        {
            "mal_id": content.mal_id,
            "title": content.title,
            "local_src": f"anime_images/{content.mal_id}{get_image_extension(content.image_url)}"
        }
        for content in anime_contents
    ]
    with open("static/anime_content.json", "w") as anime_content_file:
        json.dump(json_content, anime_content_file)
