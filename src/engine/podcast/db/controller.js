import DB from "./db";

export const add = function (podcast) {
	DB.set(podcast.domain, {
			...podcast,
			lastUpdated: (Date.now())
		})
		.then(() => {
			let podcasts = this.state.podcasts;
			podcast.items = podcast.items.slice(0, 20);
			podcasts.push(podcast);
			this.setState({
				podcasts
			});
		});
}

export const remove = function (cast) {
	DB.del(cast)
		.then(() => {
			let podcastsState = this.state.podcasts;
			let podcasts = podcastsState.filter(podcast => podcast.domain !== cast);
			this.setState({
				podcasts
			})
		});
}