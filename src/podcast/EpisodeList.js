import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import timeago from 'timeago.js';
import { Consumer } from "../App.js";

// const toMinutes = time => {
//   return Math.floor(1 * time / 60) + ":" + (1 * time) % 60;
// };


export const clearText = (html) =>{
  let tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText;
}

export const styles = theme => ({
  root: {
    width: "100%"
  },
  selected:{
    backgroundColor:'aliceblue'
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
  progressContainer:{
    width: 0,
    margin: 'auto'
  }
});

const timeagoInstance = timeago();
const episodeDate = (date) => timeagoInstance.format(date);

class EpisodeList extends React.Component{
  constructor(props){
    super();
    window && window.scrollTo && window.scrollTo(0, 0)
  }

  render(){
    let props = this.props;
    let { classes } = this.props;
    return (
    <Consumer>
      { (state) =>
      <div className={classes.root}>
        <Card>
          { props.episodes ? <List>
            { props.episodes.map(episode => (
                <div key={episode.guid}>
                  <ListItem className={(state.playing === episode.guid ? classes.selected : null)}
                    button
                    onClick={props.handler}
                    data-guid={episode.guid}
                  >
                  {( props.playing === episode.guid && props.status !== 'pause' ) ?
                <PauseIcon className={classes.playIcon} /> :
                <PlayArrowIcon className={classes.playIcon} />
              }
                    <ListItemText
                      primary={(<Typography component="span" variant="subheading" noWrap>
                                {clearText(episode.title)} <Typography component="span" >{episodeDate(episode.created)}</Typography>
                              </Typography>)}
                      secondary={<Typography component="span" color="textSecondary" noWrap >{clearText(JSON.stringify(episode.description))}</Typography>}
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
          </List>: <div className={classes.progressContainer}><CircularProgress className={classes.progress} /></div>}
        </Card>
      </div>}
    </Consumer>
    );
  }
};

EpisodeList.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EpisodeList);
