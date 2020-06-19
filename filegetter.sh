set APITOKEN = listennotes
curl 'https://listen-api.listennotes.com/api/v2/best_podcasts?region=us&safe_mode=0' \
  -H 'X-ListenAPI-Key: $listennotes' > ./src/podcast/Discovery/top.json

curl 'https://listen-api.listennotes.com/api/v2/genres?top_level_only=1' \
  -H 'X-ListenAPI-Key: $listennotes' > ./src/podcast/Discovery/genres.json

curl 'https://listen-api.listennotes.com/api/v2/curated_podcasts?page=2' \
  -H 'X-ListenAPI-Key: $listennotes' > ./src/podcast/Discovery/curated.json