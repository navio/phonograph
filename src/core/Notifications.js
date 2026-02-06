import React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const types = Object.freeze({
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
});

const durations = Object.freeze({
  short: 2000,
  normal: 4000,
  long: 6000,
});

const Notifications = ({ message, action, label, type, duration, show, callback }) => {
  const handleClose = (event, reason) => {
    if (callback) {
      callback(event, reason);
    }
  };

  const variant = type || types.info;
  const durationTime = duration || durations.normal;

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      open={show}
      autoHideDuration={durationTime}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={variant}
        variant="filled"
        action={
          action ? (
            <Button
              key="undo"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              {label}
            </Button>
          ) : null
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

Notifications.types = types;
Notifications.durations = durations;

Notifications.propTypes = {
  message: PropTypes.node,
  action: PropTypes.func,
  label: PropTypes.string,
  type: PropTypes.oneOf(Object.keys(types)),
  duration: PropTypes.number,
  callback: PropTypes.func,
};

export default Notifications;
