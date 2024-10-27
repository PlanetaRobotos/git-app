// ErrorMessage.js
import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-message">
      <span>{message}</span>
      <button onClick={onClose} className="close-button">×</button>
    </div>
  );
};

export default ErrorMessage;
