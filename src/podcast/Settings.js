import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { withStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

const styles = (theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
});

const eraseThisPodcast = function (domain, fn) {
  return function () {
    fn(domain);
  };
};

const GeneraList = (props) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" component="h2">
          Settings
        </Typography>
      </CardContent>
      <List>
        <Divider />
        {props.podcasts &&
          props.removePodcast &&
          props.podcasts.map((podcast) => (
            <div key={podcast.domain}>
              <ListItem>
                <ListItemText
                  secondary={
                    <Typography component="span" variant="subtitle1">
                      {podcast.title} <br />
                      <Typography component="span" variant="caption">
                        {new Date(podcast.created).toLocaleString()}
                      </Typography>
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton aria-label="Delete"
                    onClick={eraseThisPodcast(
                      podcast.domain,
                      props.removePodcast
                    )}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </div>
          ))}
      </List>
    </Card>
  );
};

export default withStyles(styles)(GeneraList);
