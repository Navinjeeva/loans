class Alert {
  showAlert:
    | ((
        message: string,
        type?: string,
        onConfirm?: () => void,
        onCancel?: () => void,
        confirmText?: string,
        cancelText?: string
      ) => void)
    | null = null;

  hideAlert: (() => void) | null = null;

  register(
    showAlertFunction: (
      message: string,
      type?: string,
      onConfirm?: () => void,
      onCancel?: () => void
    ) => void
  ) {
    this.showAlert = showAlertFunction;
  }

  triggerShowAlert(
    message: string,
    type?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string
  ) {
    if (this.showAlert) {
      this.showAlert(
        message,
        type,
        onConfirm,
        onCancel,
        confirmText,
        cancelText
      );
    }
  }

  triggerHideAlert() {
    if (this.hideAlert) {
      this.hideAlert();
    }
  }
}

// Export a singleton instance of AlertService
export default new Alert();
