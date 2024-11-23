"use client";
import { useState, useEffect } from "react";

interface ErrorMessageProps {
  message: string | null;
  timeout?: number;
  onDismiss?: () => void;
}

const ErrorMessage = ({
  message,
  timeout = 5000,
  onDismiss,
}: ErrorMessageProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [message, timeout, onDismiss]);

  if (!message || !isVisible) return null;

  return <div className="error-message-container">{message}</div>;
};

export default ErrorMessage;
