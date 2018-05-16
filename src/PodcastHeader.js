import React from 'react';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
// import Typography from '@material-ui/core/Typography';
import { clearText } from './index';
// <CardHeader
//   title="URL Avatar"
//   subtitle="Subtitle"
//   avatar="images/jsa-128.jpg"
// />

const imageStyle = {
  height: 100,
  width: 100,
  margin: 20,
  textAlign: 'center',
}

const PodcastHeader = (props) => {
  let date = null
  if (props.episode && props.episode.pubDate) {
    date = new Date(props.episode.pubDate);
    date = date.toLocaleString();
  }
  return (
    <Card>
      <CardMedia overlay={<CardTitle title={props.title} />} >
        {props.image && <img src={props.image} alt="Podcast Logo" />}
      </CardMedia>
      {props.episode &&
        (<span>
          <CardTitle title={props.episode.title} subtitle={date} />
          <CardText>
            {clearText(props.episode.content)}
          </CardText>
        </span>)
      }
    </Card>
  );
}

export default PodcastHeader;
    // { <CardActions>
    //   <FlatButton label="Action1" />
    //   <FlatButton label="Action2" />
    //  </CardActions> }