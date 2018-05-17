import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";

const styles = {

  media: {
    paddingTop: "100%" // 16:9
  }
};

function PodcastHeader(props) {
  const { classes } = props;
  return (
      <Card>
        {props.image && <CardMedia
          className={classes.media}
          image={props.image}
          title={`Cover for ${props.title}`}
        />}
        {!props.episode &&
        <CardContent>
          <Typography variant="headline" component="h2">
            {props.title}
          </Typography>
          <Typography component="p">
          {props.description}
          </Typography>
        </CardContent>}
      </Card>
  );
}

PodcastHeader.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PodcastHeader);
