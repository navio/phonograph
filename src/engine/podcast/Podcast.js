export default class Podcast {
	constructor(podcast) {
		this.podcast = podcast || null;
	}
	get() {
		return this.podcast;
	}

	set(podcast) {
		this.podcast = podcast;
	}

	clear() {
		this.podcast = null;
	}
}