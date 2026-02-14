import React from "react";
import Button from "@mui/material/Button";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";

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

interface NotificationsProps {
  message?: React.ReactNode;
  action?: () => void;
  label?: string;
  type?: AlertColor;
  duration?: number;
  show: boolean;
  callback?: (event?: Event | React.SyntheticEvent, reason?: SnackbarCloseReason) => void;
}

const Notifications: React.FC<NotificationsProps> & {
  types: typeof types;
  durations: typeof durations;
} = ({ message, action, label, type, duration, show, callback }) => {
  const handleClose = (event?: Event | React.SyntheticEvent, reason?: SnackbarCloseReason) => {
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

export default Notifications;
