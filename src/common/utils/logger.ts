import Alert from '../components/Alert';

const logErr = (error: any) => {
  // const stack = new Error().stack;
  // console.error(stack.split("\n")[2].trim());

  if (error.response) {
    if (error.response.data) {
      if (error.response.data.errorDescription) {
        console.error('Logger 1: ', error.response.data.errorDescription);
        return Alert.triggerShowAlert(
          error.response.data.errorDescription,
          'error',
          () => Alert.triggerHideAlert(),
        );
      } else if (error.response.data.message) {
        console.error('Logger 2: ', error.response.data.message);
        return Alert.triggerShowAlert(
          error.response.data.message,
          'error',
          () => Alert.triggerHideAlert(),
        );
      } else {
        console.error('Logger 3: ', error.response.data);
        if (typeof error.response.data === 'string') {
          return Alert.triggerShowAlert(error.response.data, 'error', () =>
            Alert.triggerHideAlert(),
          );
        } else {
          return Alert.triggerShowAlert(
            'Oops! Looks like there was an error! Please try again.',
            'error',
            () => Alert.triggerHideAlert(),
          );
        }
      }
    } else {
      console.error('Logger 4: ', error.response);
      if (typeof error.response === 'string') {
        return Alert.triggerShowAlert(error.response, 'error', () =>
          Alert.triggerHideAlert(),
        );
      } else {
        return Alert.triggerShowAlert(
          'Oops! Looks like there was an error! Please try again.',
          'error',
          () => Alert.triggerHideAlert(),
        );
      }
    }
  } else {
    console.error('Logger 5: ', error);
    if (typeof error === 'string') {
      return Alert.triggerShowAlert(error, 'error', () =>
        Alert.triggerHideAlert(),
      );
    } else {
      return Alert.triggerShowAlert(
        'Oops! Looks like there was an error! Please try again.',
        'error',
        () => Alert.triggerHideAlert(),
      );
    }
  }
};

const logAlert = (
  message: string,
  callback?: () => void,
  onCancel?: () => void,
  confirmText?: string,
  cancelText?: string,
) => {
  return Alert.triggerShowAlert(
    message,
    'alert',
    callback,
    onCancel,
    confirmText,
    cancelText,
  );
};

const logSuccess = (message: string, onClick: any = () => {}) => {
  return Alert.triggerShowAlert(message, 'success', onClick);
};

export { logErr, logAlert, logSuccess };
