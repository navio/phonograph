import PodcastSearcher from './PodcastSearcher';

const API = "/ln/";
const SFP = new PodcastSearcher(API);


export const searchForPodcasts = function (search) {
    const normalizeApple = (data = {}) => {
        const { results = [] } = data;
        return results
            .filter((podcast) => podcast && podcast.feedUrl)
            .map((podcast) => {
                const { feedUrl, artistName, artworkUrl100, trackName, genres } = podcast;
                return {
                    title: trackName,
                    rss: feedUrl,
                    publisher: artistName,
                    thumbnail: artworkUrl100,
                    tag: genres
                };
            });
    };

    const normalizeListenNotes = (data = {}) => {
        const { results = [] } = data;
        return results
            .filter((podcast) => podcast && podcast.rss)
            .map((podcast) => {
                const { rss, publisher_original, title_original, thumbnail, genre_ids } = podcast;
                return {
                    title: title_original,
                    rss,
                    publisher: publisher_original,
                    thumbnail,
                    tag: genre_ids
                };
            });
    };

    return new Promise(function (acc) {
        const term = encodeURIComponent(search || "");
        SFP.apple(term)
            .then((data) => {
                const podcasts = normalizeApple(data);
                if (podcasts.length > 0) return acc(podcasts);
                return SFP.search(term)
                    .then((lnData) => acc(normalizeListenNotes(lnData)))
                    .catch(() => acc([]));
            })
            .catch(() => {
                SFP.search(term)
                    .then((lnData) => acc(normalizeListenNotes(lnData)))
                    .catch(() => acc([]));
            });
    });
};

const URI = 'https://www.listennotes.com/c/r/';
let memory = {
    top: null,
    init: 0
}
export const getPopularPodcasts = async function (query=null) {
        if( memory && memory.top && query === null  ){
            return memory;
        }
        let data;
        if(query){
            data = fetch(`/ln/best_podcasts?genre_id=${query}&page=1&region=us`).then(x=> x.json())
        } else {
            data = import("./top.json");
         }
        const {podcasts, name } = await data;
        const cleanedCasts = podcasts.map((podcast, num) => {
            const {
                title,
                domain,
                thumbnail,
                description,
                id,
                total_episodes: episodes,
                earliest_pub_date_ms: startDate,
                publisher,
            } = podcast;
            const rss = `${URI}${id}`;
            return {
                title: `${num + 1}. ${title}`,
                thumbnail,
                domain,
                description,
                rss,
                episodes,
                startDate,
                publisher,
            };
        });
        const response = {
            top: cleanedCasts,
            loading: false,
            init: query || 0,
            name
        };
        memory = response;
        return response;
    };
