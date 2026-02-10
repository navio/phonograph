import PodcastSearcher from './PodcastSearcher';

const API = "/ln/";
const SFP = new PodcastSearcher(API);


export const searchForPodcasts = async function (search) {
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

    const term = encodeURIComponent(search || "");
    try {
        const data = await SFP.apple(term);
        const podcasts = normalizeApple(data);
        if (podcasts.length > 0) return podcasts;
    } catch {
        // Apple search failed, fall through to Listen Notes
    }
    try {
        const lnData = await SFP.search(term);
        return normalizeListenNotes(lnData);
    } catch {
        return [];
    }
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
        try {
            const params = new URLSearchParams({ page: '1', region: 'us' });
            if (query) params.set('genre_id', query);
            const data = await fetch(`/ln/best_podcasts?${params}`).then(x => x.json());
            const { podcasts = [], name } = data;
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
        } catch (error) {
            console.error("getPopularPodcasts failed:", error);
            return { top: [], loading: false, init: query || 0, name: null };
        }
    };
