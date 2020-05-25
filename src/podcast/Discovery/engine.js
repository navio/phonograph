import PodcastSearcher from './PodcastSearcher';

const API = "/ln/";
const SFP = new PodcastSearcher(API);


export const searchForPodcasts = function (search) {
    return new Promise(function (acc) {
        SFP.apple(search)
            .then((data) => {
                const {results} = data;
                const podcasts = results.map(podcast => {
                    const { feedUrl, artistName, artworkUrl100, trackName, genres } = podcast;
                    return {
                        title: trackName,
                        rss: feedUrl,
                        publisher: artistName,
                        thumbnail: artworkUrl100,
                        tag: genres
                    };
                });
                return acc(podcasts)
            })
            .catch(console.error);
    });
};

const URI = 'https://www.listennotes.com/c/r/';
let memory = {
    top: null,
    init: 0
}
export const getPopularPodcasts = function (query=null) {
        let data;
        if( memory && memory.top && query === null  ){
            this.setState(memory);
            return;
        }
        if(query){
            data = fetch(`/ln/best_podcasts?genre_id=${query}&page=1&region=us`).then(x=> x.json())
        } else {
            data = import("./top.json");
         }
        data
        .then(({podcasts, name }) => {
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
            this.setState(response);
         });
            // .then(({results}) => {
            //     const podcasts = results.map(podcast => {
            //         const { feedUrl, artistName, artworkUrl100, trackName, genres } = podcast;
            //         return {
            //             title: trackName,
            //             rss: feedUrl,
            //             publisher: artistName,
            //             thumbnail: artworkUrl100,
            //             tag: genres
            //         };
            //     });
            //     const response = {
            //         top: podcasts,
            //         loading: false,
            //         init: query || 0,
            //         name: 'Top'
            //     };
            //     memory = response;
            //     this.setState(response);
            // })
    };
