import React from 'react';
import './WarningModal.css'; // Add your own styles

const WarningModal = ({ message, onClose }) => {
  return (
    <div className="warning-modal">
      <div className="warning-modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default WarningModal;
