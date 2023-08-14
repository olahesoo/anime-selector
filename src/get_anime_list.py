import requests
import re
import json
import datetime
from bs4 import BeautifulSoup


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


if __name__ == "__main__":
    with open("../local_config.json") as json_file:
        google_sheets_url = json.load(json_file)["google_sheets_url"]

    mal_ids = get_mal_ids(google_sheets_url)

    date = datetime.date.today()
    with open(f"static/anime_list_{date.isoformat()}", "w") as anime_list_file:
        anime_list_file.write("\n".join(mal_ids))
