import { useState } from "react";

export function useNotification() {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success", duration = 3000) => {
    setNotification({ message, type });

    if (duration > 0) {
      setTimeout(() => {
        setNotification(null);
      }, duration);
    }
  };

  const showSuccess = (message, duration = 3000) => {
    showNotification(message, "success", duration);
  };

  const showError = (message, duration = 3000) => {
    showNotification(message, "error", duration);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    hideNotification,
  };
}
