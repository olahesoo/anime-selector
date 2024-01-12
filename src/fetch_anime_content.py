import dataclasses
import json
import os
import re

import requests
from lxml import etree

from get_anime_list import AnimeInfo


def create_mal_url(anime_info: AnimeInfo) -> str:
    return f"https://myanimelist.net/anime/{anime_info.mal_id}"


def get_anime_image(anime_info: AnimeInfo) -> str:
    mal_url = create_mal_url(anime_info)
    response = requests.get(create_mal_url(anime_info))
    if response.status_code < 200 or response.status_code >= 300:
        raise RuntimeError(f"Could not fetch MAL page for {mal_url}")
    root = etree.HTML(response.text)
    image_url = root.xpath("//meta[@property='og:image']")[0].get("content")
    image_extension = get_image_extension(image_url)
    image_name = f"{anime_info.mal_id}{image_extension}"
    download_image(image_name, image_url)
    return image_name


def get_image_extension(image_url: str) -> str:
    image_extension = re.match(".*(?P<extension>\\..*)$", image_url)["extension"]
    return image_extension


def download_image(image_name: str, image_url: str) -> None:
    existing_images = os.listdir("../public/anime_images")
    if image_name in existing_images:
        return
    response = requests.get(image_url)
    with open(f"../public/anime_images/{image_name}", "wb") as outfile:
        outfile.write(response.content)


if __name__ == "__main__":
    anime_info_lists = [filename for filename in os.listdir("static") if filename.startswith("anime_info_")]
    latest_list = max(anime_info_lists)
    with open(f"static/{latest_list}") as anime_info_file:
        anime_infos = [AnimeInfo(**i) for i in json.load(anime_info_file)]
    json_content = []
    for anime_info in anime_infos:
        image_name = get_anime_image(anime_info)
        info_dict = dataclasses.asdict(anime_info)
        info_dict["local_src"] = f"anime_images/{image_name}"
        json_content.append(info_dict)
    with open("static/anime_content.json", "w") as anime_content_file:
        json.dump(json_content, anime_content_file)
