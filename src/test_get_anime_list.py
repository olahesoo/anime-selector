import unittest
from get_anime_list import extract_mal_id_from_google_tracking_link


class GetAnimeList(unittest.TestCase):
    def test_extract_mal_id_from_google_tracking_link(self):
        tracking_link = "https://www.google.com/url?q=https://myanimelist.net/anime/30/Neon_Genesis_Evangelion&amp;sa=D&amp;source=editors&amp;ust=1692047358650457&amp;usg=AOvVaw1IX81VUuvzRpkKX31evAkx"
        self.assertEqual(extract_mal_id_from_google_tracking_link(tracking_link), "30")


if __name__ == '__main__':
    unittest.main()
