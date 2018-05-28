let parser = new DOMParser();
fetch("https://player.netlify.com/rss/www.npr.org/rss/podcast.php?id=510318")
	.then(data => data.text())
	.then(XMLData => {
        const XML = parser.parseFromString(XMLData, "text/xml");
        window.xml = XML;
		// console.log(JS)
	});