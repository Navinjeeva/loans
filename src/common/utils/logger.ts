import Alert from "../components/Alert";

const logErr = (error: any, customCallback?: () => void) => {
  // Determine what the callback should be
  const onClick = customCallback || (() => Alert.triggerHideAlert());

  // Handle specific HTTP status codes first
  if (error.response && error.response.status) {
    const statusMessages: { [key: number]: string } = {
      501: "This feature isn't ready yet. Please check back soon.",
      502: "Something went wrong on our side. Please try again in a moment.",
      503: "We're a bit busy right now. Please try again shortly.",
      504: "It's taking longer than expected. Please try again soon.",
      505: "We're having a small issue completing your request. Please try again.",
      506: "Oops, that didn't work as planned. Please try again later.",
      507: "We're running into a temporary issue. Please try again shortly.",
      508: "We hit a small snag. Please try again in a little while.",
      510: "We couldn't finish that request. Please try again later.",
      511: "Please sign in or unlock your access to continue.",
      520: "We're having a small issue completing your request. Please try again.",
    };

    if (statusMessages[error.response.status]) {
      console.error(
        "Logger Status " +
          error.response.status +
          ": " +
          statusMessages[error.response.status],
        statusMessages[error.response.status]
      );
      return Alert.triggerShowAlert(
        statusMessages[error.response.status],
        "note",
        onClick
      );
    }
  }

  if (error.response) {
    if (error.response.data) {
      if (error.response.data.errorDescription) {
        console.error("Logger 1: ", error.response.data.errorDescription);
        return Alert.triggerShowAlert(
          error.response.data.errorDescription,
          "note",
          onClick
        );
      } else if (error.response.data.errorMessage) {
        console.error("Logger 2: ", error.response.data.errorMessage);
        return Alert.triggerShowAlert(
          error.response.data.errorMessage,
          "note",
          onClick
        );
      } else if (error.response.data.message) {
        console.error("Logger 2: ", error.response.data.message);
        return Alert.triggerShowAlert(
          error.response.data.message,
          "note",
          onClick
        );
      } else {
        console.error("Logger 3: ", error.response.data);
        if (typeof error.response.data === "string") {
          return Alert.triggerShowAlert(error.response.data, "note", onClick);
        } else {
          return Alert.triggerShowAlert(
            "Oops! Looks like there was an error! Please try again.",
            "note",
            onClick
          );
        }
      }
    } else {
      console.error("Logger 4: ", error.response);
      if (typeof error.response === "string") {
        return Alert.triggerShowAlert(error.response, "note", onClick);
      } else {
        return Alert.triggerShowAlert(
          "Oops! Looks like there was an error! Please try again.",
          "note",
          onClick
        );
      }
    }
  } else {
    console.error("Logger 5: ", error);
    if (typeof error === "string") {
      return Alert.triggerShowAlert(error, "note", onClick);
    } else {
      return Alert.triggerShowAlert(
        "Oops! Looks like there was an error! Please try again.",
        "note",
        onClick
      );
    }
  }
};

const logAlert = (
  message: string,
  callback?: () => void,
  onCancel?: () => void,
  confirmText?: string,
  cancelText?: string
) => {
  return Alert.triggerShowAlert(
    message,
    "alert",
    callback,
    onCancel,
    confirmText,
    cancelText
  );
};

const logSuccess = (message: string, onClick: any = () => {}) => {
  return Alert.triggerShowAlert(message, "success", onClick);
};

export { logErr, logAlert, logSuccess };
