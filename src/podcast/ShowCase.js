import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";

const FEATURED = 'https://static.pocketcasts.com/discover/json/featured.json';

const ShowCase = (props) => {
    const { featured } = props;
    const [podcasts, setPodcasts] = useState([]);
    const [fetched, setFetched] = useState(false);
    useEffect(() => {
        if (!fetched) {
            setFetched(true)
            fetch(featured)
                .then(data => data.json())
                .then(data => data.result.podcasts)
                .then(data => { console.log(data); return data })
                .then(setPodcasts)
                .catch((err) => { console.error(err); setPodcasts([]) });
        }
    });

    return (<Card >
        {podcasts.map((cast, ins) => (
                    <Grid item xs={3} sm={2} md={1} key={ins}>
                        <Card
                            // classes={{ root: this.props.classes.card }}
                            // style={getPodcastColor(cast)}
                        >
                            {/* <div className={classes.relativeContainer}> */}
                                <CardContent >
                                    {cast.title}
                                </CardContent>
                                <CardMedia
                                    // onClick={this.getClickHandler.call(this, cast.feed_url)}
                                    domain={cast.feed_url}
                                    title={cast.title}
                                    // className={this.props.classes.podcastMedia}
                                    image={cast.thumbnail_url}
                                />
                            {/* </div> */}
                        </Card>
                    </Grid>
                ))}
    </Card>)
}

ShowCase.propTypes = {
    featured: PropTypes.string
}
ShowCase.defaultProps = {
    featured: FEATURED
}


export default ShowCase;