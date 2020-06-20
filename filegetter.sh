# set APITOKEN = listennotes
echo $LISTENNOTES;
echo "X-ListenAPI-Key: $LISTENNOTES";
curl 'https://listen-api.listennotes.com/api/v2/best_podcasts?region=us&safe_mode=0' \
  -H "X-ListenAPI-Key: $LISTENNOTES" > ./src/podcast/Discovery/top.json

curl 'https://listen-api.listennotes.com/api/v2/genres?top_level_only=1' \
  -H "X-ListenAPI-Key: $LISTENNOTES" > ./src/podcast/Discovery/genres.json

curl 'https://listen-api.listennotes.com/api/v2/curated_podcasts?page=2' \
  -H "X-ListenAPI-Key: $LISTENNOTES" > ./src/podcast/Discovery/curated.json