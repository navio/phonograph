import React from 'react';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

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
  //<img style={imageStyle} src={props.episode.itunes.image} />
  if(props.episode && props.episode.pubDate){
    date = new Date(props.episode.pubDate);
    date = date.toLocaleString();
  }
  return (
    <Card>
      <CardMedia
        overlay={<CardTitle title={props.title} subtitle={props.description} />}
      >
        <img src={props.image} alt="Logo" />
      </CardMedia>
      {props.episode &&
        (<span>
        <CardTitle title={props.episode.title} subtitle={date} />
          <CardText>
            {props.episode.content}
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
