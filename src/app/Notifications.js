import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';

import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';


const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const types = Object.freeze({
    success:'success',
    warning:'warning',
    error:'error',
    info:'info'
});

const durations = Object.freeze({
  short:2000,
  normal:4000,
  long:6000
});

class Notifications extends Component{
  
  constructor(props){
    super(props);
    this.cb = props.callback;
  }

  static get types() {
    return types;
  }

  static get durations() {
    return durations;
  }

  render(){
    const {classes,message,action,label,type,duration,callback,show} = this.props;
    const variant = type || types.info;
    const Icon = variantIcon[variant];
    const durationTime = duration || durations.normal;
    
    return (<Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      className={classes[variant]}
      open={show}
      autoHideDuration={durationTime}
      ContentProps={{'aria-describedby': 'message-id',}}
      message={<span id="message-id" className={classes.message} >
        <Icon className={classes.icon} />
        {message}
      </span>}
      action={[
        (action && <Button key="undo" color="secondary" size="small" onClick={this.handleClose}>
          {label}
        </Button>),
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={this.handleClose}
        >
          <CloseIcon />
        </IconButton>,
      ]}
    />);
  };
};

Notifications.propTypes = {
  classes: PropTypes.object.isRequired,
  message: PropTypes.node,
  action: PropTypes.func,
  label: PropTypes.string,
  type: PropTypes.oneOf(Object.keys(types)),
  duration: PropTypes.number,
  callback: PropTypes.func,
}

const notificationsStyles = theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
});

export default withStyles(notificationsStyles)(Notifications)