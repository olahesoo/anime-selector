import unittest
from fetch_anime_content import AnimeContent, get_mal_id_from_url, get_anime_content, get_image_extension


class FetchAnimeContent(unittest.TestCase):
    def test_get_mal_id_from_full_url(self):
        mal_url = "https://myanimelist.net/anime/30/Neon_Genesis_Evangelion"
        expected_id = "30"
        actual_id = get_mal_id_from_url(mal_url)
        self.assertEqual(expected_id, actual_id)

    def test_get_mal_id_from_partial_url(self):
        mal_url = "https://myanimelist.net/anime/30"
        expected_id = "30"
        actual_id = get_mal_id_from_url(mal_url)
        self.assertEqual(expected_id, actual_id)

    def test_mal_fetch_no_english_title(self):
        mal_url = "https://myanimelist.net/anime/30/Neon_Genesis_Evangelion"
        expected_content = AnimeContent(
            mal_id="30",
            title="Neon Genesis Evangelion",
            image_url="https://cdn.myanimelist.net/images/anime/1314/108941.jpg"
        )
        actual_content = get_anime_content(mal_url)
        self.assertEqual(expected_content, actual_content)

    def test_mal_fetch_english_title(self):
        mal_url = "https://myanimelist.net/anime/323/Mousou_Dairinin"
        expected_content = AnimeContent(
            mal_id="323",
            title="Paranoia Agent",
            image_url="https://cdn.myanimelist.net/images/anime/7/10240.jpg"
        )
        actual_content = get_anime_content(mal_url)
        self.assertEqual(expected_content, actual_content)

    def test_get_image_extension(self):
        mal_url = "https://cdn.myanimelist.net/images/anime/1314/108941.jpg"
        expected_extension = ".jpg"
        actual_extension = get_image_extension(mal_url)
        self.assertEqual(expected_extension, actual_extension)


if __name__ == '__main__':
    unittest.main()
