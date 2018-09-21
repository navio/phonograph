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

export const types = Object.freeze({
    success:'success',
    warning:'warning',
    error:'error',
    info:'info'
});

export const length = Object.freeze({
  short:2000,
  normal:4000,
  long:6000
})

class Notifications extends Component{
  
  constructor(props){
    super(props);
    this.state = {
      open: props.show,
    };

    this.handleClose = this.handleClose.bind(this);
    
  }

  static get types() {
    return types;
  }

  static get length() {
    return length;
  }

  handleClose(event, reason){
    this.setState({ open: false });
  };

  render(){
    const {open} = this.state;
    const {classes,message,action,label,type,duration,callback} = this.props;
    const variant = type || types.info;
    const durationTime = length[duration] || length.short;
    const Icon = variantIcon[variant];
    return (<Snackbar
      onExit={callback}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      className={classes[variant]}
      open={open}
      autoHideDuration={durationTime}
      onClose={this.handleClose}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
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
  duration: PropTypes.oneOf(Object.keys(length)),
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