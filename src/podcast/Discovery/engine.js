import PodcastSearcher from './PodcastSearcher';

const API = "/ln/";
const SFP = new PodcastSearcher(API);


export const searchForPodcasts = function (search) {
    return new Promise(function (acc) {
        SFP.listennotes(search)
            .then((data) => acc(data.podcasts))
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
            data = import("../../../public/top.json");
         }
        data
            .then((response) => {
                const {
                    podcasts,
                    name
                } = response;
                return {podcasts, name};
            })
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
    };

// const lsName = 'topCasts';
// const seconsToRefresh = 6 * 60 * 1000;
    //   let responseSaved = JSON.parse(localStorage.getItem(lsName)) || {};
    //   const fresh = responseSaved.created + seconsToRefresh >  Date.now()
    //   console.log('aa')
    //   if (responseSaved.created && fresh ) {
    //     const {response } = responseSaved;
    //     this.setState(response);
    //     return;
    //   } else {
    //     console.log('response fetched and Saved', responseSaved)
    //     localStorage.setItem(lsName,JSON.stringify(responseSaved));
    // //   }