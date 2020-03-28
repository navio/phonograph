import Notifications from "../app/Notifications";

export const clearNotification = function () {
  this.setState({ showNotification: false, notification: null });
};
export const addNotification = function (message, type, duration) {
  let appDuration = duration || Notifications.durations.normal;
  let appType = type || Notifications.types.info;

  this.setState({
    showNotification: true,
    notification: { message, appType, appDuration },
  });
  setTimeout(() => clearNotification.call(this), appDuration);
};
