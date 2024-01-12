import unittest
from bs4 import BeautifulSoup
from get_anime_list import extract_mal_id_from_google_tracking_link, AnimeInfo, parse_table_row


class GetAnimeList(unittest.TestCase):
    def test_extract_mal_id_from_google_tracking_link(self):
        tracking_link = "https://www.google.com/url?q=https://myanimelist.net/anime/30/Neon_Genesis_Evangelion&amp;sa=D&amp;source=editors&amp;ust=1692047358650457&amp;usg=AOvVaw1IX81VUuvzRpkKX31evAkx"
        self.assertEqual(extract_mal_id_from_google_tracking_link(tracking_link), "30")


class ParseTableRow(unittest.TestCase):
    def test_parse_table_row(self):
        table_row_str = ('<tr style="height: 20px"><th class="row-headers-background row-header-shim" id="0R1" '
                         'style="height: 20px;"><div class="row-header-wrapper" style="line-height: 20px">2</div></th><td '
                         'class="s1" dir="ltr"><a '
                         'href="https://www.google.com/url?q=https://myanimelist.net/anime/889/Black_Lagoon&amp;sa=D&amp'
                         ';source=; editors&amp;ust=1704915272174758&amp;usg=AOvVaw0sPRpQ93h97DsNNcadjPfy" '
                         'rel="noreferrer" target="_blank">Black Lagoon</a></td><td class="s2" dir="ltr">#568</td><td '
                         'class="s2" dir="ltr">#155</td><td class="s2" dir="ltr">12 ep - 5h (10+h /w sequels)</td><td '
                         'class="s2" dir="ltr">2006 Spring</td><td class="s2" d; ir="ltr">Manga</td><td class="s2" '
                         'dir="ltr">Action, Adventure, Drama, Thriller</td><td class="s2" dir="ltr">Crime, Guns, Seinen, '
                         'Pirates, Primarily Adult Cast, Anti-Hero, Gangs</td></tr>')
        table_row = BeautifulSoup(table_row_str, "html.parser").tr
        expected_info = AnimeInfo(
            mal_id="889",
            title="Black Lagoon",
            ranking=568,
            popularity=155,
            length="12 ep - 5h (10+h /w sequels)",
            release="2006 Spring",
            source="Manga",
            genres=["Action", "Adventure", "Drama", "Thriller"],
            tags=["Crime", "Guns", "Seinen", "Pirates", "Primarily Adult Cast", "Anti-Hero", "Gangs"]
        )
        self.assertEqual(parse_table_row(table_row), expected_info)


if __name__ == '__main__':
    unittest.main()
