curl 'https://itunes.apple.com/search?term=podcast&limit=20' > ./src/podcast/Discovery/top.json

curl 'https://listen-api.listennotes.com/api/v2/genres?top_level_only=1' \
  -H 'X-ListenAPI-Key: ee2d6e094db943d4ab41cf2f3ad0f287' > ./src/podcast/Discovery/genres.json

curl 'https://listen-api.listennotes.com/api/v2/curated_podcasts?page=2' \
  -H 'X-ListenAPI-Key: ee2d6e094db943d4ab41cf2f3ad0f287' > ./src/podcast/Discovery/curated.json