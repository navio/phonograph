import React from 'react';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { withStyles } from '@material-ui/core/styles';
import Divider from "@material-ui/core/Divider";
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
});

const eraseThisPodcast = function(domain,fn){
  return function(){
      fn(domain);
  }
}

const GeneraList = (props) =>{
  console.log(props.podcasts);
  return <Card>
          <CardContent>
            <Typography variant="headline" component="h2" >Settings</Typography>
          </CardContent>
          <List>
            <Divider />
              {props.podcasts && props.removePodcast &&
                props.podcasts.map(podcast =>
                  <div key={podcast.domain}>
                    <ListItem >
                      <ListItemText secondary={<span>{podcast.title} - {(new Date(podcast.lastUpdated).toLocaleString())}</span>} />
                      <ListItemSecondaryAction>
                        <IconButton aria-label="Delete">
                          <DeleteIcon onClick={eraseThisPodcast(podcast.domain,props.removePodcast)} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </div>
              )}
            </List>
          </Card>;
};

export default withStyles(styles)(GeneraList);